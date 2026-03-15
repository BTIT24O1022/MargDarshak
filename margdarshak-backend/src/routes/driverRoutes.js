const router = require("express").Router();
const {
  getAllDrivers, getDriver, createDriver, updateDriver,
  startShift, endShift, getStops, confirmStop, getDriverStats,
} = require("../controllers/driverController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get ("/",                       getAllDrivers);
router.get ("/:id",                    getDriver);
router.post("/",                       authorize("admin", "fleet_manager"), createDriver);
router.put ("/:id",                    authorize("admin", "fleet_manager"), updateDriver);

// Shift management
router.post("/:id/shift/start",        startShift);
router.post("/:id/shift/end",          endShift);

// Route stops
router.get ("/:id/stops",              getStops);
router.patch("/:id/stops/:stopIndex/confirm", confirmStop);

// Stats
router.get ("/:id/stats",             getDriverStats);

module.exports = router;