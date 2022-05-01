const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const heytaksiLogDetails = new Schema({

    ip_address: {
        type: String
    },

    il:{
        type: String
    },

    type: {},

    created_at: {
        type: Date,
        default: Date.now
    }



});


module.exports = mongoose.model('heytaksiLogDetails', heytaksiLogDetails);