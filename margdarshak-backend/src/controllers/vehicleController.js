const Vehicle = require("../models/Vehicle");
const { getIO } = require("../config/socket");

// ── GET /api/vehicles ─────────────────────────────────────────────────────────
exports.getAllVehicles = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };
    if (type)   filter.type   = type;
    if (status) filter.status = status;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .populate("driverId", "name phone status stats")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Vehicle.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), data: vehicles });
  } catch (err) { next(err); }
};

// ── GET /api/vehicles/:id ─────────────────────────────────────────────────────
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("driverId", "name phone stats");
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

// ── POST /api/vehicles ────────────────────────────────────────────────────────
exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

// ── PUT /api/vehicles/:id ─────────────────────────────────────────────────────
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

// ── DELETE /api/vehicles/:id ──────────────────────────────────────────────────
exports.deleteVehicle = async (req, res, next) => {
  try {
    await Vehicle.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Vehicle deactivated" });
  } catch (err) { next(err); }
};

// ── PATCH /api/vehicles/:id/telemetry ─────────────────────────────────────────
// Called by driver app to push live GPS + sensor data
exports.updateTelemetry = async (req, res, next) => {
  try {
    const { lat, lng, speed, battery, load, heading } = req.body;
    const telemetry = { lat, lng, speed, battery, load, heading, updatedAt: new Date() };

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: { telemetry } },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    // Broadcast via Socket.IO
    try {
      const io = getIO();
      io.to(`vehicle:${vehicle._id}`).emit("vehicle:update", { vehicleId: vehicle._id, ...telemetry });
      io.to("fleet").emit("vehicle:update", { vehicleId: vehicle._id, vehicleCode: vehicle.vehicleCode, type: vehicle.type, ...telemetry });
    } catch { /* socket not ready */ }

    res.json({ success: true, data: { vehicleId: vehicle._id, telemetry } });
  } catch (err) { next(err); }
};

// ── PATCH /api/vehicles/:id/status ────────────────────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "idle", "warning", "maintenance", "offline"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};

// ── GET /api/vehicles/stats/summary ───────────────────────────────────────────
exports.getFleetSummary = async (req, res, next) => {
  try {
    const [byType, byStatus] = await Promise.all([
      Vehicle.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$type", count: { $sum: 1 } } }]),
      Vehicle.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const totalActive  = (byStatus.find((s) => s._id === "active") || {}).count || 0;
    const totalVehicles = byStatus.reduce((s, x) => s + x.count, 0);

    res.json({
      success: true,
      data: {
        totalVehicles,
        totalActive,
        byType:   Object.fromEntries(byType.map((x) => [x._id, x.count])),
        byStatus: Object.fromEntries(byStatus.map((x) => [x._id, x.count])),
      },
    });
  } catch (err) { next(err); }
};