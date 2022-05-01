const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userLocationSchema = new Schema({
    userPhone: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    location: {
        type: Object,
        required: true
    },
    beforePrice:{
        type: Number,
        default: 0
    },
    createdAt: {
        
        type: Date,
        default: Date.now
    }
});

var userLocation = mongoose.model('userLocation', userLocationSchema);
module.exports = userLocation;