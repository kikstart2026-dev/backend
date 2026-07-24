const jwt = require("jsonwebtoken");
const User = require("../models/authModel");

const jwtSecret = process.env.TOKEN_SECRET;

// ================= PROTECT ROUTES =================
exports.protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ No token
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // ✅ Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔐 Optional (recommended): block unverified users
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your account first",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    // 🔥 Better error handling
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};

// ================= ADMIN ONLY =================
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access only" });
  }
};