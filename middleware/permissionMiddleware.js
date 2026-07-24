const Permission = require("../models/Permission/permissionModel");

const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // ❌ No user
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // 🔥 Admin bypass
      if (user.role === "admin") {
        return next();
      }

      // ❌ No dynamic role
      if (!user.dynamicRole) {
        return res.status(403).json({
          success: false,
          message: "No role assigned",
        });
      }

      // ✅ Find permission
      const permission = await Permission.findOne({
        dynamicRole: user.dynamicRole,
        module: moduleName,
      });

      // ❌ Permission not found
      if (!permission) {
        return res.status(403).json({
          success: false,
          message: "Permission not found",
        });
      }

      // ❌ Action blocked
      if (!permission[action]) {
        return res.status(403).json({
          success: false,
          message: `You don't have permission to ${action} ${moduleName}`,
        });
      }

      // ✅ Allow
      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = checkPermission;