// ── weatherRoutes.js ───────────────────────────────────────────────────────────
const weatherRouter = require("express").Router();
const { getCurrent, refresh } = require("../controllers/weatherController");
const { protect } = require("../middleware/authMiddleware");
weatherRouter.use(protect);
weatherRouter.get ("/current", getCurrent);
weatherRouter.post("/refresh", refresh);
module.exports = weatherRouter;