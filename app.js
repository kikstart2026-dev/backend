const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/authMiddleware");
const AuthRouter = require("./routes/authRoutes");
const enqRouter = require("./routes/EnquiryForm/enquiryRoute");
const contactRouter = require("./routes/ContactForm/contactRoute");

require("dotenv").config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", AuthRouter);

app.use("/api/v1", enqRouter);

app.use("/api/v1", contactRouter);

app.get("/api/v1", authMiddleware, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
  });
});

module.exports = app;




//vfkufjby;oynollm---------->>>