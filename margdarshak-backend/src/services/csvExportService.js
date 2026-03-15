/**
 * CSV Export Service
 * Converts MongoDB documents into properly escaped CSV strings.
 * No external library needed — pure Node.js.
 *
 * Supports: deliveries, vehicles, drivers, analytics, alerts
 */

// ── Core CSV builder ──────────────────────────────────────────────────────────

/**
 * Escape a single cell value for CSV:
 *  - wrap in quotes if it contains comma, quote, or newline
 *  - double-up any existing quotes
 */
function escapeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Build a full CSV string from headers array + rows array-of-objects.
 * @param {string[]} headers  — column names (displayed in row 1)
 * @param {Array}    rows     — each object maps header → value
 * @returns {string}
 */
function buildCSV(headers, rows) {
  const headerLine = headers.map(escapeCell).join(",");
  const dataLines  = rows.map((row) =>
    headers.map((h) => escapeCell(row[h] ?? "")).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
}

/** Format a JS Date → "YYYY-MM-DD HH:MM:SS" or blank */
function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toISOString().replace("T", " ").slice(0, 19);
}

/** Format a number with fixed decimals, blank if null */
function fmtNum(n, dec = 2) {
  if (n === null || n === undefined || n === "") return "";
  return Number(n).toFixed(dec);
}

// ── Deliveries CSV ────────────────────────────────────────────────────────────
const DELIVERY_HEADERS = [
  "Order ID",
  "Status",
  "Urgency",
  "SLA",
  "Customer Name",
  "Customer Phone",
  "Delivery Address",
  "Latitude",
  "Longitude",
  "Vehicle Code",
  "Vehicle Type",
  "Driver Name",
  "Driver Phone",
  "Weight (kg)",
  "Fragile",
  "Distance (km)",
  "ETA (min)",
  "Priority Score",
  "Risk Level",
  "Estimated Profit (₹)",
  "Attempts",
  "Customer Rating",
  "Customer Feedback",
  "Notes",
  "Scheduled At",
  "Picked Up At",
  "Delivered At",
  "Failed At",
  "Created At",
  "Updated At",
];

function deliveriesToCSV(deliveries) {
  const rows = deliveries.map((d) => ({
    "Order ID":              d.orderId          || "",
    "Status":                d.status           || "",
    "Urgency":               d.urgency          || "",
    "SLA":                   d.sla              || "",
    "Customer Name":         d.customer?.name   || "",
    "Customer Phone":        d.customer?.phone  || "",
    "Delivery Address":      d.customer?.address|| "",
    "Latitude":              fmtNum(d.customer?.lat, 6),
    "Longitude":             fmtNum(d.customer?.lng, 6),
    "Vehicle Code":          d.vehicleId?.vehicleCode || d.vehicleId || "",
    "Vehicle Type":          d.vehicleId?.type        || "",
    "Driver Name":           d.driverId?.name         || d.driverId  || "",
    "Driver Phone":          d.driverId?.phone        || "",
    "Weight (kg)":           fmtNum(d.weightKg, 2),
    "Fragile":               d.isFragile ? "Yes" : "No",
    "Distance (km)":         fmtNum(d.distanceKm, 2),
    "ETA (min)":             d.etaMinutes       ?? "",
    "Priority Score":        d.priorityScore    ?? "",
    "Risk Level":            d.riskLevel        || "",
    "Estimated Profit (₹)":  fmtNum(d.estimatedProfit, 0),
    "Attempts":              d.attempts         ?? 0,
    "Customer Rating":       d.rating           ?? "",
    "Customer Feedback":     d.feedback         || "",
    "Notes":                 d.notes            || "",
    "Scheduled At":          fmtDate(d.scheduledAt),
    "Picked Up At":          fmtDate(d.pickedUpAt),
    "Delivered At":          fmtDate(d.deliveredAt),
    "Failed At":             fmtDate(d.failedAt),
    "Created At":            fmtDate(d.createdAt),
    "Updated At":            fmtDate(d.updatedAt),
  }));
  return buildCSV(DELIVERY_HEADERS, rows);
}

// ── Vehicles CSV ──────────────────────────────────────────────────────────────
const VEHICLE_HEADERS = [
  "Vehicle Code",
  "Type",
  "Status",
  "Driver Name",
  "Driver Phone",
  "Max Load (kg)",
  "Max Range (km)",
  "Battery (%)",
  "Load (%)",
  "Speed (km/h)",
  "Latitude",
  "Longitude",
  "Heading",
  "Deliveries Today",
  "Total KM",
  "Route From",
  "Route To",
  "Route Distance (km)",
  "Last Service Date",
  "Created At",
];

function vehiclesToCSV(vehicles) {
  const rows = vehicles.map((v) => ({
    "Vehicle Code":        v.vehicleCode          || "",
    "Type":                v.type                 || "",
    "Status":              v.status               || "",
    "Driver Name":         v.driverId?.name       || "",
    "Driver Phone":        v.driverId?.phone      || "",
    "Max Load (kg)":       v.maxLoadKg            ?? "",
    "Max Range (km)":      v.maxRangeKm           ?? "",
    "Battery (%)":         v.telemetry?.battery   ?? "",
    "Load (%)":            v.telemetry?.load      ?? "",
    "Speed (km/h)":        v.telemetry?.speed     ?? "",
    "Latitude":            fmtNum(v.telemetry?.lat, 6),
    "Longitude":           fmtNum(v.telemetry?.lng, 6),
    "Heading":             v.telemetry?.heading   ?? "",
    "Deliveries Today":    v.deliveriesToday      ?? 0,
    "Total KM":            fmtNum(v.totalKm, 1),
    "Route From":          v.currentRoute?.from   || "",
    "Route To":            v.currentRoute?.to     || "",
    "Route Distance (km)": fmtNum(v.currentRoute?.distanceKm, 2),
    "Last Service Date":   fmtDate(v.lastServiceDate),
    "Created At":          fmtDate(v.createdAt),
  }));
  return buildCSV(VEHICLE_HEADERS, rows);
}

