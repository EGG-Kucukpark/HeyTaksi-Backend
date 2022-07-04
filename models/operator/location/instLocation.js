const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userLocationSchema = new Schema({
  userPhone: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "online",
  },
  location: {
    type: Object,
    required: true,
  },
  isTripOn: {
    type: Boolean,
    default: false,
  },

  beforePrice: {
    type: Number,
    default: 0,
  },
  driver: Object,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

var instuserLocation = mongoose.model("instuserLocation", userLocationSchema);
module.exports = instuserLocation;
