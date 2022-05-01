const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const interVipDB = new Schema({

    customerName: {},
    customerPhone: {},
    departure: {},
    arrival: {},
    date: {},
    time: {},
    price: {},
    departureLocation: {},
    driver: {},
    driverPhone: {},
    car: {},
    status: {},

})


module.exports = mongoose.model('interVipDB', interVipDB);
