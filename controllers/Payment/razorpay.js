const razorpayInstance = require("../../config/razorpay");


// GET ALL PAYMENT DETAILS
exports.getAllPayments = async (
    req,
    res
) => {

    try {

        // fetch payments from razorpay
        const payments =
            await razorpayInstance.payments.all({
                count: 100,
            });

        const formattedPayments =
            payments.items.map((pay) => {

                // Razorpay stores amount
                // in smallest currency unit
                // Example:
                // INR => paisa
                // USD => cents

                let finalAmount =
                    pay.amount;

                // convert to actual amount
                if (
                    [
                        "INR",
                        "USD",
                        "EUR",
                        "GBP",
                    ].includes(pay.currency)
                ) {

                    finalAmount =
                        pay.amount / 100;
                }

                return {

                    payment_id:
                        pay.id,

                    order_id:
                        pay.order_id,

                    amount:
                        finalAmount,

                    currency:
                        pay.currency,

                    status:
                        pay.status,

                    method:
                        pay.method,

                    fullname:
                        pay.notes?.fullname,

                    email:
                        pay.notes?.email,
                    contact:
                        pay.contact,

                    created_at:
                        new Date(
                            pay.created_at * 1000
                        ).toLocaleString(),

                    fee:
                        pay.fee
                            ? pay.fee / 100
                            : 0,

                    tax:
                        pay.tax
                            ? pay.tax / 100
                            : 0,

                    refund_status:
                        pay.refund_status,

                    description:
                        pay.description,
                };
            });

        // total amount
        const totalAmount =
            formattedPayments.reduce(
                (acc, item) =>
                    acc + item.amount,
                0
            );

        res.status(200).json({
            success: true,

            totalPayments:
                formattedPayments.length,

            totalAmount,

            payments:
                formattedPayments,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,

            message:
                "Failed to fetch payments",

            error:
                error.message,
        });
    }
};