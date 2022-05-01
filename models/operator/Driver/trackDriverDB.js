const Mongoose = require("mongoose")
const Schema = Mongoose.Schema;



let driverSchema = new Schema({
       driverID: {},
       name: {},
       phone: {},
       lat: {},
       lng: {},
       status: {},
       last_online: {},
       last_update: {},
       customerName: {},
       customerPhone: {},

})


module.exports = Mongoose.model('driverTrack', driverSchema);