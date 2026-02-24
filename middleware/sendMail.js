const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendMail = async (email, subject, html) => {
  try {
    const mailInfo = await transporter.sendMail({
      from: `"KikStart 🚀" <${process.env.EMAIL}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log("✅ Email sent:", mailInfo.response);
  } catch (error) {
    console.error("❌ Mail error:", error);
    throw new Error("Failed to send email");
  }
};