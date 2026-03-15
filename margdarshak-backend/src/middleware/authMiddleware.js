const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect — verifies JWT, attaches req.user
 */
async function protect(req, res, next) {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    token = auth.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -refreshToken");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or deactivated" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
}

/**
 * Authorize — checks role
 * Usage: authorize("admin", "fleet_manager")
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not permitted for this action`,
      });
    }
    next();
  };
}

module.exports = { protect, authorize };