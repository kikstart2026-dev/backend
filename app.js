const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authMiddleware = require("./middleware/authMiddleware");
const AuthRouter = require("./routes/authRoutes");
const enqRouter = require("./routes/EnquiryForm/enquiryRoute");
const contactRouter = require("./routes/ContactForm/contactRoute");

const AllHeadingRouter = require("./routes/AllHeading/AllHeadingRoute");

const HomeBannerAdminRouter = require("./routes/HomeBanner/HomeBannerAdminRoute");
const HomeBannerUserRouter = require("./routes/HomeBanner/HomeBannerUserRoute");

const WhyChooseUsAdminRouter = require("./routes/WhyChooseUs/WhyChooseUsAdminRoute");
const WhyChooseUsUserRouter = require("./routes/WhyChooseUs/WhyChooseUsUserRoute");

const mediaRoutes = require("./routes/AllMedia/AllMediaRoutes");

const AboutUsAdminRoute = require("./routes/AboutUs/AboutUsAdminRoute");
const AboutUsUserRoute = require("./routes/AboutUs/AboutUsUserRoute");

const serviceAdminRouter = require("./routes/Service/ServiceAdminRoute");
const serviceUserRouter = require("./routes/Service/ServiceUserRoute");

const faqAdminRouter = require("./routes/FAQs/FAQsAdminRoute");
const faqUserRouter = require("./routes/FAQs/FAQsUserRoute");

const testimonialAdminRouter = require("./routes/Testimonial/testimonialAdminRoute");
const testimonialUserRouter = require("./routes/Testimonial/testimonialUserRoute");

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

app.use("/api/v1/admin/home-banner", HomeBannerAdminRouter);
app.use("/api/v1/user/home-banner", HomeBannerUserRouter);

app.use("/api/v1/admin/why-choose-us", WhyChooseUsAdminRouter);
app.use("/api/v1/user/why-choose-us", WhyChooseUsUserRouter);

app.use("/api/v1/admin/testimonal", testimonialAdminRouter);
app.use("/api/v1/user/testimonal", testimonialUserRouter);

app.use("/api/v1/media", mediaRoutes);

app.use("/api/v1/admin/about-us", AboutUsAdminRoute );
app.use("/api/v1/user/about-us", AboutUsUserRoute );


app.use("/api/v1/admin/service", serviceAdminRouter);
app.use("/api/v1/user/service", serviceUserRouter);


app.use("/api/v1/admin/faq", faqAdminRouter);
app.use("/api/v1/user/faq", faqUserRouter);

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
