/**
 * MargDarshak — Main Server
 * Team Error 404
 */

require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");

const app = require("./app");
const { connectDB } = require("./config/db");
const { initSocket } = require("./config/socket");
const { startCronJobs } = require("./utils/cronJobs");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

async function bootstrap() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Create HTTP server (needed for Socket.IO)
  const server = http.createServer(app);

  // 3. Initialize Socket.IO
  initSocket(server);

  // 4. Start background cron jobs (AI scoring, telemetry, weather refresh)
  startCronJobs();

  // 5. Start listening
  server.listen(PORT, () => {
    logger.info(`🚀 MargDarshak API running on port ${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`📡 WebSocket server ready`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received — shutting down gracefully");
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  });
}

bootstrap().catch((err) => {
  logger.error("Fatal startup error:", err);
  process.exit(1);
});