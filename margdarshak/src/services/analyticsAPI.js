import request from "./api";

// ─── DASHBOARD STATS ─────────────────────────

export async function getDashboardStats() {
  return request("GET", "/stats");
}

// ─── WEEKLY ANALYTICS ───────────────────────

export async function getWeeklyAnalytics() {
  return request("GET", "/analytics/weekly");
}

export async function getPerformanceSummary() {
  return request("GET", "/analytics/summary");
}

// ─── WEATHER ────────────────────────────────

export async function getWeather() {
  return request("GET", "/weather");
}

// ─── AI ALERTS ──────────────────────────────

export async function getAlerts() {
  return request("GET", "/alerts");
}

export async function dismissAlert(id) {
  return request("DELETE", `/alerts/${id}`);
}