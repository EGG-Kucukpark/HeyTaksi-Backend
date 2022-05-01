const mongoose = require('mongoose');
const Schmea = mongoose.Schema;

var driverSchema = new Schmea({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true

    },
    tc: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    arac: {

    },
    il: {
        type: String,
    },

    arac_plaka: {
        type: String,
    },
    status: {

    },

    saveData: {

    },

    created_at: {
        type: Date,
        default: Date.now
    },
    score: {
        type: Number,
        default: 0
    },

    last_online: {
        type: Date,
    },
    last_update: {
        type: Date,
        default: Date.now
    },

    cancelCount: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    }
})


module.exports = mongoose.model('driver', driverSchema);