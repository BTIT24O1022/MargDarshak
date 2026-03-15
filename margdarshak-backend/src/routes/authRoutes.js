const router = require("express").Router();
const { register, login, refresh, logout, getMe, updateMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login",    login);
router.post("/refresh",  refresh);
router.post("/logout",   protect, logout);
router.get ("/me",       protect, getMe);
router.patch("/me",      protect, updateMe);

module.exports = router;