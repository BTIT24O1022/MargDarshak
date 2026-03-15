const { fetchWeather, invalidateCache } = require("../services/weatherService");

// ── GET /api/weather/current ──────────────────────────────────────────────────
exports.getCurrent = async (req, res, next) => {
  try {
    const weather = await fetchWeather();
    res.json({ success: true, data: weather });
  } catch (err) { next(err); }
};

// ── POST /api/weather/refresh ─────────────────────────────────────────────────
exports.refresh = async (req, res, next) => {
  try {
    invalidateCache();
    const weather = await fetchWeather();
    res.json({ success: true, message: "Weather cache refreshed", data: weather });
  } catch (err) { next(err); }
};