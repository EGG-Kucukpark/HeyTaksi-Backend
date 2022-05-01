const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const active = new Schema({

    trip_id: {
        type: String,
        required: true

    },
    driverName: {
        type: String,
        required: true

    },
    driverPhone: {
        type: String,
        required: true

    },
    customerPhone: {
        type: String,
        required: true

    },
    customerName: {
        type: String,
        required: true

    },

    start: {
        type: String,
        required: true

    },

});


module.exports = mongoose.model('activeTrips', active);