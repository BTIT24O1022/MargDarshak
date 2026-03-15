/**
 * Background Cron Jobs
 *
 * Schedule overview:
 *  Every 5  min  — refresh weather cache + recompute ETAs
 *  Every 3  min  — re-score all pending deliveries with Priority AI
 *  Every 1  min  — generate AI alerts (traffic, battery, risk)
 *  Every 15 min  — update parking zone predictions
 *  Daily midnight — reset per-vehicle / per-driver daily counters
 */

const cron     = require("node-cron");
const logger   = require("./logger");

const { fetchWeather, invalidateCache } = require("../services/weatherService");
const { rankDeliveries }                = require("../services/priorityAIService");
const { getParkingStatus }              = require("../services/parkingAIService");
const Delivery   = require("../models/Delivery");
const Vehicle    = require("../models/Vehicle");
const Driver     = require("../models/Driver");
const Alert      = require("../models/Alert");

let _io = null; // set after socket init

function setIO(io) { _io = io; }

// ── helper: emit if socket ready ──────────────────────────────────────────────
function broadcast(event, data) {
  if (_io) _io.emit(event, data);
}

// ── 1. Weather refresh (every 5 min) ─────────────────────────────────────────
async function refreshWeather() {
  try {
    invalidateCache();
    const weather = await fetchWeather();
    broadcast("weather:update", weather);
    logger.info(`[CRON] Weather refreshed — severity: ${weather.severity}`);
  } catch (err) {
    logger.error(`[CRON] Weather refresh failed: ${err.message}`);
  }
}

// ── 2. Re-score pending deliveries (every 3 min) ──────────────────────────────
async function rescoreDeliveries() {
  try {
    const weather  = await fetchWeather();
    const pending  = await Delivery.find({ status: { $in: ["pending", "assigned"] } }).lean();
    if (!pending.length) return;

    const context = {
      weatherSeverity: weather.severity,
      trafficFactor:   1 + Math.random() * 0.8, // TODO: replace with real traffic API
      driverWorkload:  0.5,
    };

    const ranked = rankDeliveries(pending, context);

    // Bulk update scores
    const ops = ranked.map((d) => ({
      updateOne: {
        filter: { _id: d._id },
        update: { $set: { priorityScore: d.priorityScore, riskLevel: d.riskLevel } },
      },
    }));
    await Delivery.bulkWrite(ops);

    broadcast("ai:score:update", {
      scores: ranked.map((d) => ({ id: d._id, orderId: d.orderId, score: d.priorityScore, risk: d.riskLevel })),
      recalcAt: new Date(),
    });
    logger.info(`[CRON] Re-scored ${ranked.length} deliveries`);
  } catch (err) {
    logger.error(`[CRON] Delivery re-scoring failed: ${err.message}`);
  }
}

// ── 3. AI alert generation (every 1 min) ─────────────────────────────────────
async function generateAlerts() {
  try {
    const newAlerts = [];

    // Battery warnings
    const lowBattery = await Vehicle.find({ "telemetry.battery": { $lt: 20 }, status: "active" });
    for (const v of lowBattery) {
      const existing = await Alert.findOne({ vehicleId: v._id, type: "battery", isRead: false });
      if (!existing) {
        newAlerts.push({
          type: "battery", severity: "warning", icon: "🔋",
          message: `${v.vehicleCode} battery critical at ${v.telemetry.battery}% — return to depot soon`,
          color: "#ef4444", vehicleId: v._id,
        });
      }
    }

    // Weather alert if severe
    const weather = await fetchWeather();
    if (weather.severity > 0.6) {
      const existing = await Alert.findOne({ type: "weather", createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) } });
      if (!existing) {
        newAlerts.push({
          type: "weather", severity: "critical", icon: "🌧",
          message: `${weather.condition} — ETA +${weather.etaAdjustmentMin} min · Safety-First routing active`,
          color: "#3b82f6",
        });
      }
    }

    // High-risk deliveries with multiple failed attempts
    const highRisk = await Delivery.find({ attempts: { $gte: 2 }, status: "pending" });
    for (const d of highRisk) {
      const existing = await Alert.findOne({ deliveryId: d._id, type: "ai_suggestion", isRead: false });
      if (!existing) {
        newAlerts.push({
          type: "ai_suggestion", severity: "warning", icon: "🧠",
          message: `AI: ${d.orderId} has ${d.attempts} failed attempts — consider reassignment`,
          color: "#a78bfa", deliveryId: d._id,
        });
      }
    }

    if (newAlerts.length) {
      const saved = await Alert.insertMany(newAlerts);
      for (const alert of saved) {
        broadcast("alert:new", alert);
      }
      logger.info(`[CRON] Generated ${newAlerts.length} new alert(s)`);
    }
  } catch (err) {
    logger.error(`[CRON] Alert generation failed: ${err.message}`);
  }
}

// ── 4. Parking update (every 15 min) ─────────────────────────────────────────
async function updateParking() {
  try {
    const zones = await getParkingStatus();
    broadcast("parking:update", { zones, updatedAt: new Date() });
    logger.info(`[CRON] Parking updated — ${zones.length} zones`);
  } catch (err) {
    logger.error(`[CRON] Parking update failed: ${err.message}`);
  }
}

// ── 5. Midnight daily reset ───────────────────────────────────────────────────
async function dailyReset() {
  try {
    await Vehicle.updateMany({}, { $set: { deliveriesToday: 0 } });
    await Driver.updateMany({}, { $set: { "stats.deliveriesToday": 0, "stats.earningsToday": 0 } });
    logger.info("[CRON] Daily counters reset");
  } catch (err) {
    logger.error(`[CRON] Daily reset failed: ${err.message}`);
  }
}

// ── Register all cron jobs ────────────────────────────────────────────────────
function startCronJobs() {
  cron.schedule("*/5 * * * *",   refreshWeather,    { name: "weather-refresh"    });
  cron.schedule("*/3 * * * *",   rescoreDeliveries, { name: "ai-rescore"         });
  cron.schedule("* * * * *",     generateAlerts,    { name: "alert-generation"   });
  cron.schedule("*/15 * * * *",  updateParking,     { name: "parking-update"     });
  cron.schedule("0 0 * * *",     dailyReset,        { name: "daily-reset"        });

  logger.info("⏰ Cron jobs registered: weather(5m), AI-rescore(3m), alerts(1m), parking(15m), daily-reset(midnight)");
}

module.exports = { startCronJobs, setIO };