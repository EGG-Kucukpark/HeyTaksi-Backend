const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const luxon = require('luxon');
const axios = require('axios');
router.use(bodyParser());



// MODELS
const users = require('../../models/operator/user/userDB');
const userAdress = require('../../models/operator/user/userAddress');
const trips = require('../../models/operator/Trips/tripDB')
const userCoupons = require('../../models/operator/user/userCoupons');
const userAppointment = require('../../models/operator/user/userAppointments');





// ROUTES


// GET USER ADDRESS


router.get('/customer', async (req, res) => {

    let general = await users.findById(req.query.id);

    let address = await userAdress.find({
        phone: req.query.phone
    });





    let appointments = await userAppointment.find({
        phone: req.query.phone
    });
    let trip = await trips.find({
        $or: [{
            customerPhone: req.query.phone
        }, {
            partner_phone: req.query.phone
        }]

    });





    res.send({
        general,
        address,
        appointments,
        trip
    })

});


router.get('/customer/trip/filter', async (req, res) => {
    let {
        start,
        end,
        phone
    } = req.query;



    let phones = [];



    let user = await users.find({
        phone
    });



    if (user[0].sub_users.length > 0) {
        user[0].sub_users.map(sub => {
            phones.push(sub.phone)
        })
    }





    let filter = {
        customerPhone: [phone, ...phones],
    }


    if (start != undefined && end != undefined) {

        let start = luxon.DateTime.fromFormat(req.query.start, 'dd.MM.yyyy').ts
        let end = luxon.DateTime.fromFormat(req.query.end, 'dd.MM.yyyy').ts
        filter.timestamp = {
            $gte: start,
            $lte: end
        }
    }



    let trip = await trips.find(filter);

    res.send(trip);


});



router.get('/userAddress', (req, res) => {
    userAdress.find({
        phone: req.query.phone
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })

})

// GET USER APPOINTMENT
router.get('/userAppointment', (req, res) => {

    userAppointment.find({
        phone: req.query.phone
    }).sort({
        created_at: -1
    }).then(data => {
        res.json(data);
    })
})


const validateDay = async (data) => {


    let today = (luxon.DateTime.local().setZone('Europe/Istanbul').toFormat('dd.MM.yyyy'))
    let tomorrow = luxon.DateTime.local().setZone('Europe/Istanbul').plus({
        days: 1
    }).toFormat('dd.MM.yyyy')

    today = luxon.DateTime.fromFormat(today, 'dd.MM.yyyy').ts
    tomorrow = luxon.DateTime.fromFormat(tomorrow, 'dd.MM.yyyy').ts


    let x = await data.filter(item => {
        let date = luxon.DateTime.fromFormat(item.date, 'dd/MM/yyyy').toFormat('dd.MM.yyyy')
        let currentDate = luxon.DateTime.fromFormat(date, 'dd.MM.yyyy').ts
        let diff = currentDate >= today && currentDate <= tomorrow;

        if (date === 'Invalid DateTime' || diff === false) {
            data.splice(data.indexOf(item), 1)

        } else {
            return item
        }
    })





    return x;
}


// Get ALL USERS APPOINTMENT

router.get('/allAppointments', async (req, res) => {


    let filter = req.query.date === 'today' ? {
        date: luxon.DateTime.local().toFormat('dd/MM/yyyy'),
        archived: false

    } : {
        date: luxon.DateTime.local().plus(1).toFormat('dd/MM/yyyy'),
        archived: false
    };

    req.query.date === 'all' ? filter = {
        archived: false
    } : filter;



    let activeAppointments = await userAppointment.find(filter).sort({
        created_at: -1
    })

    let currentAppointments = await validateDay(activeAppointments);


    let allAppointments = await userAppointment.find({}).sort({
        created_at: -1
    })



    res.send({
        activeAppointments,
        currentAppointments,
        allAppointments
    })


})




// GET USER COUPONS

router.get('/userCoupons', (req, res) => {
    userCoupons.find({
        phone: req.query.phone
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })

})


// GET USER TRIPS

router.get('/userTrips', async (req, res) => {

    let {
        phone
    } = req.query;

    let phones = [];

    let user = await users.find({
        phone
    });

    if (user[0].sub_users.length > 0) {
        user[0].sub_users.map(sub => {
            phones.push(sub.phone)
        })
    }

    this.alreadyLiked = !this.alreadyLiked

    let filter = {
        customerPhone: [phone, ...phones],
    }


    trips.find(filter).sort({
        created_at: -1
    }).then((data) => {
        data.filter((item) => {

            item.driverName = item.driverName.split(' ')[1] != undefined ? item.driverName.split(' ')[0] + ' ' + item.driverName.split(' ')[1][0] + '.' : item.driverName.split(' ')[0]

        })


        res.json(data);
    })

})



