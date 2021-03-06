const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "webUsers",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "driver",
    },
    location: {
      start: String,
      end: String,
    },
    distance: Number,
    estimatedPrice: Number,
    date: Date,
    status: {
      type: String,
      default: "waiting",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("appointment", appointmentSchema);
