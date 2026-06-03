// ========================================
// controllers/subscriptionController.js
// ========================================

const Subscription = require("../../models/Subscription/SubscriptionModel");


// ========================================
// CREATE PLAN
// ========================================

exports.createPlan =
  async (req, res) => {

    try {

      const plan =
        await Subscription.create(
          req.body
        );

      res.status(201).json({

        success: true,

        message:
          "Plan created successfully",

        plan,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message,

      });
    }
  };


// ========================================
// GET ALL PLANS
// ========================================

exports.getAllPlans =
  async (req, res) => {

    try {

      const plans =
        await Subscription.find({
          isActive: true,
        });

      res.status(200).json({

        success: true,

        plans,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message,

      });
    }
  };


// ========================================
// GET SINGLE PLAN
// ========================================

exports.getSinglePlan =
  async (req, res) => {

    try {

      const plan =
        await Subscription.findById(
          req.params.id
        );

      if (!plan) {

        return res.status(404).json({

          success: false,

          message:
            "Plan not found",

        });
      }

      res.status(200).json({

        success: true,

        plan,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message,

      });
    }
  };


// ========================================
// UPDATE PLAN
// ========================================

exports.updatePlan =
  async (req, res) => {

    try {

      const plan =
        await Subscription.findByIdAndUpdate(

          req.params.id,

          req.body,

          {
            new: true,
          }

        );

      res.status(200).json({

        success: true,

        message:
          "Plan updated successfully",

        plan,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message,

      });
    }
  };


// ========================================
// DELETE PLAN
// ========================================

exports.deletePlan =
  async (req, res) => {

    try {

      await Subscription.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({

        success: true,

        message:
          "Plan deleted successfully",

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message,

      });
    }
  };
