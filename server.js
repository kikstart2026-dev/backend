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

app.listen(port, () => {
  console.log(`✅ App is running at http://localhost:${port} ...`);
});
