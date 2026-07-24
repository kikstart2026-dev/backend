const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });

const app = require("./app");

const port = process.env.PORT || 3000;

const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => {
    console.log("🥹  DB connection Successful!! 👻");
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
  });

  console.log("SMTP_HOST =", process.env.SMTP_HOST);
console.log("SMTP_PORT =", process.env.SMTP_PORT);
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("MAIL_FROM =", process.env.MAIL_FROM);


app.listen(port, () => {
  console.log(`✅ App is running at http://localhost:${port} ...`);
  // console.log("EMAIL =", process.env.EMAIL);
  // console.log("EMAIL_PASS =", process.env.EMAIL_PASS ? "YES" : "NO");
});
