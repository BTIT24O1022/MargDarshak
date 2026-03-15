// ── dashboardRoutes.js ─────────────────────────────────────────────────────────
const dashRouter = require("express").Router();
const { getStats, getOverview, getAIModules } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

dashRouter.use(protect);
dashRouter.get("/stats",      getStats);
dashRouter.get("/overview",   getOverview);
dashRouter.get("/ai-modules", getAIModules);

module.exports = dashRouter;