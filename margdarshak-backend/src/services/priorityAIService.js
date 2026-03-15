/**
 * Priority AI Service
 * Computes a 0-100 priority score for each delivery.
 *
 * Factors (weights defined in .env):
 *   URGENCY    30 pts — CRITICAL=30, HIGH=22, MEDIUM=12, LOW=4
 *   DISTANCE   20 pts — shorter = higher
 *   WEATHER    15 pts — severe weather = lower score (safety-first)
 *   TRAFFIC    15 pts — congestion factor
 *   SLA        10 pts — Guaranteed=10, Express=8, Standard=5, Economy=2
 *   WORKLOAD    5 pts — driver workload balancing
 *   RISK        5 pts — fewer past failed attempts = higher
 */

const WEIGHTS = {
  urgency:  Number(process.env.PRIORITY_WEIGHT_URGENCY)  || 30,
  distance: Number(process.env.PRIORITY_WEIGHT_DISTANCE) || 20,
  weather:  Number(process.env.PRIORITY_WEIGHT_WEATHER)  || 15,
  traffic:  Number(process.env.PRIORITY_WEIGHT_TRAFFIC)  || 15,
  sla:      Number(process.env.PRIORITY_WEIGHT_SLA)      || 10,
  workload: Number(process.env.PRIORITY_WEIGHT_WORKLOAD) || 5,
  risk:     Number(process.env.PRIORITY_WEIGHT_RISK)     || 5,
};

const URGENCY_BASE = { CRITICAL: 1.0, HIGH: 0.73, MEDIUM: 0.4, LOW: 0.13 };
const SLA_BASE     = { Guaranteed: 1.0, Express: 0.8, Standard: 0.5, Economy: 0.2 };

/**
 * @param {object} delivery  — Delivery document
 * @param {object} context   — { weatherSeverity: 0-1, trafficFactor: 1-3, driverWorkload: 0-1 }
 * @returns {{ score: number, breakdown: object, riskLevel: string }}
 */
function computePriorityScore(delivery, context = {}) {
  const {
    weatherSeverity = 0,    // 0 = clear, 1 = extreme
    trafficFactor   = 1,    // 1 = clear, 3 = gridlock
    driverWorkload  = 0.5,  // 0 = idle driver, 1 = overloaded
  } = context;

  // ── Factor scores (0-1 each) ──────────────────────────────────────────────
  const urgencyScore   = URGENCY_BASE[delivery.urgency] ?? 0.4;
  const slaScore       = SLA_BASE[delivery.sla] ?? 0.5;

  // Distance: 0 km → 1.0, 20+ km → 0.0
  const distKm         = delivery.distanceKm || 1;
  const distanceScore  = Math.max(0, 1 - distKm / 20);

  // Weather: severe weather LOWERS score (safety-first routing)
  const weatherScore   = Math.max(0, 1 - weatherSeverity);

  // Traffic: heavy traffic lowers score (won't reach on time)
  const trafficScore   = Math.max(0, 1 - (trafficFactor - 1) / 2);

  // Workload: prefer less-loaded drivers
  const workloadScore  = Math.max(0, 1 - driverWorkload);

  // Risk: more failed attempts → lower score
  const attempts       = delivery.attempts || 0;
  const riskScore      = Math.max(0, 1 - attempts * 0.3);

  // ── Weighted sum ──────────────────────────────────────────────────────────
  const raw =
    urgencyScore  * WEIGHTS.urgency  +
    distanceScore * WEIGHTS.distance +
    weatherScore  * WEIGHTS.weather  +
    trafficScore  * WEIGHTS.traffic  +
    slaScore      * WEIGHTS.sla      +
    workloadScore * WEIGHTS.workload +
    riskScore     * WEIGHTS.risk;

  const score = Math.min(100, Math.max(0, Math.round(raw)));

  // ── Risk label ────────────────────────────────────────────────────────────
  const riskLevel =
    attempts >= 2 || weatherSeverity > 0.7 ? "High"
    : attempts === 1 || weatherSeverity > 0.3 ? "Med"
    : "Low";

  return {
    score,
    riskLevel,
    breakdown: {
      urgency:  +(urgencyScore  * WEIGHTS.urgency).toFixed(1),
      distance: +(distanceScore * WEIGHTS.distance).toFixed(1),
      weather:  +(weatherScore  * WEIGHTS.weather).toFixed(1),
      traffic:  +(trafficScore  * WEIGHTS.traffic).toFixed(1),
      sla:      +(slaScore      * WEIGHTS.sla).toFixed(1),
      workload: +(workloadScore * WEIGHTS.workload).toFixed(1),
      risk:     +(riskScore     * WEIGHTS.risk).toFixed(1),
    },
    weights: WEIGHTS,
  };
}

/**
 * Rank an array of deliveries by priority score.
 * @param {Array} deliveries
 * @param {object} context
 * @returns {Array} sorted deliveries with score attached
 */
function rankDeliveries(deliveries, context = {}) {
  return deliveries
    .map((d) => {
      const { score, riskLevel, breakdown } = computePriorityScore(d, context);
      return { ...d, priorityScore: score, riskLevel, aiBreakdown: breakdown };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

module.exports = { computePriorityScore, rankDeliveries, WEIGHTS };