const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.payKey, // Use environment variables for security
    key_secret: process.env.paySecret,
});

module.exports = razorpayInstance;