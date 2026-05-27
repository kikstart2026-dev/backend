const razorpayInstance = require("../../config/razorpay");

const Subscription = require("../../models/Subscription/SubscriptionModel");

const UserSubscription = require("../../models/SubscriptionPayment/SubscriptionPaymentModel");


// ========================================
// GET ALL PAYMENTS
// ========================================

exports.getAllPayments =
  async (req, res) => {

    try {

      const payments =
        await razorpayInstance.payments.all({

          count: 100,

        });

      const formattedPayments =
        payments.items.map((pay) => {

          let finalAmount =
            pay.amount;

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

        razorpay_payment_id,

        razorpay_order_id,

      } = req.body;

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

      // ================= SAVE =================

      const subscription =
        await UserSubscription.create({

          fullname,

          email,

          phone,

          subscriptionId,

          razorpay_payment_id,

          razorpay_order_id,

          amount:
            plan.amount,

          paymentDate,

          expireDate,

          status:
            "active",

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

          status: "active",

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
// REFUND PAYMENT
// ========================================

exports.deletePayment =
  async (req, res) => {

    try {

      const { paymentId } =
        req.params;

      const payment =
        await razorpayInstance.payments.fetch(
          paymentId
        );

      if (
        payment.status ===
        "refunded"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Payment already refunded",

        });
      }

      const refund =
        await razorpayInstance.payments.refund(

          paymentId,

          {
            amount:
              payment.amount,
          }

        );

      res.status(200).json({

        success: true,

        message:
          "Payment refunded successfully",

        refund,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Refund failed",

        error:
          error.message,

      });
    }
  };