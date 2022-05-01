const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const tokenSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    type:{
        type: String,
        required: true
    }

});

const Token = mongoose.model('Token', tokenSchema);

exports.Token = Token;