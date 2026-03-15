/**
 * Reports Controller
 * Every endpoint streams a CSV file download directly to the browser.
 *
 * Endpoints:
 *   GET /api/reports/deliveries       — all or filtered deliveries
 *   GET /api/reports/vehicles         — full fleet with live telemetry
 *   GET /api/reports/drivers          — all drivers + shift + stats
 *   GET /api/reports/analytics        — 7-day / 30-day daily summary
 *   GET /api/reports/alerts           — alert history
 *   GET /api/reports/fleet-summary    — one-line-per-vehicle snapshot
 *   GET /api/reports/full             — master report (all sheets as zip) [TODO]
 */

const Delivery    = require("../models/Delivery");
const Vehicle     = require("../models/Vehicle");
const Driver      = require("../models/Driver");
const Alert       = require("../models/Alert");

const {
  deliveriesToCSV,
  vehiclesToCSV,
  driversToCSV,
  analyticsToCSV,
  alertsToCSV,
  fleetSummaryToCSV,
  buildFilename,
} = require("../services/csvExportService");

// ── Helper: send CSV response ─────────────────────────────────────────────────
function sendCSV(res, csv, filename) {
  res.setHeader("Content-Type",        "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control",       "no-cache");
  // UTF-8 BOM so Excel opens it correctly (especially for ₹ symbol)
  res.send("\uFEFF" + csv);
}

