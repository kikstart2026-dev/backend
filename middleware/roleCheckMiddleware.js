const Permission = require("../models/Permission");

const roleCheck = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      // Admin bypass 🔥
      if (userRole === "admin") {
        return next();
      }

      // Find module
      const moduleData = await require("../models/Module").findOne({
        name: moduleName,
      });

      if (!moduleData) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      // Find permission
      const permission = await Permission.findOne({
        role: userRole,
        module: moduleData._id,
      });

      if (!permission || !permission[action]) {
        return res.status(403).json({
          success: false,
          message: `You don't have ${action} permission`,
        });
      }

      next();
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
};

module.exports = roleCheck;