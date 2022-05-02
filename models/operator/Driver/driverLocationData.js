const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverLocationData = new Schema({
    driverID: {
        type: String,
        required: true
    },
    driverName: {},
    driverPhone:{},
    location: {},
    status: {

    },
    timestamp: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('driverLocationData', driverLocationData);