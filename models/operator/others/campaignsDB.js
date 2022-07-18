const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    name: String,
    content: String,
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("campaign", campaignSchema);
