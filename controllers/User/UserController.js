// const User = require("../../models/User/userModel");
const User = require("../../models/authModel");

exports.getUsers = async (req, res) => {
  const users = await User.find().populate("role");
  res.json(users);
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};