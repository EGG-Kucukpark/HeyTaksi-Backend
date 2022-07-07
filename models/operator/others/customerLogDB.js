const mongoose = require("mongoose");

const customerLogSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
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
