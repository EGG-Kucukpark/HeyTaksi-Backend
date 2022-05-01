const mongoose = require('mongoose');
const Schmea = mongoose.Schema;

var locationSchema = new Schmea({
    name: {
        type: String,
        required: true
    },
    lat: {
        type: String,
        required: true

    },
    lng: {
        type: String,
        required: true
    },
    
    beforePrice:{
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now

    },
    
    
})

var locations = mongoose.model('locations', locationSchema);
module.exports = locations;