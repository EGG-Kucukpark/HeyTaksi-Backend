const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var tripSchema = new Schema({
    trip_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    lng: {
        type: Number,
    },
    lat: {
        type: Number,
    },
    start: {
        type: String,
    },
    end: {
        type: String,
    },

    total: {
        type: Number,

    },
    discounted_price: {
        type: Number,

    },
    coupon: {
        type: Boolean,
        default: false
    },
    distance: {
        type: Number,
    },

    created_at: {
        type: Date,
        default: Date.now
    }


})


module.exports = mongoose.model('alltrips', tripSchema);