/**
 * Parking AI Service
 * Predicts spot availability N minutes ahead using:
 *   - Current occupancy rate
 *   - Time-of-day patterns
 *   - Vehicle type suitability
 *   - Weather impact on demand
 */

const ParkingZone = require("../models/ParkingZone");
const { fetchWeather } = require("./weatherService");

/**
 * Get all parking zones with live + predicted availability.
 */
async function getParkingStatus() {
  const zones   = await ParkingZone.find({});
  const weather = await fetchWeather();

  return zones.map((z) => enrichZone(z.toObject(), weather));
}

/**
 * Get best parking zone for a given lat/lng and vehicle type.
 */
async function getBestZone(lat, lng, vehicleType) {
  const zones   = await ParkingZone.find({ vehicleTypes: vehicleType });
  const weather = await fetchWeather();
  const enriched = zones.map((z) => enrichZone(z.toObject(), weather));

  // Score by: availability + proximity (rough Euclidean)
  return enriched
    .map((z) => {
      const dist = Math.sqrt((z.lat - lat) ** 2 + (z.lng - lng) ** 2);
      return { ...z, proximityScore: Math.max(0, 1 - dist * 100) };
    })
    .sort((a, b) =>
      (b.predictedAvailabilityPct + b.proximityScore * 30) -
      (a.predictedAvailabilityPct + a.proximityScore * 30)
    )[0] || null;
}

function enrichZone(zone, weather) {
  const hour = new Date().getHours();

  // Time-of-day demand factor (peak hours = higher demand)
  const peakFactor = (hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 20) ? 1.3 : 1.0;

  // Weather reduces demand slightly (fewer vehicles out)
  const weatherFactor = 1 - weather.severity * 0.2;

  const occupancyRate = 1 - zone.availableSpots / zone.totalSpots;
  const adjustedOccupancy = Math.min(1, occupancyRate * peakFactor * weatherFactor);
  const predicted = Math.round((1 - adjustedOccupancy) * 100);

  const confidence =
    predicted > 60 ? "HIGH"
    : predicted > 30 ? "MEDIUM"
    : "LOW";

  return {
    ...zone,
    predictedAvailabilityPct: predicted,
    confidence,
    predictionWindowMin: Number(process.env.PARKING_PREDICTION_WINDOW_MIN) || 15,
    peakFactor,
    weatherImpact: weather.severity,
    lastUpdated: new Date(),
  };
}

/**
 * Update live availability (called when a vehicle parks / departs).
 */
async function updateAvailability(zoneId, delta) {
  const zone = await ParkingZone.findById(zoneId);
  if (!zone) return null;
  zone.availableSpots = Math.max(0, Math.min(zone.totalSpots, zone.availableSpots + delta));
  await zone.save();
  return zone;
}

module.exports = { getParkingStatus, getBestZone, updateAvailability };