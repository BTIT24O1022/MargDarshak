const router = require("express").Router();
const {
  getAllDeliveries, getDelivery, createDelivery, updateDelivery,
  dispatchDelivery, updateStatus, rateDelivery, dispatchAll,
} = require("../controllers/deliveryController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get ("/",                       getAllDeliveries);
router.get ("/:id",                    getDelivery);
router.post("/",                       authorize("admin", "fleet_manager"), createDelivery);
router.put ("/:id",                    authorize("admin", "fleet_manager"), updateDelivery);

router.post("/dispatch-all",           authorize("admin", "fleet_manager"), dispatchAll);
router.post("/:id/dispatch",           authorize("admin", "fleet_manager"), dispatchDelivery);
router.patch("/:id/status",            updateStatus);
router.post("/:id/rate",               rateDelivery);

module.exports = router;