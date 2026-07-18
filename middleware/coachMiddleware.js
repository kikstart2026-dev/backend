module.exports = (req, res, next) => {
  try {
    if (req.user.role !== "coach") {
      return res.status(403).json({
        success: false,
        message: "Only coach can access this route.",
      });
    }

    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};