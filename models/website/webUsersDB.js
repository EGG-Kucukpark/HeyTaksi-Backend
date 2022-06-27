const mongoose = require("mongoose");

const webUsersSchema = new mongoose.Schema(
  {
    fullname: String,
    phone: String,
    email: String,
    profileImage: {
      default: null,
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("webUsers", webUsersSchema);
