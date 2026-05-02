const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    dynamicRole: {
      type: String,
      required: true,
      trim: true, // e.g. "manager", "editor"
    },

    module: {
      type: String,
      required: true,
      trim: true, // e.g. "user", "product"
    },

    create: {
      type: Boolean,
      default: false,
    },

    read: {
      type: Boolean,
      default: false,
    },

    update: {
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

// 🔥 prevent duplicate role + module
permissionSchema.index(
  { dynamicRole: 1, module: 1 },
  { unique: true }
);

module.exports = mongoose.model("Permission", permissionSchema);