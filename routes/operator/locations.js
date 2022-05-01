const express = require('express');
const router = express.Router();
const locationSchema = require('../../models/operator/location/locationDB');
const bodyParser = require('body-parser');
const axios = require('axios');
const trackDriverDB = require('../../models/operator/Driver/trackDriverDB');



router.use(bodyParser());

router.get('/getLocations', (req, res) => {
    locationSchema.find((err, locations) => {
        if (err) {
            console.log(err);
        } else {
            res.json(locations);
        }
    });
});

router.post('/location', async (req, res) => {
    let {
        name,
        lat,
        lng

    } = req.body;


    locationSchema.create({
        name,
        lat,
        lng
    }).then(() => {
        res.json({
            success: true,
            message: 'Location added successfully'
        });
    });

});



router.post('/calcLoc', async (req, res) => {
    drivers = req.body.drivers
    customer = req.body.user;
    results = [];



    for (let i = 0; i < drivers.length; i++) {

        await axios(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${customer.degreesLatitude}%2C${customer.degreesLongitude}&destinations=${drivers[i].lat}%2C${drivers[i].lng}%&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`).then(async (item) => {

            if (item.data.rows[0].elements[0].status == "ZERO_RESULTS") {

                console.log("ZERO_RESULTS");

            } else {
                let driver = {
                    _id: drivers[i]._id,
                    name: drivers[i].name,
                    phone: drivers[i].phone,
                    status: drivers[i].status,
                    last_online: drivers[i].last_online,

                    distanceText: item.data.rows[0].elements[0].distance.text,
                    distance: item.data.rows[0].elements[0].distance.value,
                    durationText: item.data.rows[0].elements[0].duration.text,
                    duration: item.data.rows[0].elements[0].duration.value,
                    status: drivers[i].status,
                }

                driver.status == 'online' ? results.push(driver) : '';

                i === drivers.length - 1 ? res.json(results) : null;
            }


        }).catch((err) => {
            console.log(err);
        });

    }


})

router.post('/calculateDistance', async (req, res) => {

    drivers = await trackDriverDB.find({
        status: 'online'
    });
    customer = req.body.user;
    results = [];

    for (let i = 0; i < drivers.length; i++) {
        await axios(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${customer.degreesLatitude}%2C${customer.degreesLongitude}&destinations=${drivers[i].lat}%2C${drivers[i].lng}%&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`).then(async (item) => {
            if (item.data.rows[0].elements[0].status == "ZERO_RESULTS") {
                throw new Error("ZERO_RESULTS");
            } else {
                let driver = {
                    last_online: drivers[i].last_online,
                    distanceText: item.data.rows[0].elements[0].distance.text,
                    distance: item.data.rows[0].elements[0].distance.value,
                    durationText: item.data.rows[0].elements[0].duration.text,
                    duration: item.data.rows[0].elements[0].duration.value,

                }
                results.push(driver)
                i === drivers.length - 1 ? res.json(results) : null;
            }
        }).catch((err) => {
            console.log(err);
        });

    }

    return results;


})

router.post('/calcLoc/auto', async (req, res) => {
    drivers = req.body.drivers
    customer = req.body.user;
    results = [];

    for (let i = 0; i < drivers.length; i++) {

        await axios(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${customer.degreesLatitude}%2C${customer.degreesLongitude}&destinations=${drivers[i].lat}%2C${drivers[i].lng}%&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`).then(async (item) => {


            if (item.data.rows[0].elements[0].status == "ZERO_RESULTS") {

                console.log("ZERO_RESULTS");

            } else {
                console.log(drivers[i])
                let driver = {
                    _id: drivers[i]._id,
                    driverID: drivers[i].driverID,
                    name: drivers[i].name,
                    phone: drivers[i].phone,
                    status: drivers[i].status,
                    lat: drivers[i].lat,
                    lng: drivers[i].lng,
                    last_online: drivers[i].last_online,
                    distanceText: item.data.rows[0].elements[0].distance.text,
                    distance: item.data.rows[0].elements[0].distance.value,
                    durationText: item.data.rows[0].elements[0].duration.text,
                    duration: item.data.rows[0].elements[0].duration.value,
                    status: drivers[i].status,
                }

                driver.status == 'online' ? results.push(driver) : '';

                i === drivers.length - 1 ? res.json(results) : null;
            }


        }).catch((err) => {
            console.log(err);
        });

    }





})




router.post('/customerDestination', async (req, res) => {
    let destinations = req.body.destinations
    let customer = req.body.user;
    let results = [];
    for (let i = 0; i < destinations.length; i++) {

        await axios(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${customer.degreesLatitude}%2C${customer.degreesLongitude}&destinations=${destinations[i].destination.lat}%2C${destinations[i].destination.lng}%&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`).then(async (item) => {


            if (item.data.rows[0].elements[0].status == "ZERO_RESULTS") {
                console.log("ZERO_RESULTS");
            } else {
                let data = {
                    trip_id: destinations[i].tripId,
                    lat: destinations[i].destination.lat,
                    lng: destinations[i].destination.lng,
                    distanceText: item.data.rows[0].elements[0].distance.text,
                    distance: item.data.rows[0].elements[0].distance.value,
                    durationText: item.data.rows[0].elements[0].duration.text,
                    duration: item.data.rows[0].elements[0].duration.value,

                }

                results.push(data);
            }

        }).catch((err) => {
            console.log(err);
        });

    }


    results.sort((a, b) => {
        if (a.distance < b.distance) return -1;
        if (a.distance > b.distance) return 1;
        return 0;
    });


    res.json(results);


})



router.post('/driverDestination', async (req, res) => {
    let destination = req.body.destination
    let driver = req.body.driver;
    let results = [];



    await axios(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${driver.lat}%2C${driver.lng}&destinations=${destination.lat}%2C${destination.lng}%&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`).then(async (item) => {


        if (item.data.rows[0].elements[0].status == "ZERO_RESULTS") {
            console.log("ZERO_RESULTS");
        } else {
            let data = {
                distanceText: item.data.rows[0].elements[0].distance.text,
                distance: item.data.rows[0].elements[0].distance.value,
                durationText: item.data.rows[0].elements[0].duration.text,
                duration: item.data.rows[0].elements[0].duration.value,
            }

            results.push(data);
        }

    }).catch((err) => {
        console.log(err);
    });



    results.sort((a, b) => {
        if (a.distance < b.distance) return -1;
        if (a.distance > b.distance) return 1;
        return 0;
    });


    res.json(results);


})





module.exports = router;