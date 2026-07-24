const nodemailer = require("nodemailer");

const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html,
    });

    console.log("Mail sent");
  } catch (error) {
    console.log(error);
  }
};

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