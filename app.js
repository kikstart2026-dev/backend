const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authMiddleware = require("./middleware/authMiddleware");
const AuthRouter = require("./routes/authRoutes");
const enqRouter = require("./routes/EnquiryForm/enquiryRoute");
const contactRouter = require("./routes/ContactForm/contactRoute");
const AllHeadingRouter = require("./routes/AllHeading/AllHeadingRoute");
const HomeBannerRouter = require("./routes/HomeBanner/HomeBannerRoute");
const WhyChooseUsCardRouter = require("./routes/WhyChooseUs/WhyChooseUsRoute");
const mediaRoutes = require("./routes/AllMedia/AllMediaRoutes");
const AboutUsRoute = require("./routes/AboutUs/AboutUsRoute")
const serviceRouter = require("./routes/Service/ServiceRoute");

const adminAuthRouter = require("./routes/adminAuthRoutes");


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

// 🔥 Static Upload Folder
app.use(
  "/uploads",
  express.static(path.join(__dirname, "middleware/uploads"))
);

// Routes

app.use("/api/v1/admin", adminAuthRouter);

app.use("/api/v1/home-banner", HomeBannerRouter);

app.use("/api/v1/why-choose-us", WhyChooseUsCardRouter);

app.use("/api/v1/media", mediaRoutes);

app.use("/api/v1/about-us", AboutUsRoute );
app.use("/api/v1/service", serviceRouter);

app.use("/api/v1", AllHeadingRouter);

app.use("/api/v1", enqRouter);

app.use("/api/v1", contactRouter);

app.use("/api/v1", AuthRouter);

app.get("/api/v1", authMiddleware, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
  });
});

module.exports = app;