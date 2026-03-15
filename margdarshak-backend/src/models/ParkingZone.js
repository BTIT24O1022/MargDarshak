const mongoose = require("mongoose");

const parkingZoneSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    lat:          { type: Number, required: true },
    lng:          { type: Number, required: true },
    totalSpots:   { type: Number, required: true },
    availableSpots: { type: Number, required: true },
    vehicleTypes: [{ type: String, enum: ["bike", "scooter", "van", "truck"] }],

    // Parking AI prediction
    predictedAvailabilityPct: { type: Number, default: 0 }, // 0-100
    confidence: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    predictionWindowMin: { type: Number, default: 15 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ParkingZone", parkingZoneSchema);