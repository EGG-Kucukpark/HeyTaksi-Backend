const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userCouponsSchema = new Schema({

    phone:{
        type: String,
        required: true
    },
    name:{
        type: String,
    },
    coupoun_code:{
        type: String,
    },
    coupoun_used:{
        type: Boolean,
        default: false
    },
    main_phone:{
        type: String,
        default: null
        
    },
    created_at:{
        type: Date,
        default: Date.now
    },



});

module.exports = mongoose.model('userCoupons', userCouponsSchema);