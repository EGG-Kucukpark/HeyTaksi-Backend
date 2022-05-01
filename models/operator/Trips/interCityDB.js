const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interCityDB = new Schema({
    departure: {},
    arrival: {},
    date: {},
    time: {},
    price: {},
    users:{
        type: Array,
        default: []
    },
    seats: {},
    driver: {},
    driverPhone: {},
    car: {},
    status: {},
    departureLocation: {},
    type: {},
    arrivalLocation: {},
    createdAt: {
        type: Date,
        default: Date.now

    },

})



module.exports = mongoose.model('interCityDB', interCityDB);