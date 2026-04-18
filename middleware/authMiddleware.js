const jwt = require("jsonwebtoken");
const User = require("../models/authModel"); // Path thik ache kina check korun

// function-er age 'async' boshiye din
const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  console.log("Postman theke pawa Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided or invalid format.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Decoded Token Data:", decoded);

    // Ekhon await kaj korbe karon upore async ache
    const user = await User.findById(decoded.id).populate("role");
    console.log("User with Role:", user?.role?.name);

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