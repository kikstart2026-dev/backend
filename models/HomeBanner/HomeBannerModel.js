const mongoose = require("mongoose");

const HomeBannerSchema = new mongoose.Schema(
  {
    headingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Heading",
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    // ✅ ACTIVE FIELD
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeBanner", HomeBannerSchema);