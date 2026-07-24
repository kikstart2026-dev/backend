
const nodemailer = require("nodemailer");

const sendMail = async (to, subject, html) => {
  try {

    console.log({
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      MAIL_FROM: process.env.MAIL_FROM,
    });
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.MAIL_NAME}" <${process.env.MAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log("Mail sent");
  } catch (error) {
    console.log("Mail error:", error);
  }
};

module.exports = sendMail;

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