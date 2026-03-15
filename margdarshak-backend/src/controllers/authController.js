const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── Helpers ───────────────────────────────────────────────────────────────────
function signAccess(id)   { return jwt.sign({ id }, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES_IN         || "7d"  }); }
function signRefresh(id)  { return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET,{ expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d" }); }

function sendTokens(res, user, statusCode = 200) {
  const accessToken  = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  // Store hashed refresh token if needed — simplified here
  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: user.toPublic ? user.toPublic() : user,
  });
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields explicitly for clear error messages
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email and password are required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    // Create user — pre-save hook hashes password
    const user = await User.create({ name, email, password, role });

    // Re-fetch without password field to pass to sendTokens
    const safeUser = await User.findById(user._id);
    sendTokens(res, safeUser, 201);
  } catch (err) { next(err); }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated" });

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokens(res, user);
  } catch (err) { next(err); }
};

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const accessToken = signAccess(user._id);
    res.json({ success: true, accessToken });
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.json({ success: true, message: "Logged out" });
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("assignedVehicleId", "vehicleCode type status");
    res.json({ success: true, user: user.toPublic() });
  } catch (err) { next(err); }
};

// ── PATCH /api/auth/me ────────────────────────────────────────────────────────
exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ["name", "avatar"];
    const updates = {};
    for (const k of allowed) { if (req.body[k] !== undefined) updates[k] = req.body[k]; }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublic() });
  } catch (err) { next(err); }
};