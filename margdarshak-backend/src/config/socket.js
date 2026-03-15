/**
 * Socket.IO — Real-time layer
 *
 * Events emitted TO clients:
 *  vehicle:update        — position/telemetry for a specific vehicle
 *  fleet:snapshot        — full fleet positions (broadcast every 3s)
 *  delivery:status       — delivery state change
 *  alert:new             — new AI-generated alert
 *  ai:score:update       — priority score recalculated
 *  weather:update        — live weather change
 *  parking:update        — parking availability change
 *  dashboard:stats       — KPI stats refresh
 *
 * Events received FROM clients:
 *  vehicle:telemetry     — driver app pushes GPS / battery / speed
 *  delivery:confirm      — driver confirms arrival
 *  subscribe:vehicle     — subscribe to a specific vehicle's stream
 */

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { generateFleetSnapshot } = require("../services/telemetryService");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // ── Auth middleware for sockets ──────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id} | user: ${socket.user?.id}`);

    // Join user's personal room
    socket.join(`user:${socket.user.id}`);

    // Subscribe to a specific vehicle stream
    socket.on("subscribe:vehicle", (vehicleId) => {
      socket.join(`vehicle:${vehicleId}`);
      logger.info(`Socket ${socket.id} subscribed to vehicle:${vehicleId}`);
    });

    // Driver pushes telemetry (GPS, battery, speed, load)
    socket.on("vehicle:telemetry", async (data) => {
      try {
        const { vehicleId, lat, lng, speed, battery, load, heading } = data;
        // Broadcast to everyone watching this vehicle
        io.to(`vehicle:${vehicleId}`).emit("vehicle:update", {
          vehicleId, lat, lng, speed, battery, load, heading,
          ts: new Date(),
        });
        // Also broadcast to fleet-level room
        io.to("fleet").emit("vehicle:update", {
          vehicleId, lat, lng, speed, battery, load, heading, ts: new Date(),
        });
      } catch (err) {
        logger.error("Telemetry error:", err.message);
      }
    });

    // Driver confirms arrival at a stop
    socket.on("delivery:confirm", async ({ deliveryId }) => {
      io.emit("delivery:status", {
        deliveryId,
        status: "delivered",
        confirmedAt: new Date(),
        confirmedBy: socket.user.id,
      });
    });

    socket.on("join:fleet", () => socket.join("fleet"));
    socket.on("leave:fleet", () => socket.leave("fleet"));

    socket.on("disconnect", () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // ── Broadcast fleet snapshot every 3 seconds ─────────────────────────────────
  setInterval(async () => {
    try {
      const snapshot = await generateFleetSnapshot();
      io.to("fleet").emit("fleet:snapshot", snapshot);
    } catch { /* non-fatal */ }
  }, 3000);

  logger.info("🔌 Socket.IO initialized");
  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

module.exports = { initSocket, getIO };