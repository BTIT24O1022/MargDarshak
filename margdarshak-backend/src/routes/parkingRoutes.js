const router = require("express").Router();
const { getZones, getBest, updateAvailability, createZone } = require("../controllers/parkingController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get  ("/zones",               getZones);
router.get  ("/best",                getBest);
router.post ("/zones",               authorize("admin", "fleet_manager"), createZone);
router.patch("/zones/:id/availability", authorize("admin", "fleet_manager"), updateAvailability);

module.exports = router;