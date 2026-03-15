const mongoose = require("mongoose");

/**
 * Delivery — core entity.
 * priorityScore is recomputed by PriorityAI whenever inputs change.
 */
const deliverySchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // DEL-XXXX

    customer: {
      name:    { type: String, required: true },
      phone:   { type: String, required: true },
      address: { type: String, required: true },
      lat:     { type: Number, required: true },
      lng:     { type: Number, required: true },
    },

    // Assignment
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    driverId:  { type: mongoose.Schema.Types.ObjectId, ref: "Driver",  default: null },

    status: {
      type: String,
      enum: ["pending", "assigned", "in_transit", "delivered", "failed", "cancelled"],
      default: "pending",
    },

    urgency: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
    },

    sla: {
      type: String,
      enum: ["Guaranteed", "Express", "Standard", "Economy"],
      default: "Standard",
    },

    // Package
    weightKg:    { type: Number, required: true },
    isFragile:   { type: Boolean, default: false },
    notes:       { type: String, default: "" },

    // AI-computed fields
    priorityScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel:     { type: String, enum: ["Low", "Med", "High"], default: "Low" },
    estimatedProfit: { type: Number, default: 0 }, // ₹

    // Distances & timing
    distanceKm:  { type: Number, default: 0 },
    etaMinutes:  { type: Number, default: 0 },
    attempts:    { type: Number, default: 0 },

    // Timestamps
    scheduledAt:  { type: Date, default: null },
    pickedUpAt:   { type: Date, default: null },
    deliveredAt:  { type: Date, default: null },
    failedAt:     { type: Date, default: null },

    // Customer feedback
    rating:   { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

deliverySchema.index({ status: 1, priorityScore: -1 });
deliverySchema.index({ orderId: 1 });
deliverySchema.index({ driverId: 1, status: 1 });

module.exports = mongoose.model("Delivery", deliverySchema);