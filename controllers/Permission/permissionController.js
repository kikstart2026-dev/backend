const Permission = require("../../models/Permission/permissionModel");


//----------------------get all modules--------------
// exports.getModules = async (req, res) => {
//   try {
//     const modules = await Permission.distinct("module");

//     return res.json({
//       data: modules,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: err.message,
//     });
//   }
// };

// ================= CREATE SINGLE PERMISSION =================
exports.createPermission = async (req, res) => {
  try {
    const {
      dynamicRole,
      module,
      create,
      read,
      update,
      delete: del,
    } = req.body;

    if (!dynamicRole || !module) {
      return res.status(400).json({
        message: "dynamicRole and module are required",
      });
    }

    const exists = await Permission.findOne({ dynamicRole, module });

    if (exists) {
      return res.status(400).json({
        message: "Permission already exists. Use update instead.",
      });
    }

    const permission = await Permission.create({
      dynamicRole,
      module,
      create: !!create,
      read: !!read,
      update: !!update,
      delete: !!del,
    });

    return res.status(201).json({
      message: "Permission created",
      data: permission,
    });
  } catch (err) {
    console.log("CREATE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ================= GET ALL =================
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();

    return res.status(200).json({
      data: permissions,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ================= GET BY ROLE =================
exports.getPermissionsByRole = async (req, res) => {
  try {
    const { dynamicRole } = req.params;

    if (!dynamicRole) {
      return res.status(400).json({
        message: "Role required",
      });
    }

    const permissions = await Permission.find({ dynamicRole });

    return res.status(200).json({
      data: permissions,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};




exports.getSinglePermission = async (req, res) => {
  try {

    const { dynamicRole, moduleName } = req.body;

    // ❌ Validation
    if (!dynamicRole || !moduleName) {
      return res.status(400).json({
        success: false,
        message: "dynamicRole and moduleName are required",
      });
    }

    // ✅ Find Permission
    const permission = await Permission.findOne({
      dynamicRole,
      module: moduleName,
    });

    // ❌ No permission
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    // ✅ Send only needed data
    return res.status(200).json({
      success: true,

      data: {
        create: permission.create,
        read: permission.read,
        update: permission.update,
        delete: permission.delete,
      },
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};






// ================= UPDATE SINGLE PERMISSION =================
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Permission.findByIdAndUpdate(
      id,
      {
        ...req.body,
        create: !!req.body.create,
        read: !!req.body.read,
        update: !!req.body.update,
        delete: !!req.body.delete,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Permission not found",
      });
    }

    return res.status(200).json({
      message: "Permission updated",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    await Permission.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Permission deleted",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ================= BULK SAVE (MAIN RBAC FEATURE) =================
exports.savePermissions = async (req, res) => {
  try {
    const { dynamicRole, permissions } = req.body;

    console.log("BODY:", req.body);

    if (!dynamicRole) {
      return res.status(400).json({
        message: "Role required",
      });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        message: "Permissions must be an array",
      });
    }

    //  delete old permissions for role
    await Permission.deleteMany({ dynamicRole });

    //  insert new permissions
    const data = permissions.map((p) => ({
      dynamicRole,
      module: p.module,
      create: !!p.create,
      read: !!p.read,
      update: !!p.update,
      delete: !!p.delete,
    }));

    await Permission.insertMany(data);

    return res.json({
      message: "Permissions updated successfully",
    });
  } catch (err) {
    console.log("SAVE ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};