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

    kvkk: {
        type: Boolean,
        default: true
    },


    disabled: {
        type: Boolean,
        default: false,

    },

    sub_users: {
        type: Array,
        default: []

    },

    token: String,
    user_type: {
        type: String,
        default: ''
    },

    credits: Number,
    
    company_phone: {
        type: String,
        default: ''
    },

    partner_phone: {
        type: String,
        default: ''
    },

    created_at: {
        type: Date,
        default: Date.now()
    }
});


const User = mongoose.model('customers', userSchema);

module.exports = User;