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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeBanner", HomeBannerSchema);