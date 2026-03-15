const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["traffic", "weather", "ai_suggestion", "delivery", "battery", "drone", "system"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
    icon:    { type: String, default: "⚠️" },
    message: { type: String, required: true },
    color:   { type: String, default: "#f59e0b" },

    // Optional references
    vehicleId:  { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle",  default: null },
    driverId:   { type: mongoose.Schema.Types.ObjectId, ref: "Driver",   default: null },
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery", default: null },

    isRead:     { type: Boolean, default: false },
    isDismissed:{ type: Boolean, default: false },
    expiresAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

alertSchema.index({ isRead: 1, isDismissed: 1, createdAt: -1 });

module.exports = mongoose.model("Alert", alertSchema);