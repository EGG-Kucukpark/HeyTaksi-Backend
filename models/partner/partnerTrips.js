const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var tripSchema = new Schema({
    driverID: {
        type: String,
        required: true
    },
    driverName: String,
    customerName: String,
    driverPhone: {
        type: String,
        required: true

    },
    customerPhone: {
        type: String,
        required: true
    },
    distance: {
        type: Number,
        default: 0
    },
    timestamp: {},
    startLocation: {},
    endLocation: {},
    start: String,
    end: String,
    total: {
        type: Number,
        default: 0
    },
    partnerAddressLocation: {},
    partnerDiscounted: {},
    wait_time: {},
    coupon: {
        type: Boolean,
        default: false
    },
    coupon_code: {},
    coupon_discount: {},
    created_at: {
        type: Date,
        default: Date.now
    },
});


module.exports = mongoose.model('partnerTrips', tripSchema);