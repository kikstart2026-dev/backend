const checkPermission = (action) => {
  return (req, res, next) => {
    
    // 1. User ba Role missing kina check
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized: Role information missing" });
    }

    // 2. Role populate kora na thakle permissions pabe na
    const permissions = req.user.role.permissions;

    if (!permissions) {
      return res.status(403).json({ message: "Access Denied: No permissions assigned to this role" });
    }

    // 3. Dynamic Key Check (Logic: permissions['read'] === true)
    if (permissions && (permissions[action] === true || String(permissions[action]) === "true")) {
      return next();
    }

    

    if (!hasPermission) {
      return res.status(403).json({ 
        message: `Access Denied: You don't have '${action}' permission` 
      });
    }

    next();
  };
};

module.exports = checkPermission;