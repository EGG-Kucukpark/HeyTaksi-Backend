const mongosee = require('mongoose');
const Schema = mongosee.Schema;


const timeSchedule = new Schema({
    start: {
        type: String,
        default: ''

    },
    end: {
        type: String,
        default: ''

    },
    priceRatio: {
        type: String,
        default: ''

    },
    day: {
        type: String,
        default: ''
    }


});


module.exports = mongosee.model('timeSchedule', timeSchedule);