const User = require("../../models/authModel");
const UserSubscription = require(
  "../../models/SubscriptionPayment/SubscriptionPaymentModel"
);
const exportCSV = require("../../utils/exportCSV");

exports.getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";
    const roleFilter = req.query.role || "";

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

    const skip = (page - 1) * limit;

    const query = {};

    // Search
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

    // Role Filter
    if (roleFilter) {
      query.role = roleFilter;
    }

    // Sorting
    const sort = {};

    sort[sortBy] =
      sortOrder === "asc"
        ? 1
        : -1;

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};


exports.getChatUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.exportUsersCSV = async (req, res) => {
  try {

    const users = await User.find().sort({
      createdAt: -1,
    });

    const payments =
      await UserSubscription.find({
        status: "captured",
      });

    const data = users.map((user) => {

      const isPaid = payments.some(
        (pay) =>
          pay.email?.toLowerCase() ===
          user.email?.toLowerCase()
      );

      return {
        FullName: user.fullname,
        Email: user.email,
        Phone: user.phone || "N/A",
        Verified: user.isVerified
          ? "Verified"
          : "Not Verified",
        Payment: isPaid
          ? "Paid"
          : "Unpaid",
        CreatedDate: new Date(
          user.createdAt
        ).toLocaleDateString(),
      };
    });

    exportCSV(data, "users", res);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};