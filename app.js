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

const AboutUsAdminRouter = require("./routes/AboutUs/AboutUsAdminRoute");
const AboutUsUserRouter = require("./routes/AboutUs/AboutUsUserRoute");

const serviceAdminRouter = require("./routes/Service/ServiceAdminRoute");
const serviceUserRouter = require("./routes/Service/ServiceUserRoute");

const faqAdminRouter = require("./routes/FAQs/FAQsAdminRoute");
const faqUserRouter = require("./routes/FAQs/FAQsUserRoute");

const testimonialAdminRouter = require("./routes/Testimonial/testimonialAdminRoute");
const testimonialUserRouter = require("./routes/Testimonial/testimonialUserRoute");

const schoolAdminRouter = require("./routes/Schools/SchoolsAdminRoute");
const schoolUserRouter = require("./routes/Schools/SchoolsUserRoute");

const adminAuthRouter = require("./routes/adminAuthRoutes");
const roleRouter = require("./routes/Role/RoleRoute");
const userRouter = require("./routes/User/UserRoute");

// const moduleRoutes = require("./routes/ModulesRoute");
const permissionRoutes = require("./routes/PermissionRoute");
const userRoutes = require("./routes/CreateUserRoute");

const coachRoutes = require("./routes/CreateCoachRoute");

const paymentRoutes = require('./routes/Payment/razorpayRoute');

const ChildrenFormRouter = require("./routes/ChildrenForm/ChildrenFormRoute");

const SchoolDetailsRouter = require("./routes/SchoolDetails/SchoolDetailsRoute");

const ConversationRouter = require("./routes/Conversation/ConversationRoute");

const MessageRouter = require("./routes/Conversation/MessageRoute");
const notificationRoutes = require( "./routes/notificationRoutes" );

//subscription
const subscriptionRoutes = require( "./routes/Subscription/SubscriptionRoute");

const subscriptionPaymentRoutes = require( "./routes/SubscriptionPayment/SubscriptionPaymentRoute" );

  



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


// 👇 এটা যোগ করো
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});


app.use(cookieParser());

// 🔥 Static Upload Folder
app.use(
  "/uploads",
  express.static(path.join(__dirname, "middleware/uploads"))
);



// Routes

app.use("/api/v1/admin", adminAuthRouter);
app.use("/api/v1/admin/roles",roleRouter);
app.use("/api/v1/admin/users",authMiddleware, userRouter);

app.use("/api/v1/admin/home-banner",authMiddleware, HomeBannerAdminRouter);
app.use("/api/v1/user/home-banner", HomeBannerUserRouter);

app.use("/api/v1/admin/why-choose-us", authMiddleware, WhyChooseUsAdminRouter);
app.use("/api/v1/user/why-choose-us", WhyChooseUsUserRouter);

app.use("/api/v1/admin/testimonal",authMiddleware, testimonialAdminRouter);
app.use("/api/v1/user/testimonal", testimonialUserRouter);

app.use("/api/v1/media", mediaRoutes);

app.use("/api/v1/admin/about-us", authMiddleware, AboutUsAdminRouter );
app.use("/api/v1/user/about-us", AboutUsUserRouter );


app.use("/api/v1/admin/service", authMiddleware,serviceAdminRouter);
app.use("/api/v1/user/service", serviceUserRouter);

app.use("/api/v1/admin/schools",authMiddleware, schoolAdminRouter);
app.use("/api/v1/user/schools", schoolUserRouter);

app.use("/api/v1/admin/faq",authMiddleware, faqAdminRouter);
app.use("/api/v1/user/faq", faqUserRouter);


app.use("/api/v1", enqRouter);

app.use("/api/v1", contactRouter);

// app.use("/api/v1/admin", moduleRoutes);
app.use("/api/v1/admin", permissionRoutes);
app.use("/api/v1/admin", userRoutes);

app.use("/api/v1", AuthRouter);

app.use("/api/v1/headings", AllHeadingRouter);

app.use("/api/v1/children", ChildrenFormRouter);

app.use("/api/v1/school", SchoolDetailsRouter);

app.use("/api/v1/conversation", ConversationRouter);

app.use("/api/v1/message", MessageRouter);

app.use("/api/v1",paymentRoutes);

//sunscription
app.use( "/api/v1/subscription",subscriptionRoutes);

app.use( "/api/v1/subscription-payment", subscriptionPaymentRoutes);

app.use("/api/v1/coach", coachRoutes);
app.use("/api/v1/admin/coach", coachRoutes);

app.use(
  "/api/v1/notification",
  notificationRoutes
);

app.get("/api/v1", authMiddleware, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
  });
});


module.exports = app;