const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverScore = new Schema({
    driver_id: {
        type: String,
    },
    trip_id: {
        type: String,
    },
    rating: {
        type: Number,
        required: true
    },

    comment: {
        type: String,
        default: ''
    },

    customerPhone: {},

    created_at: {
        type: Date,
        default: Date.now
    },
    last_update: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('driverScore', driverScore);;