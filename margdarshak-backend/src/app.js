/**
 * MargDarshak — Express Application
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const logger = require("./utils/logger");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// ── Route imports ──────────────────────────────────────────────────────────────
const authRoutes       = require("./routes/authRoutes");
const vehicleRoutes    = require("./routes/vehicleRoutes");
const driverRoutes     = require("./routes/driverRoutes");
const deliveryRoutes   = require("./routes/deliveryRoutes");
const dashboardRoutes  = require("./routes/dashboardRoutes");
const analyticsRoutes  = require("./routes/analyticsRoutes");
const aiRoutes         = require("./routes/aiRoutes");
const weatherRoutes    = require("./routes/weatherRoutes");
const parkingRoutes    = require("./routes/parkingRoutes");
const alertRoutes      = require("./routes/alertRoutes");
const reportRoutes     = require("./routes/reportRoutes");

const app = express();

// ── Security & basics ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173","http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan("combined", {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: () => process.env.NODE_ENV === "test",
}));

// ── Global rate limiter ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", globalLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "MargDarshak API", version: "1.4.0", timestamp: new Date() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/vehicles",   vehicleRoutes);
app.use("/api/drivers",    driverRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/dashboard",  dashboardRoutes);
app.use("/api/analytics",  analyticsRoutes);
app.use("/api/ai",         aiRoutes);
app.use("/api/weather",    weatherRoutes);
app.use("/api/parking",    parkingRoutes);
app.use("/api/alerts",     alertRoutes);
app.use("/api/reports",    reportRoutes);

// ── Error handlers ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;