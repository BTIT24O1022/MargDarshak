const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema(
  {
    lat:     { type: Number, default: 0 },
    lng:     { type: Number, default: 0 },
    speed:   { type: Number, default: 0 },     // km/h
    heading: { type: Number, default: 0 },     // degrees
    battery: { type: Number, default: 100 },   // %
    load:    { type: Number, default: 0 },     // % of capacity
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const vehicleSchema = new mongoose.Schema(
  {
    vehicleCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    // e.g. BK-012, SC-031, CV-042, TK-007

    type: {
      type: String,
      required: true,
      enum: ["bike", "scooter", "van", "truck"],
    },

    status: {
      type: String,
      enum: ["active", "idle", "warning", "maintenance", "offline"],
      default: "idle",
    },

    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },

    // Capacities
    maxLoadKg:  { type: Number, required: true },
    maxRangeKm: { type: Number, required: true },

    // Live telemetry (updated via socket / REST)
    telemetry: { type: telemetrySchema, default: () => ({}) },

    // Route info
    currentRoute: {
      from:       { type: String, default: null },
      to:         { type: String, default: null },
      distanceKm: { type: Number, default: 0 },
    },

    // Today's counters
    deliveriesToday: { type: Number, default: 0 },

    // Maintenance
    lastServiceDate: { type: Date, default: null },
    nextServiceKm:   { type: Number, default: 5000 },
    totalKm:         { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ vehicleCode: 1 });
vehicleSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);