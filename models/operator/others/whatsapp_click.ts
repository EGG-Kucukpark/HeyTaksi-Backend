const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const whatsappClickSchema = new Schema({

    ip_address: {
        type: String
    },

    click_time: {
        type: Date,
        default: Date.now
    },

    clicked:{
        type:Number,
        default:1
    }

});


module.exports = mongoose.model('WhatsappLogs', whatsappClickSchema);