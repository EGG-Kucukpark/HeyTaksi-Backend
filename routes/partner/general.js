const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const luxon = require('luxon');
const axios = require('axios');
const bcrypt = require("bcryptjs");
router.use(bodyParser());



// MODELS
const users = require('../../models/operator/user/userDB');
const userAdress = require('../../models/operator/user/userAddress');
const trips = require('../../models/operator/Trips/tripDB')
const userCoupons = require('../../models/operator/user/userCoupons');
const userAppointment = require('../../models/operator/user/userAppointments');



router.get('/partnerTrips', async (req, res) => {

    let {
        phone
    } = req.query;


    let finalData = []

    await trips.find({
        $or: [{
            customerPhone: phone
        }, {
            partner_phone: phone
        }]
    }).sort({
        created_at: -1
    }).then((data) => {
        data.filter((item) => {

            item.driverName = item.driverName.split(' ')[1] != undefined ? item.driverName.split(' ')[0] + ' ' + item.driverName.split(' ')[1][0] + '.' : item.driverName.split(' ')[0]
            let data = {
                id: item._id,
                driverName: item.driverName,
                customerName: item.customerName,
                total: item.total,
                start: item.start,
                end: item.end,
                customerAddressLocation: item.customerAddressLocation,

            }
            finalData.push(data)

        })

        res.json(finalData);
    })

})

router.get('/partner/trip/filter', async (req, res) => {
    let {
        start,
        end,
        phone
    } = req.query;




    let finalData = []


    let filter = {
        $or: [{
            customerPhone: phone
        }, {
            partner_phone: phone
        }]
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


    trip.filter(item => {

        item.driverName = item.driverName.split(' ')[1] != undefined ? item.driverName.split(' ')[0] + ' ' + item.driverName.split(' ')[1][0] + '.' : item.driverName.split(' ')[0]
        let data = {
            id: item._id,
            driverName: item.driverName,
            customerName: item.customerName,
            total: item.total,
            start: item.start,
            end: item.end,
            customerAddressLocation: item.customerAddressLocation,

        }
        finalData.push(data)


    })


    console.log(finalData)
    res.send(finalData);


});

router.get('/partner/finance', async (req, res) => {

    let {
        phone
    } = req.query;


    let finalData = []


    let filter = {
        $or: [{
            customerPhone: phone
        }, {
            partner_phone: phone
        }]
    }


    await trips.find(filter).sort({
        created_at: -1
    }).then((data) => {


        let x = data

        data.filter((item) => {

            let total = 0;

            x.filter((item2) => {

                if (item2.timestamp == item.timestamp) {

                    total += item2.total
                }

            })

            let data = {
                total: total,
                timestamp: item.timestamp,
                payed: 0

            }
            finalData.push(data)

        })



        // remove duplicates with same timestamp

        let uniqueData = finalData.filter((item, index) => {
            return finalData.findIndex(item2 => item2.timestamp == item.timestamp) == index
        })

        uniqueData.filter((item) => {

            let date = luxon.DateTime.fromMillis(item.timestamp)
            item.date = date.toFormat('dd.MM.yyyy')
        })




        res.json(uniqueData);
    })

})



router.get('/partner/finance/filter', async (req, res) => {
    let {
        start,
        end,
        phone
    } = req.query;




    let finalData = []

    let filter = {
        $or: [{
            customerPhone: phone
        }, {
            partner_phone: phone
        }]
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



    trip.filter(item => {

        let total = 0;

        trip.filter((item2) => {

            if (item2.timestamp == item.timestamp) {

                total += item2.total
            }

        })

        let data = {
            total: total,
            timestamp: item.timestamp,
            payed: 0


        }
        finalData.push(data)


    })
    let uniqueData = finalData.filter((item, index) => {
        return finalData.findIndex(item2 => item2.timestamp == item.timestamp) == index
    })
    uniqueData.filter((item) => {

        let date = luxon.DateTime.fromMillis(item.timestamp)
        item.date = date.toFormat('dd.MM.yyyy')
    })


    res.send(uniqueData);


});




router.put('/partner/resetpassword', (req, res) => {

    let {
        id,
        password,
        newpassword,
        confirmpassword
    } = req.body;


    if (!(id && password && newpassword && confirmpassword)) {
        res.status(400).send("All input is required");
        return;
    }


    if (newpassword !== confirmpassword) {
        res.status(400).send("Passwords do not match");
        return;
    }

    users.findOne({
        _id: id
    }, async (err, user) => {

        if (err) {
            res.status(400).send("Error while finding user");
            return;
        }

        if (!user) {
            res.status(400).send("User not found");
            return;
        }

        if (!(await bcrypt.compare(password, user.password))) {
            res.status(400).send("Incorrect password");
            return;
        }

        user.password = await bcrypt.hash(newpassword, 10);;

        user.save((err, user) => {

            if (err) {
                res.status(400).send("Error while saving user");
                return;
            }

            res.send("Password reset successfully");

        });

    })

})


module.exports = router;