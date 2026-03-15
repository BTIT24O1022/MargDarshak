const Delivery = require("../models/Delivery");
const { computePriorityScore, rankDeliveries, WEIGHTS } = require("../services/priorityAIService");
const { fetchWeather } = require("../services/weatherService");
const { getBestZone }  = require("../services/parkingAIService");
const { getIO }        = require("../config/socket");

// ── GET /api/ai/priority ──────────────────────────────────────────────────────
// Returns all pending deliveries sorted by AI priority score
exports.getPriorityQueue = async (req, res, next) => {
  try {
    const weather   = await fetchWeather();
    const pending   = await Delivery.find({ status: { $in: ["pending", "assigned"] } }).lean();

    const context = {
      weatherSeverity: weather.severity,
      trafficFactor:   1 + Math.random() * 0.5,
      driverWorkload:  0.5,
    };

    const ranked = rankDeliveries(pending, context);

    res.json({
      success: true,
      data:    ranked,
      context: { weather: { condition: weather.condition, severity: weather.severity }, weights: WEIGHTS },
      ts:      new Date(),
    });
  } catch (err) { next(err); }
};

// ── POST /api/ai/priority/recalculate ────────────────────────────────────────
// Manual trigger — matches the "RECALCULATE" button in the UI
exports.recalculate = async (req, res, next) => {
  try {
    const weather  = await fetchWeather();
    const pending  = await Delivery.find({ status: { $in: ["pending", "assigned"] } }).lean();

    const context = {
      weatherSeverity: weather.severity,
      trafficFactor:   1 + Math.random() * 0.8,
      driverWorkload:  req.body.driverWorkload || 0.5,
    };

    const ranked = rankDeliveries(pending, context);

    // Persist updated scores
    const ops = ranked.map((d) => ({
      updateOne: {
        filter: { _id: d._id },
        update: { $set: { priorityScore: d.priorityScore, riskLevel: d.riskLevel } },
      },
    }));
    if (ops.length) await Delivery.bulkWrite(ops);

    // Broadcast to all connected clients
    try {
      const io = getIO();
      io.emit("ai:score:update", {
        scores:    ranked.map((d) => ({ id: d._id, orderId: d.orderId, score: d.priorityScore, risk: d.riskLevel })),
        context,
        recalcAt:  new Date(),
      });
    } catch { /* socket not ready */ }

    res.json({
      success:   true,
      message:   `Recalculated ${ranked.length} deliveries`,
      data:      ranked,
      context,
      weights:   WEIGHTS,
    });
  } catch (err) { next(err); }
};

// ── POST /api/ai/priority/score ───────────────────────────────────────────────
// Score a single delivery object (useful for new delivery preview)
exports.scoreDelivery = async (req, res, next) => {
  try {
    const weather = await fetchWeather();
    const context = {
      weatherSeverity: weather.severity,
      trafficFactor:   req.body.trafficFactor   || 1,
      driverWorkload:  req.body.driverWorkload   || 0.5,
    };
    const result = computePriorityScore(req.body, context);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ── GET /api/ai/route-suggestion/:deliveryId ──────────────────────────────────
// Suggests best vehicle type + parking zone for a delivery
exports.getRouteSuggestion = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

    const weather = await fetchWeather();

    // Simple vehicle type recommendation based on weight
    let recommendedType = "bike";
    if (delivery.weightKg > 15) recommendedType = "truck";
    else if (delivery.weightKg > 5) recommendedType = "van";
    else if (delivery.weightKg > 1) recommendedType = "scooter";

    const bestParking = await getBestZone(delivery.customer.lat, delivery.customer.lng, recommendedType);

    const etaAdjusted = delivery.etaMinutes + weather.etaAdjustmentMin;

    res.json({
      success: true,
      data: {
        recommendedVehicleType: recommendedType,
        etaMinutes:             etaAdjusted,
        weatherWarning:         weather.routingWarning,
        droneSafe:              weather.droneSafe,
        bestParkingZone:        bestParking,
        suggestion:             `Use a ${recommendedType} — ETA ~${etaAdjusted} min${weather.routingWarning ? " (weather adjusted)" : ""}`,
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/ai/weights ───────────────────────────────────────────────────────
exports.getWeights = (_req, res) => {
  res.json({ success: true, data: WEIGHTS });
};