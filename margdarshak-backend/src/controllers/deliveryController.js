const Delivery = require("../models/Delivery");
const Driver   = require("../models/Driver");
const Vehicle  = require("../models/Vehicle");
const { computePriorityScore }  = require("../services/priorityAIService");
const { fetchWeather }          = require("../services/weatherService");
const { getIO }                 = require("../config/socket");

// ── GET /api/deliveries ───────────────────────────────────────────────────────
exports.getAllDeliveries = async (req, res, next) => {
  try {
    const { status, urgency, sortBy = "priorityScore", page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status)  filter.status  = status;
    if (urgency) filter.urgency = urgency;

    const sortMap = {
      priorityScore: { priorityScore: -1 },
      eta:           { etaMinutes: 1 },
      distance:      { distanceKm: 1 },
      profit:        { estimatedProfit: -1 },
      risk:          { riskLevel: 1 },
    };

    const [deliveries, total] = await Promise.all([
      Delivery.find(filter)
        .sort(sortMap[sortBy] || { priorityScore: -1 })
        .populate("vehicleId", "vehicleCode type")
        .populate("driverId",  "name phone")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Delivery.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), data: deliveries });
  } catch (err) { next(err); }
};

// ── GET /api/deliveries/:id ───────────────────────────────────────────────────
exports.getDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate("vehicleId", "vehicleCode type status telemetry")
      .populate("driverId",  "name phone status");
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    res.json({ success: true, data: delivery });
  } catch (err) { next(err); }
};

// ── POST /api/deliveries ──────────────────────────────────────────────────────
exports.createDelivery = async (req, res, next) => {
  try {
    const weather  = await fetchWeather();
    const delivery = new Delivery(req.body);

    // Auto-generate orderId if not provided
    if (!delivery.orderId) {
      const count = await Delivery.countDocuments();
      delivery.orderId = `DEL-${String(count + 1001).padStart(4, "0")}`;
    }

    // Compute initial priority score
    const { score, riskLevel } = computePriorityScore(delivery, {
      weatherSeverity: weather.severity,
      trafficFactor: 1,
      driverWorkload: 0.5,
    });
    delivery.priorityScore = score;
    delivery.riskLevel     = riskLevel;

    await delivery.save();
    res.status(201).json({ success: true, data: delivery });
  } catch (err) { next(err); }
};

// ── PUT /api/deliveries/:id ───────────────────────────────────────────────────
exports.updateDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    res.json({ success: true, data: delivery });
  } catch (err) { next(err); }
};

// ── POST /api/deliveries/:id/dispatch ────────────────────────────────────────
exports.dispatchDelivery = async (req, res, next) => {
  try {
    const { vehicleId, driverId } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    if (!["pending", "assigned"].includes(delivery.status))
      return res.status(400).json({ success: false, message: "Delivery cannot be dispatched in current status" });

    delivery.vehicleId  = vehicleId;
    delivery.driverId   = driverId;
    delivery.status     = "assigned";
    delivery.pickedUpAt = new Date();
    await delivery.save();

    // Increment vehicle delivery counter
    await Vehicle.findByIdAndUpdate(vehicleId, { $inc: { deliveriesToday: 1 } });

    try {
      const io = getIO();
      io.emit("delivery:status", { deliveryId: delivery._id, orderId: delivery.orderId, status: "assigned" });
    } catch { /* socket not ready */ }

    res.json({ success: true, message: "Dispatched", data: delivery });
  } catch (err) { next(err); }
};

// ── PATCH /api/deliveries/:id/status ─────────────────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

    delivery.status = status;
    if (status === "delivered") delivery.deliveredAt = new Date();
    if (status === "failed")    { delivery.failedAt = new Date(); delivery.attempts += 1; }
    if (note) delivery.notes = note;

    await delivery.save();

    try {
      const io = getIO();
      io.emit("delivery:status", { deliveryId: delivery._id, orderId: delivery.orderId, status });
    } catch { /* socket not ready */ }

    res.json({ success: true, data: delivery });
  } catch (err) { next(err); }
};

// ── POST /api/deliveries/:id/rate ─────────────────────────────────────────────
exports.rateDelivery = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be 1-5" });

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { rating, feedback },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    res.json({ success: true, data: delivery });
  } catch (err) { next(err); }
};

// ── POST /api/deliveries/dispatch-all ────────────────────────────────────────
// Dispatch all pending deliveries using AI-ranked order
exports.dispatchAll = async (req, res, next) => {
  try {
    const pending = await Delivery.find({ status: "pending" }).sort({ priorityScore: -1 });
    res.json({ success: true, message: `${pending.length} deliveries queued for dispatch`, data: pending });
  } catch (err) { next(err); }
};