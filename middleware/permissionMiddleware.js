const Permission = require("../models/Permission/permissionModel");

const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // 🔐 Auth check
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // 🔥 Admin bypass
      if (user.role === "admin") {
        return next();
      }

      // ❌ dynamicRole check
      if (!user.dynamicRole) {
        return res.status(403).json({
          message: "No dynamic role assigned",
        });
      }

      // 🔍 Permission lookup
      const permission = await Permission.findOne({
        dynamicRole: user.dynamicRole,
        module: module,
      });

      // ❌ deny
      if (!permission || !permission[action]) {
        return res.status(403).json({
          message: `Access Denied: ${action} not allowed on ${module}`,
        });
      }

      // ✅ allow
      next();
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
};

module.exports = checkPermission;