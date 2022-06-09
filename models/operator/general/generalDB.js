const mongosee = require("mongoose");
const Schema = mongosee.Schema;

const generalSchema = new Schema({
  price: {
    type: Number,
    default: 0,
  },
  estimatedPrice: {
    type: Number,
    default: 0,
  },
  waitPrice: {
    type: Number,
    default: 0,
  },
  minPrice: {
    type: Number,
    default: 0,
  },
  driverDiscount: {
    type: Number,
    default: 0,
  },
  partnerDiscount: {
    type: Number,
    default: 0,
  },
  minDistance: {
    type: Number,
    default: 0,
  },
  maxDistance: {
    type: Number,
    default: 0,
  },
  minTime: {
    type: Number,
    default: 0,
  },

  times: {
    type: Object,
    default: {
      start: "",
      end: "",
    },
  },

  toCustomer: {
    type: Number,
    default: 0,
  },

  prices: {
    type: Object,
    default: {
      Monday: ["Deneme"],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
  },

  msgCall: {
    type: Boolean,
    default: false,
  },
  hrCall: {
    type: Boolean,
    default: false,
  },
  adsCall: {
    type: Boolean,
    default: false,
  },
  numbers: {
    type: Object,
    default: {
      msgNumbers: ["x"],
      hrNumbers: ["x"],
      adsNumbers: ["x"],
    },
  },
});

module.exports = mongosee.model("general", generalSchema);
