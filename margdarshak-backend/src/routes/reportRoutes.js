/**
 * Report Routes
 * All routes produce a CSV file download.
 *
 * GET /api/reports/available          — list all report types + record counts
 * GET /api/reports/deliveries         — deliveries CSV
 * GET /api/reports/vehicles           — vehicles CSV
 * GET /api/reports/drivers            — drivers CSV
 * GET /api/reports/analytics          — analytics CSV  (?days=7)
 * GET /api/reports/alerts             — alerts CSV
 * GET /api/reports/fleet-summary      — fleet snapshot CSV
 */

const router = require("express").Router();
const {
  getAvailableReports,
  downloadDeliveries,
  downloadVehicles,
  downloadDrivers,
  downloadAnalytics,
  downloadAlerts,
  downloadFleetSummary,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All report endpoints require authentication
router.use(protect);

// Meta endpoint — what reports are available
router.get("/available",     getAvailableReports);

// CSV downloads — fleet_manager, analyst, admin can download
router.get("/deliveries",    authorize("admin", "fleet_manager", "analyst"), downloadDeliveries);
router.get("/vehicles",      authorize("admin", "fleet_manager", "analyst"), downloadVehicles);
router.get("/drivers",       authorize("admin", "fleet_manager", "analyst"), downloadDrivers);
router.get("/analytics",     authorize("admin", "fleet_manager", "analyst"), downloadAnalytics);
router.get("/alerts",        authorize("admin", "fleet_manager", "analyst"), downloadAlerts);
router.get("/fleet-summary", authorize("admin", "fleet_manager", "analyst"), downloadFleetSummary);

module.exports = router;