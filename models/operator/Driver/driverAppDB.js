const mongoose = require('mongoose');
const Schmea = mongoose.Schema;

var driverAppSchema = new Schmea({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true

    },

    file: {
        type: String,
    },
    arac: {
    },
    iban: {
        type: String,
    },
    il: {
        type: String,
    },

    referans: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now

    },

})

var driverApp = mongoose.model('driver_applications', driverAppSchema);
module.exports = driverApp;