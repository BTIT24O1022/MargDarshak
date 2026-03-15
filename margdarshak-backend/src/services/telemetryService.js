/**
 * Telemetry Service
 * Generates the live fleet snapshot used by Socket.IO broadcast.
 */

const Vehicle = require("../models/Vehicle");
const Driver  = require("../models/Driver");

async function generateFleetSnapshot() {
  const vehicles = await Vehicle.find({ isActive: true, status: "active" })
    .populate("driverId", "name phone stats")
    .lean();

  return {
    ts: new Date(),
    count: vehicles.length,
    vehicles: vehicles.map((v) => ({
      id:          v._id,
      vehicleCode: v.vehicleCode,
      type:        v.type,
      status:      v.status,
      driver:      v.driverId?.name || "Unassigned",
      telemetry:   v.telemetry,
      route:       v.currentRoute,
      deliveriesToday: v.deliveriesToday,
    })),
  };
}

module.exports = { generateFleetSnapshot };