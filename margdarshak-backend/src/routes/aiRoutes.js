const router = require("express").Router();
const { getPriorityQueue, recalculate, scoreDelivery, getRouteSuggestion, getWeights } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get ("/priority",                    getPriorityQueue);
router.post("/priority/recalculate",        recalculate);
router.post("/priority/score",              scoreDelivery);
router.get ("/route-suggestion/:deliveryId",getRouteSuggestion);
router.get ("/weights",                     getWeights);

module.exports = router;