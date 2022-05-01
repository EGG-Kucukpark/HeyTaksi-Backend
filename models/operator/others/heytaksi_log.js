const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const heytaksiLog = new Schema({

    ip_address: {
        required: true,
        type: String
    },

    il: {
        type: String
    },

    clicks: {
        type: Object,
        default: {
            visit: 0,
            calculate: 0,
            callTaxi: 0,
            whatsappButton: 0,
            phone: 0,
            ads: 0,
            friendClick: 0,
            keyword: 0
        }
    },

    closed: {
        type: Boolean,
        default: false
    },
    key:{
        type:String
    },

    created_at: {
        type: Date,
        default: Date.now
    },

    logout_at: {
        type:Date
    }



});


module.exports = mongoose.model('heytaksiLog', heytaksiLog);