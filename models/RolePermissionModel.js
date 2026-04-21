const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
    //   enum: ["admin", "subadmin"],
      required: true,
    },

    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },

    create: {
      type: Boolean,
      default: false,
    },

    view: {
      type: Boolean,
      default: false,
    },

    edit: {
      type: Boolean,
      default: false,
    },

    delete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);