// ── Drivers CSV ───────────────────────────────────────────────────────────────
const DRIVER_HEADERS = [
  "Name",
  "Phone",
  "License",
  "Status",
  "Assigned Vehicle",
  "Vehicle Type",
  "Rating",
  "Deliveries Today",
  "Deliveries All Time",
  "Avg Rating",
  "On-Time Rate (%)",
  "Earnings Today (₹)",
  "Shift Start",
  "Shift End",
  "Created At",
];

function driversToCSV(drivers) {
  const rows = drivers.map((d) => ({
    "Name":                   d.name                         || "",
    "Phone":                  d.phone                        || "",
    "License":                d.license                      || "",
    "Status":                 d.status                       || "",
    "Assigned Vehicle":       d.assignedVehicleId?.vehicleCode || "",
    "Vehicle Type":           d.assignedVehicleId?.type        || "",
    "Rating":                 fmtNum(d.rating, 1),
    "Deliveries Today":       d.stats?.deliveriesToday       ?? 0,
    "Deliveries All Time":    d.stats?.deliveriesAllTime     ?? 0,
    "Avg Rating":             fmtNum(d.stats?.avgRating, 2),
    "On-Time Rate (%)":       fmtNum(d.stats?.onTimeRate, 1),
    "Earnings Today (₹)":     fmtNum(d.stats?.earningsToday, 0),
    "Shift Start":            fmtDate(d.shiftStart),
    "Shift End":              fmtDate(d.shiftEnd),
    "Created At":             fmtDate(d.createdAt),
  }));
  return buildCSV(DRIVER_HEADERS, rows);
}

// ── Analytics summary CSV ─────────────────────────────────────────────────────
const ANALYTICS_HEADERS = [
  "Date",
  "Day",
  "Total Deliveries",
  "Delivered",
  "Pending",
  "Failed",
  "On-Time Rate (%)",
  "Avg Delivery Time (min)",
  "Parking Incidents",
  "Total Profit (₹)",
];

function analyticsToCSV(rows) {
  return buildCSV(ANALYTICS_HEADERS, rows.map((r) => ({
    "Date":                      r.date              || "",
    "Day":                       r.label             || "",
    "Total Deliveries":          r.total             ?? r.deliveries ?? 0,
    "Delivered":                 r.deliveries        ?? 0,
    "Pending":                   r.pending           ?? 0,
    "Failed":                    r.failed            ?? 0,
    "On-Time Rate (%)":          fmtNum(r.onTimeRate, 1),
    "Avg Delivery Time (min)":   r.avgDeliveryMin    ?? 0,
    "Parking Incidents":         r.parkingIncidents  ?? 0,
    "Total Profit (₹)":          fmtNum(r.totalProfit, 0),
  })));
}

// ── Alerts CSV ────────────────────────────────────────────────────────────────
const ALERT_HEADERS = [
  "Type",
  "Severity",
  "Message",
  "Vehicle",
  "Delivery",
  "Is Read",
  "Is Dismissed",
  "Created At",
];

function alertsToCSV(alerts) {
  const rows = alerts.map((a) => ({
    "Type":         a.type                             || "",
    "Severity":     a.severity                         || "",
    "Message":      a.message                          || "",
    "Vehicle":      a.vehicleId?.vehicleCode || a.vehicleId || "",
    "Delivery":     a.deliveryId?.orderId    || a.deliveryId || "",
    "Is Read":      a.isRead      ? "Yes" : "No",
    "Is Dismissed": a.isDismissed ? "Yes" : "No",
    "Created At":   fmtDate(a.createdAt),
  }));
  return buildCSV(ALERT_HEADERS, rows);
}

// ── Fleet summary CSV (one row per vehicle with driver + today's stats) ───────
const FLEET_SUMMARY_HEADERS = [
  "Vehicle Code",
  "Type",
  "Status",
  "Driver",
  "Battery (%)",
  "Load (%)",
  "Deliveries Today",
  "Route",
  "Total KM",
];

function fleetSummaryToCSV(vehicles) {
  const rows = vehicles.map((v) => ({
    "Vehicle Code":     v.vehicleCode                   || "",
    "Type":             v.type                          || "",
    "Status":           v.status                        || "",
    "Driver":           v.driverId?.name                || "Unassigned",
    "Battery (%)":      v.telemetry?.battery            ?? "",
    "Load (%)":         v.telemetry?.load               ?? "",
    "Deliveries Today": v.deliveriesToday               ?? 0,
    "Route":            v.currentRoute?.from && v.currentRoute?.to
                          ? `${v.currentRoute.from} → ${v.currentRoute.to}`
                          : "",
    "Total KM":         fmtNum(v.totalKm, 1),
  }));
  return buildCSV(FLEET_SUMMARY_HEADERS, rows);
}

// ── Filename helper ───────────────────────────────────────────────────────────
function buildFilename(type, ext = "csv") {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `margdarshak_${type}_${ts}.${ext}`;
}

module.exports = {
  deliveriesToCSV,
  vehiclesToCSV,
  driversToCSV,
  analyticsToCSV,
  alertsToCSV,
  fleetSummaryToCSV,
  buildFilename,
  buildCSV,           // exported for custom reports
};