// ── Helper: parse date query params ──────────────────────────────────────────
function parseDateRange(query) {
  const filter = {};
  if (query.from) {
    filter.$gte = new Date(query.from);
    if (isNaN(filter.$gte)) delete filter.$gte;
  }
  if (query.to) {
    const to = new Date(query.to);
    to.setHours(23, 59, 59, 999);
    if (!isNaN(to)) filter.$lte = to;
  }
  return Object.keys(filter).length ? filter : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/reports/deliveries
// Query params: status, urgency, sla, riskLevel, from, to, driverId, vehicleId
// ═══════════════════════════════════════════════════════════════════════════════
exports.downloadDeliveries = async (req, res, next) => {
  try {
    const { status, urgency, sla, riskLevel, driverId, vehicleId, from, to } = req.query;

    // Build MongoDB filter
    const filter = {};
    if (status)   filter.status    = { $in: status.split(",")   };
    if (urgency)  filter.urgency   = { $in: urgency.split(",")  };
    if (sla)      filter.sla       = { $in: sla.split(",")      };
    if (riskLevel)filter.riskLevel = { $in: riskLevel.split(",")};
    if (driverId) filter.driverId  = driverId;
    if (vehicleId)filter.vehicleId = vehicleId;

    const dateRange = parseDateRange({ from, to });
    if (dateRange) filter.createdAt = dateRange;

    const deliveries = await Delivery.find(filter)
      .sort({ priorityScore: -1, createdAt: -1 })
      .populate("vehicleId", "vehicleCode type")
      .populate("driverId",  "name phone")
      .lean();

    const csv = deliveriesToCSV(deliveries);
    sendCSV(res, csv, buildFilename("deliveries"));
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/reports/vehicles
// Query params: type, status
// ═══════════════════════════════════════════════════════════════════════════════
exports.downloadVehicles = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const filter = { isActive: true };
    if (type)   filter.type   = { $in: type.split(",")   };
    if (status) filter.status = { $in: status.split(",") };

    const vehicles = await Vehicle.find(filter)
      .populate("driverId", "name phone")
      .sort({ vehicleCode: 1 })
      .lean();

    const csv = vehiclesToCSV(vehicles);
    sendCSV(res, csv, buildFilename("vehicles"));
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/reports/drivers
// Query params: status
// ═══════════════════════════════════════════════════════════════════════════════
exports.downloadDrivers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = { $in: status.split(",") };

    const drivers = await Driver.find(filter)
      .populate("assignedVehicleId", "vehicleCode type")
      .sort({ name: 1 })
      .lean();

    const csv = driversToCSV(drivers);
    sendCSV(res, csv, buildFilename("drivers"));
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/reports/analytics
// Query params: days (default 7, max 90)
// ═══════════════════════════════════════════════════════════════════════════════
exports.downloadAnalytics = async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days) || 7, 90);
    const rows = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [delivered, total, failed, pending, avgTime, profit] = await Promise.all([
        Delivery.countDocuments({ status: "delivered",  deliveredAt: { $gte: dayStart, $lt: dayEnd } }),
        Delivery.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),
        Delivery.countDocuments({ status: "failed",     failedAt:    { $gte: dayStart, $lt: dayEnd } }),
        Delivery.countDocuments({ status: "pending",    createdAt:   { $gte: dayStart, $lt: dayEnd } }),
        Delivery.aggregate([
          { $match: { status: "delivered", deliveredAt: { $gte: dayStart, $lt: dayEnd } } },
          { $group: { _id: null, avg: { $avg: "$etaMinutes" }, total: { $sum: "$estimatedProfit" } } },
        ]),
        Delivery.aggregate([
          { $match: { deliveredAt: { $gte: dayStart, $lt: dayEnd } } },
          { $group: { _id: null, total: { $sum: "$estimatedProfit" } } },
        ]),
      ]);

      // Parking incidents = deliveries with 2+ attempts on that day
      const parkingIncidents = await Delivery.countDocuments({
        attempts: { $gte: 2 },
        createdAt: { $gte: dayStart, $lt: dayEnd },
      });

      const onTimeRate     = total > 0 ? +((delivered / total) * 100).toFixed(1) : 0;
      const avgDeliveryMin = Math.round(avgTime[0]?.avg ?? 0);
      const totalProfit    = profit[0]?.total ?? 0;

      rows.push({
        date:             dayStart.toISOString().split("T")[0],
        label:            ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dayStart.getDay()],
        total,
        deliveries:       delivered,
        pending,
        failed,
        onTimeRate,
        avgDeliveryMin,
        parkingIncidents,
        totalProfit,
      });
    }

    const csv = analyticsToCSV(rows);
    sendCSV(res, csv, buildFilename(`analytics_${days}d`));
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/reports/alerts
// Query params: type, severity, from, to
// ═══════════════════════════════════════════════════════════════════════════════
exports.downloadAlerts = async (req, res, next) => {
  try {
    const { type, severity, from, to } = req.query;
    const filter = {};
    if (type)     filter.type     = { $in: type.split(",")     };
    if (severity) filter.severity = { $in: severity.split(",") };

    const dateRange = parseDateRange({ from, to });
    if (dateRange) filter.createdAt = dateRange;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .populate("vehicleId",  "vehicleCode")
      .populate("deliveryId", "orderId")
      .limit(5000)
      .lean();

    const csv = alertsToCSV(alerts);
    sendCSV(res, csv, buildFilename("alerts"));
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/reports/fleet-summary
// Snapshot of all active vehicles with driver + today's counters
// ═══════════════════════════════════════════════════════════════════════════════
exports.downloadFleetSummary = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ isActive: true })
      .populate("driverId", "name phone")
      .sort({ vehicleCode: 1 })
      .lean();

    const csv = fleetSummaryToCSV(vehicles);
    sendCSV(res, csv, buildFilename("fleet_summary"));
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/reports/available
// Returns list of all available report types (used by Reports tab UI)
// ═══════════════════════════════════════════════════════════════════════════════
exports.getAvailableReports = async (req, res) => {
  // Live counts for each report type
  const [deliveryCount, vehicleCount, driverCount, alertCount] = await Promise.all([
    Delivery.countDocuments({}),
    Vehicle.countDocuments({ isActive: true }),
    Driver.countDocuments({ isActive: true }),
    Alert.countDocuments({ isDismissed: false }),
  ]);

  res.json({
    success: true,
    data: [
      {
        id:          "deliveries",
        label:       "Deliveries Report",
        description: "All delivery records with AI scores, risk, SLA, profit",
        icon:        "📦",
        endpoint:    "/api/reports/deliveries",
        filters:     ["status", "urgency", "sla", "riskLevel", "from", "to"],
        recordCount: deliveryCount,
        color:       "#10b981",
      },
      {
        id:          "vehicles",
        label:       "Fleet / Vehicles Report",
        description: "All vehicles with live telemetry, load, battery, route",
        icon:        "🚗",
        endpoint:    "/api/reports/vehicles",
        filters:     ["type", "status"],
        recordCount: vehicleCount,
        color:       "#3b82f6",
      },
      {
        id:          "drivers",
        label:       "Driver Performance Report",
        description: "Driver stats, ratings, shift times, earnings today",
        icon:        "👤",
        endpoint:    "/api/reports/drivers",
        filters:     ["status"],
        recordCount: driverCount,
        color:       "#f59e0b",
      },
      {
        id:          "analytics",
        label:       "Daily Analytics Report",
        description: "Day-by-day delivery counts, on-time rate, avg time, profit",
        icon:        "📊",
        endpoint:    "/api/reports/analytics",
        filters:     ["days"],
        recordCount: null,
        color:       "#a78bfa",
      },
      {
        id:          "fleet-summary",
        label:       "Fleet Snapshot",
        description: "One-line-per-vehicle live snapshot for quick review",
        icon:        "🗺",
        endpoint:    "/api/reports/fleet-summary",
        filters:     [],
        recordCount: vehicleCount,
        color:       "#22d3ee",
      },
      {
        id:          "alerts",
        label:       "Alert History Report",
        description: "All AI-generated alerts with type, severity, and linked entities",
        icon:        "🔔",
        endpoint:    "/api/reports/alerts",
        filters:     ["type", "severity", "from", "to"],
        recordCount: alertCount,
        color:       "#ef4444",
      },
    ],
  });
};