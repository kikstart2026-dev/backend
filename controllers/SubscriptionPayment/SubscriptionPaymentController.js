const razorpayInstance =
    require("../../config/razorpay");

const Subscription =
    require("../../models/Subscription/SubscriptionModel");

const UserSubscription =
    require("../../models/SubscriptionPayment/SubscriptionPaymentModel");


// ========================================
// GET ALL PAYMENTS
// ========================================

exports.getAllPayments =
    async (req, res) => {

        try {

            const payments =
                await UserSubscription.find()

                    .populate("subscriptionId")

                    .sort({
                        createdAt: -1,
                    });

            const totalAmount =
                payments.reduce(

                    (acc, item) =>
                        acc + item.amount,

                    0

                );

            res.status(200).json({

                success: true,

                totalPayments:
                    payments.length,

                totalAmount,

                payments,

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


// ========================================
// SAVE USER SUBSCRIPTION
// ========================================

exports.saveSubscription =
    async (req, res) => {

        try {

            const {

                fullname,
                email,
                phone,
                subscriptionId,
                payment_id,

            } = req.body;

            // ================= VALIDATION =================

            if (
                !fullname ||
                !email ||
                !phone ||
                !subscriptionId ||
                !payment_id
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "All fields are required",

                });
            }

            // ================= FIND PLAN =================

            const plan =
                await Subscription.findById(
                    subscriptionId
                );

            if (!plan) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Plan not found",

                });
            }

            // ================= FETCH PAYMENT =================

            let razorpayPayment =

                await razorpayInstance
                    .payments
                    .fetch(
                        payment_id
                    );

            // ================= AUTO CAPTURE =================

            if (
                razorpayPayment.status ===
                "authorized"
            ) {

                await razorpayInstance
                    .payments
                    .capture(

                        payment_id,

                        razorpayPayment.amount

                    );

                // FETCH AGAIN AFTER CAPTURE

                razorpayPayment =

                    await razorpayInstance
                        .payments
                        .fetch(
                            payment_id
                        );
            }

            // ================= PAYMENT STATUS CHECK =================

            if (
                razorpayPayment.status !==
                "captured"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment not captured",

                });
            }

            // ================= DUPLICATE CHECK =================

            const alreadyExists =
                await UserSubscription.findOne({

                    payment_id:
                        razorpayPayment.id,

                });

            if (alreadyExists) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment already saved",

                });
            }

            // ================= PAYMENT DATE =================

            const paymentDate =
                new Date();

            // ================= EXPIRE DATE =================

            const expireDate =
                new Date(paymentDate);

            expireDate.setDate(

                expireDate.getDate() +

                plan.durationDays

            );

            // ================= SAVE SUBSCRIPTION =================

            const subscription =
                await UserSubscription.create({

                    fullname,

                    email,

                    phone,

                    subscriptionId,

                    planName:
                        plan.planName,

                    amount:
                        plan.amount,

                    // ================= RAZORPAY DETAILS =================

                    payment_id:
                        razorpayPayment.id,

                    order_id:
                        razorpayPayment.order_id,

                    currency:
                        razorpayPayment.currency,

                    status:
                        razorpayPayment.status,

                    method:
                        razorpayPayment.method,

                    contact:
                        razorpayPayment.contact,

                    created_at:
                        new Date(

                            razorpayPayment.created_at * 1000

                        )

                            .toISOString()

                            .split("T")[0],

                    fee:
                        razorpayPayment.fee,

                    tax:
                        razorpayPayment.tax,

                    refund_status:
                        razorpayPayment.refund_status,

                    description:
                        razorpayPayment.description,

                    // ================= DATE =================

                    paymentDate,

                    expireDate,

                });

            res.status(201).json({

                success: true,

                message:
                    "Subscription activated successfully",

                subscription,

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({

                success: false,

                message:
                    error.message,

            });
        }
    };


// ========================================
// GET USER ACTIVE PLAN
// ========================================

exports.getUserActivePlan =
    async (req, res) => {

        try {

            const { email } =
                req.params;

            const activePlan =
                await UserSubscription.findOne({

                    email,

                    status:
                        "captured",

                })

                    .sort({
                        createdAt: -1,
                    })

                    .populate(
                        "subscriptionId"
                    );

            if (!activePlan) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No active subscription found",

                });
            }

            // ================= DAYS LEFT =================

            const today =
                new Date();

            const expireDate =
                new Date(
                    activePlan.expireDate
                );

            const diffTime =
                expireDate - today;

            const daysLeft =
                Math.ceil(

                    diffTime /

                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )

                );

            res.status(200).json({

                success: true,

                subscription:
                    activePlan,

                daysLeft:
                    daysLeft > 0
                        ? daysLeft
                        : 0,

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({

                success: false,

                message:
                    error.message,

            });
        }
    };


// ========================================
// DELETE PAYMENT
// ========================================

exports.deletePayment =
    async (req, res) => {

        try {

            const { paymentId } =
                req.params;

            const payment =
                await UserSubscription.findById(
                    paymentId
                );

            if (!payment) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Payment not found",

                });
            }

            await UserSubscription.findByIdAndDelete(
                paymentId
            );

            res.status(200).json({

                success: true,

                message:
                    "Payment deleted successfully",

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({

                success: false,

                message:
                    "Delete failed",

                error:
                    error.message,

            });
        }
    };