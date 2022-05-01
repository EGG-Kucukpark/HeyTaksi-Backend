const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    phone: {
        type: String,
        required: true,
    },
    date: {
        type: String,
    },
    time: {
        type: String,
    },
    
    startAddress: {
        type: String
    },
    destinationAddress: {
        type: String
    },

    address1Loc: {},
    address2Loc: {},
    driver: {
        type: String,
        default: '',
    },
    driverPhone: {
        type: String,
        default: ''
    },
    driver_id: {


    },

    archived: {
        type: Boolean,
        default: false,
        
    },

    created_at: {
        type: Date,
        default: Date.now()
    }
});


const userAppointment = mongoose.model('userappointments', userSchema);

module.exports = userAppointment;