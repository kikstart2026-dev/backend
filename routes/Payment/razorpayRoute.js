const express = require('express');
const router = express.Router();
const razorpayInstance = require('../../controllers/Payment/razorpay');

// Endpoint to create an order
router.post('/kikPayment', async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const options = {
            amount: amount * 100, // Convert amount to smallest currency unit
            currency: currency || 'INR',
        };

        const order = await razorpayInstance.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating RazorPay order');
    }
});

module.exports = router;