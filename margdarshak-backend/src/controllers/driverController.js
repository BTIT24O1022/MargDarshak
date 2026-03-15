const Driver   = require("../models/Driver");
const Vehicle  = require("../models/Vehicle");

// ── GET /api/drivers ──────────────────────────────────────────────────────────
exports.getAllDrivers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = status;

    const [drivers, total] = await Promise.all([
      Driver.find(filter)
        .populate("userId", "name email avatar")
        .populate("assignedVehicleId", "vehicleCode type status telemetry")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Driver.countDocuments(filter),
    ]);

    res.json({ success: true, total, data: drivers });
  } catch (err) { next(err); }
};

// ── GET /api/drivers/:id ──────────────────────────────────────────────────────
exports.getDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate("userId",             "name email avatar")
      .populate("assignedVehicleId",  "vehicleCode type status telemetry currentRoute");
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

// ── POST /api/drivers ─────────────────────────────────────────────────────────
exports.createDriver = async (req, res, next) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (err) { next(err); }
};

// ── PUT /api/drivers/:id ──────────────────────────────────────────────────────
exports.updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};

// ── POST /api/drivers/:id/shift/start ─────────────────────────────────────────
exports.startShift = async (req, res, next) => {
  try {
    const { vehicleId } = req.body;
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

    driver.status      = "on_duty";
    driver.shiftStart  = new Date();
    driver.shiftEnd    = null;
    if (vehicleId) {
      driver.assignedVehicleId = vehicleId;
      await Vehicle.findByIdAndUpdate(vehicleId, { status: "active", driverId: driver._id });
    }
    await driver.save();
    res.json({ success: true, message: "Shift started", data: driver });
  } catch (err) { next(err); }
};

// ── POST /api/drivers/:id/shift/end ──────────────────────────────────────────
exports.endShift = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

    // Free up vehicle
    if (driver.assignedVehicleId) {
      await Vehicle.findByIdAndUpdate(driver.assignedVehicleId, { status: "idle", driverId: null });
    }

    driver.status            = "off_duty";
    driver.shiftEnd          = new Date();
    driver.assignedVehicleId = null;
    driver.currentStops      = [];
    await driver.save();
    res.json({ success: true, message: "Shift ended", data: driver });
  } catch (err) { next(err); }
};

// ── GET /api/drivers/:id/stops ────────────────────────────────────────────────
exports.getStops = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate("currentStops.deliveryId", "orderId customer status urgency");
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });
    res.json({ success: true, data: driver.currentStops });
  } catch (err) { next(err); }
};

// ── PATCH /api/drivers/:id/stops/:stopIndex/confirm ───────────────────────────
exports.confirmStop = async (req, res, next) => {
  try {
    const { id, stopIndex } = req.params;
    const driver = await Driver.findById(id);
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

    const idx = Number(stopIndex);
    if (!driver.currentStops[idx]) return res.status(404).json({ success: false, message: "Stop not found" });

    driver.currentStops[idx].status    = "done";
    driver.currentStops[idx].arrivedAt = new Date();
    driver.stats.deliveriesToday       = (driver.stats.deliveriesToday || 0) + 1;
    driver.stats.deliveriesAllTime     = (driver.stats.deliveriesAllTime || 0) + 1;

    // Activate next stop
    const next = driver.currentStops.find((s, i) => i > idx && s.status === "pending");
    if (next) next.status = "active";

    await driver.save();
    res.json({ success: true, message: "Stop confirmed", data: driver.currentStops });
  } catch (err) { next(err); }
};

// ── GET /api/drivers/:id/stats ────────────────────────────────────────────────
exports.getDriverStats = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id).select("name stats rating");
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
};