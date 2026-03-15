const Alert = require("../models/Alert");
const { getIO } = require("../config/socket");

// ── GET /api/alerts ───────────────────────────────────────────────────────────
exports.getAlerts = async (req, res, next) => {
  try {
    const { limit = 20, includeRead = "false" } = req.query;
    const filter = { isDismissed: false };
    if (includeRead !== "true") filter.isRead = false;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("vehicleId",  "vehicleCode type")
      .populate("deliveryId", "orderId customer")
      .lean();

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) { next(err); }
};

// ── PATCH /api/alerts/:id/read ────────────────────────────────────────────────
exports.markRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
    res.json({ success: true, data: alert });
  } catch (err) { next(err); }
};

// ── DELETE /api/alerts/:id ─────────────────────────────────────────────────────
// Matches the × dismiss button in the UI AIAlertsPanel
exports.dismiss = async (req, res, next) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { isDismissed: true, isRead: true });
    res.json({ success: true, message: "Alert dismissed" });
  } catch (err) { next(err); }
};

// ── DELETE /api/alerts/all ────────────────────────────────────────────────────
exports.dismissAll = async (req, res, next) => {
  try {
    await Alert.updateMany({ isDismissed: false }, { isDismissed: true, isRead: true });
    res.json({ success: true, message: "All alerts dismissed" });
  } catch (err) { next(err); }
};

// ── POST /api/alerts (admin / cron use) ───────────────────────────────────────
exports.createAlert = async (req, res, next) => {
  try {
    const alert = await Alert.create(req.body);
    try { getIO().emit("alert:new", alert); } catch { /* socket not ready */ }
    res.status(201).json({ success: true, data: alert });
  } catch (err) { next(err); }
};