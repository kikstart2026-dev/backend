const Role = require("../../models/Role/roleModel");

// CREATE ROLE
exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name || !permissions) {
      return res.status(400).json({
        message: "Name and permissions are required",
      });
    }

    // Duplicate check
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        message: "Role already exists",
      });
    }

    const role = await Role.create({ name, permissions });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ROLES
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ROLE
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ROLE
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};