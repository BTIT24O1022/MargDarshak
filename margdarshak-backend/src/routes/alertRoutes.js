const router = require("express").Router();
const { getAlerts, markRead, dismiss, dismissAll, createAlert } = require("../controllers/alertController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get   ("/",         getAlerts);
router.post  ("/",         authorize("admin"), createAlert);
router.patch ("/:id/read", markRead);
router.delete("/all",      dismissAll);
router.delete("/:id",      dismiss);

module.exports = router;