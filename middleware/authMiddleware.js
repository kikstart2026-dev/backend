const jwt = require("jsonwebtoken");
const User = require("../models/authModel"); 


const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");


  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided or invalid format.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    // Ekhon await kaj korbe karon upore async ache
    const user = await User.findById(decoded.id).populate("role");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    req.user = user; 
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;