// ADD USER ADDRESS
router.post('/userAddress', async (req, res) => {

    let {
        name,
        phone,
        address,
        address_text,
        address_type
    } = req.body;

    let user = await users.findOne({
        phone: phone
    });

    let userAddress = new userAdress({
        name,
        phone,
        address,
        address_text,
        address_type
    });

    userAddress.save((err, data) => {
        if (err) {
            res.status(400).send(err)
        } else {
            user.sub_users.forEach(item => {

                let newAddress = new userAdress({
                    name: item.name,
                    phone: item.phone,
                    address: address,
                    address_text: address_text,
                    address_type: address_type,
                    mainPhone: phone,
                    address_id: data._id.toString()

                });

                newAddress.save();
            });



            res.json(data);
        }
    })

});




router.post('/company/addUser', async (req, res) => {


    let {
        name,
        phone,
        id,
        credits,
    } = req.body;


    let user = await users.findById(id);

    let subUser = await users.findOne({
        phone: phone
    });

    user.credits = user.credits - credits;


    if(user.credits < 0){
       return res.status(400).send('You dont have enough credits')
    }


    user.sub_users.push({
        name,
        phone,
        credits: credits,
        mainPhone: user.phone
    });


    user.save();

    if (subUser) {
        subUser.credits += credits;
        subUser.save();
    } else {
        // create new user for subuser
        let newUser = new users({
            name,
            phone,
            credits: credits,
            mainPhone: user.phone
        });

        newUser.save();
    }

    return res.status(200).send(user);

})




router.post('/partner/addUser', async (req, res) => {


    let {
        name,
        phone,
        id
    } = req.body;


    let user = await users.findById(id);

    user.sub_users.push({
        name,
        phone,
        mainPhone: user.phone
    });

    user.save();



    let subUser = await users.findOne({
        phone: phone
    });

    if (subUser) {
        subUser.user_type = 'partner';
        subUser.partner_phone = user.phone;
        subUser.save();
    }



    // copy user address to new user

    let userAddress = await userAdress.find({
        phone: user.phone
    });

    userAddress.forEach(item => {
        let newAddress = new userAdress({
            name: name,
            phone: phone,
            address: item.address,
            address_text: item.address_text,
            address_type: item.address_type,
            mainPhone: item.phone

        });

        newAddress.save();
    });

    res.send(user);



})



// ADD USER COUPONS
router.post('/userCoupons', async (req, res) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function randomStr(alphabet) {
        var ans = '';
        for (var i = 6; i > 0; i--) {
            ans +=
                alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        return ans;
    }


    let coupoun_code = await randomStr(alphabet) + req.body.discount;


    let {
        name,
        phone
    } = req.body;

    const data = await userCoupons.find({
        phone: phone
    })

    let isHave = data.every(item => {
        if (item.coupoun_code.includes("25")) {
            return false
        } else {
            return true
        }
    })


    if (isHave) {
        userCoupons.create({
            name,
            phone,
            coupoun_code,

        }, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        })
    } else {

        data.filter(item => {
            if (item.coupoun_code.includes("25")) {
                res.status(400).send(item)
            }
        })
    }
});


router.post('/userCoupons/welcome', (req, res) => {

    let {
        name,
        phone
    } = req.body;
    userCoupons.create({
        name,
        phone,
        coupoun_code: "HSGLDN20",
        coupoun_used: true,
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })

})

// ADD USER APPOINTMENT 
router.post('/userAppointment', (req, res) => {


    let {
        name,
        phone,
        date,
        time,
        startAddress,
        destinationAddress,
        address1Loc,
        address2Loc,
        driver,
        driverPhone,
        driver_id
    } = req.body;

    userAppointment.create({
        name,
        phone,
        date,
        time,
        startAddress,
        destinationAddress,
        address1Loc,
        address2Loc,
        driver,
        driverPhone,
        driver_id
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })


});


router.post('/userCouponsFriend', async (req, res) => {
    let {
        name,
        phone,
        discount,
        coupon,
        coupoun_used,
    } = req.body;



    let userCoupon = await userCoupons.findOne({
            coupoun_code: coupon.toUpperCase(),
            phone: phone
        },

    )


    if (userCoupon) {
        return res.status(400).send('coupon is used')
    }

    userCoupons.create({
        name,
        phone,
        discount,
        coupoun_code: coupon.toUpperCase(),
        coupoun_used,
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })


});



// UPDATE COPOUONS

router.put('/userCoupons', async (req, res) => {

        let coupon = req.body.coupon_code;

        let mainPhone = await userCoupons.findOne({
            coupoun_code: coupon.toUpperCase(),
            coupoun_used: false
        })

        if (mainPhone) {

            await userCoupons.updateMany({
                coupoun_code: coupon.toUpperCase(),
            }, {
                $set: {
                    coupoun_used: true,
                    main_phone: mainPhone.phone
                }
            })

        }
    }

)



// Update USER ADDRESS


