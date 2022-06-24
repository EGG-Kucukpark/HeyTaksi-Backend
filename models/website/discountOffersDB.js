const mongoose = require("mongoose");

const discountOffersSchema = new mongoose.Schema(
  {
    offeredPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "waiting",
    },
    location: {
      start: String,
      end: String,
    },
    estimatedPrice: Number,
    estimatedKm: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "webUsers",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("discountOffers", discountOffersSchema);
