const mongoose = require("mongoose");

const HomeBannerSchema = new mongoose.Schema(
  {
    headingId: {
      type: mongoose.Schema.Types.ObjectId, // it is to fetch the exact form of unique mongo id
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