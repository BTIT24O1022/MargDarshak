/**
 * Weather AI Service
 * Fetches live weather from OpenWeatherMap and computes:
 *   - weatherSeverity (0-1) used by Priority AI
 *   - etaAdjustmentMin — extra minutes added to ETA
 *   - droneSafe        — whether drone flights are safe
 *   - routingWarning   — human-readable warning string
 */

const axios = require("axios");
const logger = require("../utils/logger");

// In-memory cache (refreshed by cron every 5 min)
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

const OWM_BASE = "https://api.openweathermap.org/data/2.5";

/**
 * Fetch from OpenWeatherMap or return cached data.
 */
async function fetchWeather() {
  const now = Date.now();
  if (_cache && now - _cacheAt < CACHE_TTL_MS) return _cache;

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey || apiKey === "your_openweathermap_api_key") {
    // Return mock data when API key not configured
    return getMockWeather();
  }

  try {
    const city    = process.env.WEATHER_CITY    || "Gwalior";
    const country = process.env.WEATHER_COUNTRY || "IN";
    const url     = `${OWM_BASE}/weather?q=${city},${country}&appid=${apiKey}&units=metric`;
    const { data } = await axios.get(url, { timeout: 5000 });

    _cache   = mapOWMToInternal(data);
    _cacheAt = now;
    logger.info(`☁️ Weather updated: ${_cache.condition} ${_cache.tempC}°C`);
    return _cache;
  } catch (err) {
    logger.warn(`Weather API error: ${err.message} — using mock`);
    return getMockWeather();
  }
}

function mapOWMToInternal(data) {
  const condId   = data.weather?.[0]?.id ?? 800;
  const main     = data.weather?.[0]?.main ?? "Clear";
  const desc     = data.weather?.[0]?.description ?? "clear sky";
  const windKmh  = Math.round((data.wind?.speed ?? 0) * 3.6);
  const humidity = data.main?.humidity ?? 50;
  const tempC    = +(data.main?.temp ?? 25).toFixed(1);
  const rainMm   = data.rain?.["1h"] ?? 0;

  // Severity: 0 = clear, 1 = extreme
  let severity = 0;
  if (condId >= 200 && condId < 300) severity = 0.9; // thunderstorm
  else if (condId >= 300 && condId < 400) severity = 0.3; // drizzle
  else if (condId >= 500 && condId < 600) severity = 0.55 + rainMm * 0.02;
  else if (condId >= 600 && condId < 700) severity = 0.7; // snow
  else if (condId >= 700 && condId < 800) severity = 0.4; // fog etc
  else if (condId === 800) severity = 0;
  else severity = 0.15;
  severity = Math.min(1, severity);

  const etaAdjMin  = Math.round(severity * 8);
  const droneSafe  = severity < 0.35 && windKmh < 40;

  return {
    condition: main,
    description: desc,
    tempC,
    humidity,
    windKmh,
    windDirection: data.wind?.deg ?? 0,
    rainMmHr: rainMm,
    visibility: data.visibility ?? 10000,
    severity,
    etaAdjustmentMin: etaAdjMin,
    droneSafe,
    routingWarning: severity > 0.5
      ? `⚠ ${main} — ETA +${etaAdjMin} min · Safety-First routing active`
      : null,
    updatedAt: new Date(),
  };
}

function getMockWeather() {
  return {
    condition:         "Rain",
    description:       "heavy intensity rain",
    tempC:             18.0,
    humidity:          85,
    windKmh:           24,
    windDirection:     315,
    rainMmHr:          12,
    visibility:        3000,
    severity:          0.55,
    etaAdjustmentMin:  4,
    droneSafe:         false,
    routingWarning:    "⚠ Heavy Rain — ETA +4 min · Safety-First routing active · Drones paused",
    updatedAt:         new Date(),
    _mock:             true,
  };
}

function invalidateCache() {
  _cache   = null;
  _cacheAt = 0;
}

module.exports = { fetchWeather, invalidateCache };