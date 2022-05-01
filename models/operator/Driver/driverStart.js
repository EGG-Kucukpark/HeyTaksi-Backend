const mongoose = require('mongoose')
const Schema = mongoose.Schema


var tripStart = new Schema({

    name: {
        type: String,
        required: true
    },
    driver_id: {
        type: Schema.Types.ObjectId,
    },

    customer_name: {
        type: String,
        required: true
    },

    customer_id: {
        type: Schema.Types.ObjectId,

    },

    total_KM: {
        type: Number,
        required: true

    }


})

module.exports = mongoose.model('trips', tripStart)