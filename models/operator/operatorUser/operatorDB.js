const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: '',
    },

    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        default: '',


    },


    token: String,
   
     
    created_at: {
        type: Date,
        default: Date.now()
    }
});


const User = mongoose.model('operators', userSchema);

module.exports = User;