const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://toorDeniz:toorDeniz@cluster0.ysmk8.mongodb.net/heyTaksiServer?retryWrites=true&w=majority', (e) => {
        if (e) {
            console.log(e);
        } else {
            console.log("MongoDB connected");
        }
    }

);