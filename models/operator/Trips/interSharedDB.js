const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interSharedDB = new Schema({

    customerName: {},
    customerPhone: {},
    departure: {},
    arrival: {},
    date: {},
    time: {},
    price: {},
    seats: {},
    driver: {},
    driverPhone: {},
    car: {},
    status: {},
    departureLocation: {},


})



module.exports = mongoose.model('interSharedDB', interSharedDB);