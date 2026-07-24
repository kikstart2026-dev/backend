const nodemailer = require("nodemailer");

const sendMail = async (to, subject, html) => {
  console.log("📧 sendMail called");

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("📧 transporter created");

    await transporter.verify();
    console.log("✅ SMTP Connected");

    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html,
    });

    console.log("✅ Mail sent");
  } catch (err) {
    console.error("❌ Mail Error:", err);
  }
}

const emailTemplate = (title, body) => {
  return `
    <div style="padding:20px;font-family:Arial">
      <h2>${title}</h2>
      ${body}
      <br/>
      <p>KikStart Team 💙</p>
    </div>
  `;
};

module.exports = {
  sendMail,
  emailTemplate,
};