router.put('/userAddress', (req, res) => {

    let {
        name,
        phone,
        address,
        address_text,
        address_type,
    } = req.body;

    //filter object id mongodb
    let filter = {
        address_id: req.body.id,
    }



    userAdress.findByIdAndUpdate(req.body.id, {
        name,
        phone,
        address,
        address_text,
        address_type
    }, (err, data) => {
        if (err) {
            res.status(400).send(err)
        } else {
            res.json(data);
        }
    })

    console.log(filter)
    userAdress.findOneAndUpdate(filter, {
        address_text,
        address_type,
        address,
    }, (err, data) => {
        if (err) {
            console.log(err)
        }

    })

});

router.put('/partner/addUser', async (req, res) => {


    let {
        name,
        phone,
        oldphone,
        id
    } = req.body;

    let user = await users.findById(id);


    let index = user.sub_users.findIndex(x => x.phone === oldphone);
    users.findByIdAndUpdate(id, {
        $set: {
            sub_users: [...user.sub_users.slice(0, index), {
                name,
                phone
            }, ...user.sub_users.slice(index + 1)]
        }
    }, (err, data) => {
        if (err) {
            res.status(400).send(err)
        } else {
            res.json(data);
        }
    })




});




router.put('/company/updateUser', async (req, res) => {

    let {
        name,
        phone,
        oldphone,
        id,
        credits
    } = req.body;


    let user = await users.findById(id);
    let subUser = await users.findOne({phone: oldphone})


    let totalCredit = user.credits + (subUser.credits - credits)

 
    if ( totalCredit < 9 ) {
        return res.sendStatus(400)
    }


    user.sub_users.filter(x => {
        if (x.phone === oldphone) {
            x.phone = phone;
            x.name = name;
            x.credits = credits;
        }
    });




    users.findByIdAndUpdate(id, {
        $set: {
            sub_users: user.sub_users,
            credits: totalCredit
        }
    }, {
        new: true
    }, (err, data) => {
        if (err) {
            res.status(400).send(err)
        } else {

            if (subUser) {
                subUser.phone = phone;
                subUser.name = name;
                subUser.credits = credits;
                subUser.save();

            }

            res.json(data);
        }
    })

})




router.put('/userAppointment', async (req, res) => {



    userAppointment.findByIdAndUpdate(req.body._id, {
        name: req.body.name,
        phone: req.body.phone,
        date: req.body.date,
        address1Loc: req.body.address,
        startAddress: req.body.address_text,
        time: req.body.time,
        driver: req.body.driver,
        driverPhone: req.body.driverPhone,
        driver_id: req.body.driver_id,

    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })


})

// DELETE USER APPOINTMENT

router.delete('/userAppointment', (req, res) => {
    userAppointment.findByIdAndUpdate(req.query.id, {
        archived: true
    }, {
        new: true
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })

})


// DELETE USER ADDRESS
router.delete('/userAddress', (req, res) => {


    userAdress.findOneAndDelete({
        address_id: req.query.id
    }, (err, data) => {
        if (err) {
            console.log(err);
        }
    })


    userAdress.findByIdAndDelete(req.query.id, (err, data) => {
        if (err) {
            console.log(err);
        } else {

            res.json(data);
        }
    })

});




router.delete('/partner/deleteUser', async (req, res) => {

    let {
        name,
        phone,
        id
    } = req.query;

    let user = await users.findById(id);




    let index = await user.sub_users.findIndex(x => x.phone === phone);

    // slice the current phone from the array 

    let x = [...user.sub_users.slice(0, index), ...user.sub_users.slice(index + 1)];


    userAdress.deleteMany({
        mainPhone: user.phone
    }, (err, data) => {
        if (err) {
            console.log(err);
        }
    })

    let subUser = await users.findOne({
        phone: phone
    });

    if (subUser) {
        subUser.user_type = '';
        subUser.partner_phone = '';
        subUser.save();
    }


    users.findByIdAndUpdate(id, {
        $set: {
            sub_users: x
        }
    }, (err, data) => {
        if (err) {
            res.status(400).send(err)
        } else {
            res.json(data);
        }
    })



});

router.delete('/company/deleteUser', async (req, res) => {

    let {
        phone,
        id
    } = req.query;

    let user = await users.findById(id);



    let index = await user.sub_users.findIndex(x => x.phone === phone);



    // slice the current phone from the array 

    let x = [...user.sub_users.slice(0, index), ...user.sub_users.slice(index + 1)];

    let subUser = await users.findOne({
        phone: phone
    });


    let totalCredit = subUser.credits + user.credits;


    users.findByIdAndUpdate(id, {

        sub_users: x,
        credits: totalCredit


    }, {
        new: true
    }, (err, data) => {
        if (err) {
            res.status(400).send(err)
        } else {

            if (subUser) {
                subUser.user_type = '';
                subUser.company_phone = '';
                subUser.credits = 0;
                subUser.save();
            }

            res.json(data);
        }
    })


})


module.exports = router;