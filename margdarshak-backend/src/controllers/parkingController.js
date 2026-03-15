const ParkingZone = require("../models/ParkingZone");
const { getParkingStatus, getBestZone, updateAvailability } = require("../services/parkingAIService");

// ── GET /api/parking/zones ────────────────────────────────────────────────────
exports.getZones = async (req, res, next) => {
  try {
    const zones = await getParkingStatus();
    res.json({ success: true, data: zones });
  } catch (err) { next(err); }
};

// ── GET /api/parking/best ─────────────────────────────────────────────────────
// ?lat=&lng=&vehicleType=
exports.getBest = async (req, res, next) => {
  try {
    const { lat, lng, vehicleType = "bike" } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: "lat and lng required" });
    const zone = await getBestZone(Number(lat), Number(lng), vehicleType);
    if (!zone) return res.status(404).json({ success: false, message: "No suitable parking zone found" });
    res.json({ success: true, data: zone });
  } catch (err) { next(err); }
};

// ── PATCH /api/parking/zones/:id/availability ─────────────────────────────────
// delta: +1 (vehicle left) or -1 (vehicle parked)
exports.updateAvailability = async (req, res, next) => {
  try {
    const { delta } = req.body;
    if (delta === undefined) return res.status(400).json({ success: false, message: "delta required" });
    const zone = await updateAvailability(req.params.id, delta);
    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });
    res.json({ success: true, data: zone });
  } catch (err) { next(err); }
};

// ── POST /api/parking/zones ───────────────────────────────────────────────────
exports.createZone = async (req, res, next) => {
  try {
    const zone = await ParkingZone.create(req.body);
    res.status(201).json({ success: true, data: zone });
  } catch (err) { next(err); }
};