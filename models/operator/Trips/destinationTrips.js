const mongosee  = require('mongoose');
const Schema    = mongosee.Schema;

const destinationTripsSchema = new Schema({
    tripId: {},
    destination: {},
    customerPhone: {},
    customerName: {},
    driverPhone: {},
    driverName: {},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongosee.model('destinationTrips', destinationTripsSchema);

