const axios = require("axios");

const sendMail = async (to, subject, html) => {

  console.log(
    "BREVO KEY:",
    process.env.BREVO_API_KEY
  );
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.MAIL_NAME,
          email: process.env.MAIL_FROM,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("✅ Brevo mail sent");
  } catch (error) {
    console.log(
      "❌ Brevo mail error:",
      error.response?.data || error.message
    );
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