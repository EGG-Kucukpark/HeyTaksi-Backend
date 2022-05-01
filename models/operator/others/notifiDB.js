const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    userPhone: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },

    Notype: {
        type: String,
    },

    read:{
        type: Boolean,
        default: false

    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

var notification = mongoose.model('notifications', notificationSchema);
module.exports = notification;