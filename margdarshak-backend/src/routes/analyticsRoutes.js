const router = require("express").Router();
const { getWeeklyCharts, getPerformanceSummary, getVehicleAnalytics, getDriverLeaderboard } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/weekly",     getWeeklyCharts);
router.get("/summary",    getPerformanceSummary);
router.get("/vehicles",   getVehicleAnalytics);
router.get("/drivers",    getDriverLeaderboard);

module.exports = router;