const mongoose = require("mongoose");

const customerLogSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "webUsers",
    },
    action: String,
    location: {
      start: String,
      end: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("customerLog", customerLogSchema);
