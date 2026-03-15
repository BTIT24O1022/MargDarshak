const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema(
  {
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
    address:    { type: String },
    lat:        { type: Number },
    lng:        { type: Number },
    status:     { type: String, enum: ["pending", "active", "done", "skipped"], default: "pending" },
    arrivedAt:  { type: Date, default: null },
  },
  { _id: false }
);

const driverSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    license: { type: String, required: true },

    status: {
      type: String,
      enum: ["on_duty", "off_duty", "on_break", "unavailable"],
      default: "off_duty",
    },

    assignedVehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },

    // Today's shift
    shiftStart:   { type: Date, default: null },
    shiftEnd:     { type: Date, default: null },
    currentStops: [stopSchema],               // ordered route stops for current shift

    // Performance stats
    stats: {
      deliveriesToday:   { type: Number, default: 0 },
      deliveriesAllTime: { type: Number, default: 0 },
      avgRating:         { type: Number, default: 0 },
      onTimeRate:        { type: Number, default: 0 },
      earningsToday:     { type: Number, default: 0 },
    },

    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);