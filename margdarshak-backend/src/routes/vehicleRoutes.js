const router = require("express").Router();
const {
  getAllVehicles, getVehicle, createVehicle, updateVehicle,
  deleteVehicle, updateTelemetry, updateStatus, getFleetSummary,
} = require("../controllers/vehicleController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get   ("/",               getAllVehicles);
router.get   ("/stats/summary",  getFleetSummary);
router.get   ("/:id",            getVehicle);
router.post  ("/",               authorize("admin", "fleet_manager"), createVehicle);
router.put   ("/:id",            authorize("admin", "fleet_manager"), updateVehicle);
router.delete("/:id",            authorize("admin"),                  deleteVehicle);
router.patch ("/:id/telemetry",  updateTelemetry);   // driver app calls this
router.patch ("/:id/status",     authorize("admin", "fleet_manager"), updateStatus);

module.exports = router;