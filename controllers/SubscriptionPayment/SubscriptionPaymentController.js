const razorpayInstance =
    require("../../config/razorpay");

const Subscription =
    require("../../models/Subscription/SubscriptionModel");

const UserSubscription =
    require("../../models/SubscriptionPayment/SubscriptionPaymentModel");

    const exportCSV =
  require("../../utils/exportCSV");


// ========================================
// GET ALL PAYMENTS
// ========================================
exports.getAllPayments = async (req, res) => {
    try {

        // PAGINATION
        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 5;

        const skip =
            (page - 1) * limit;

        // SEARCH
        const search =
            req.query.search || "";

        // FILTER
        const statusFilter =
            req.query.status || "";

        // SORT
        const sortBy =
            req.query.sortBy || "createdAt";

        const sortOrder =
            req.query.sortOrder || "desc";

        // BASE QUERY
        const query = {};

        // PLAN FILTER
        const planFilter =
            req.query.plan || "";

        if (planFilter) {
            query.planName =
                planFilter;
        }

        // SEARCHING (NAME + EMAIL)
        if (search) {

            query.$or = [

                {
                    fullname: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    email: {
                        $regex: search,
                        $options: "i",
                    },
                },

            ];
        }

        // FILTERING (CAPTURED / FAILED)
        if (statusFilter) {
            query.status =
                statusFilter;
        }

        // SORTING
        const sort = {};

        sort[sortBy] =
            sortOrder === "asc"
                ? 1
                : -1;

        // GET PAYMENTS
        const payments =
            await UserSubscription.find(query)

                .populate("subscriptionId")

                .sort(sort)

                .skip(skip)

                .limit(limit);

        // TOTAL COUNT
        const total =
            await UserSubscription.countDocuments(
                query
            );

        // TOTAL AMOUNT
        const totalAmount =
            await UserSubscription.aggregate([
                {
                    $match: query,
                },

                {
                    $group: {
                        _id: null,

                        totalAmount: {
                            $sum: {
                                $toDouble: "$amount",
                            },
                        },
                    },
                },
            ]);

        res.status(200).json({
            success: true,

            totalPayments: total,

            totalAmount:
                totalAmount.length > 0
                    ? totalAmount[0]
                        .totalAmount
                    : 0,

            payments,

            page,

            totalPages:
                Math.ceil(total / limit),
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,

            message:
                "Failed to fetch payments",

            error: error.message,
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

            const paymentDate = new Date();

            const durationDays = parseInt(plan.durationDays || 0);

            if (durationDays <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid plan duration",
                });
            }

            const expireDate = new Date(paymentDate);
            expireDate.setDate(expireDate.getDate() + durationDays);

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

                    created_at: new Date(razorpayPayment.created_at * 1000),

                    fee: razorpayPayment.fee ? razorpayPayment.fee / 100 : 0,

                    tax: razorpayPayment.tax ? razorpayPayment.tax / 100 : 0,

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


exports.getMyPayments = async (req, res) => {
    try {
        const { email } = req.params;

        const payments =
            await UserSubscription.find({
                email,
            })
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
        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};


// ========================================
// MONTH WISE PLAN REVENUE
// ========================================

exports.getMonthlyPlanRevenue = async (req, res) => {
    try {
        const revenue = await UserSubscription.aggregate([
            {
                $match: {
                    status: "captured",
                },
            },
            {
                $group: {
                    _id: {
                        year: {
                            $year: "$paymentDate",
                        },
                        month: {
                            $month: "$paymentDate",
                        },
                        plan: "$planName",
                    },
                    totalRevenue: {
                        $sum: "$amount",
                    },
                    totalSubscriptions: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    "_id.year": -1,
                    "_id.month": -1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            revenue,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



exports.exportPaymentsCSV = async (req, res) => {
  try {
    const payments = await UserSubscription.find({
      status: "captured",
    })
      .populate("subscriptionId")
      .sort({ createdAt: -1 });

    const data = payments.map((item) => ({
      Name: item.fullname,
      Email: item.email,
      Phone: item.phone,
      PlanName: item.planName,
      Amount: item.amount,
      PaymentId: item.payment_id,
      OrderId: item.order_id,
      Status: item.status,
      Method: item.method,
      Currency: item.currency,
      PaymentDate: item.paymentDate,
      ExpireDate: item.expireDate,
      CreatedAt: item.createdAt,
    }));

    exportCSV(
      data,
      "payments",
      res
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};