const twilio = require("twilio");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const SERVICE_SID = process.env.TWILIO_CONVERSATION_SERVICE_SID;

module.exports = { client, SERVICE_SID };