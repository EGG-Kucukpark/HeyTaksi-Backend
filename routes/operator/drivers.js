const express = require('express');
const router = express.Router();
const fs = require('fs');
const bcrypt = require("bcryptjs");
const luxon = require('luxon');
const multer = require('multer');
const formidable = require('formidable');
const bodyParser = require('body-parser');


const DriverSchema = require('../../models/operator/Driver/driverDB');
const DriverAppSchema = require('../../models/operator/Driver/driverAppDB');
const DriverScoreSchema = require('../../models/operator/Driver/driverScore');
const DriverStart = require('../../models/operator/Driver/driverStart');
const DriverTrack = require('../../models/operator/Driver/trackDriverDB');
const allTrips = require('../../models/operator/Trips/tripDB')
const userAppointment = require('../../models/operator/user/userAppointments');
const driverLocationData = require('../../models/operator/Driver/driverLocationData');
const driverDB = require('../../models/operator/Driver/driverDB');
const driverScore = require('../../models/operator/Driver/driverScore');




router.use(bodyParser());


const MeasureDistance = (lat1, lon1, lat2, lon2, unit) => {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "km") {
            dist = dist * 1.609344
        }
        if (dist === NaN) {
            return 0;
        }

        return dist;
    }
}

const totalKM = async (locationDatas, type) => {
    let statusKM = 0
    await locationDatas.forEach(async (item, index) => {
        if (item.status == type && index != locationDatas.length - 1) {
            statusKM = statusKM + MeasureDistance(item.lat, item.lng, locationDatas[index + 1].lat, locationDatas[index + 1].lng, 'km')
        }
    });

    return statusKM;
}

const calculatePrice = async (trips) => {

    let price = 0
    await trips.forEach(async (item) => {
        price += item.discounted_price
    })

    return price
}


//  FETCH DATA
router.get('/drivers', (req, res) => {

    DriverSchema.find({}, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.send(data);
        }
    });

    /* DriverScoreSchema.find((err, data) => {
        if (err) {
            console.log(err);
        } else {
            driverScore.push(data);
        }
    });


    drivers.filter(driver => {
            driverScore.filter(score => {
                if (driver._id == driverScore.driver_id) {
                    driver.rating = driverScore.rating;

                } else {
                    driver.rating = 0;
                }
            });
        }


    ).then(() => {
        res.send(drivers);
    });
 */



});



router.get('/driverTrack', (req, res) =>
    DriverTrack.find({}, (err, data) => {
        if (err) {
            console.log(err);
        } else {

            data.filter(item => {
                if (item.status == 'logout') {
                    data.splice(data.indexOf(item), 1)
                }
            })

            res.send(data);
        }
    })
)




router.get('/driver', async (req, res) => {
    let trips;

    let filter = {
        _id: req.query.id
    };




    let general = await DriverSchema.find(filter)





    let filter2 = {
        driverID: req.query.id
    }

    // get data between start and end
    trips = await allTrips.find(filter2).sort({
        created_at: -1
    })


    res.send({
        general,
        trips
    });

})



router.get('/driver/filter/', async (req, res) => {


    let data = {
        trips: [],
        tripCount: 0,
        onlineKM: 0,
        offlineKM: 0,
        busyKM: 0,
        tripKM: 0,
        price: 0,

    }

    let filter2 = {
        driverID: req.query.id
    }


    if (req.query.start && req.query.end) {
        let start = luxon.DateTime.fromFormat(req.query.start, 'dd.MM.yyyy').ts
        let end = luxon.DateTime.fromFormat(req.query.end, 'dd.MM.yyyy').ts
        filter2.timestamp = {
            $gte: start,
            $lte: end
        }
    }


    if (req.query.date != undefined) {
        let date = luxon.DateTime.fromFormat(req.query.date, 'dd.MM.yyyy').ts

        filter2.timestamp = date

    }



    // Trips Length
    trips = await allTrips.find(filter2)




    delete filter2.timestamp;


    let driver = await driverDB.findById(req.query.id);


    // Status KM


    let locationDatas = await driverLocationData.find(filter2)




    let totalPrice = await calculatePrice(trips)




    data.onlineKM = await totalKM(locationDatas, 'online')
    data.offlineKM = await totalKM(locationDatas, 'offline')
    data.busyKM = await totalKM(locationDatas, 'busy')
    data.tripKM = await totalKM(locationDatas, 'trip')
    data.tripCount = trips.length;
    data.trips = trips;
    data.price = totalPrice;
    data.cancel = driver.cancelCount;




    res.send(data);



});



router.get('/application', (req, res) => {
    DriverAppSchema.find({}, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.send(data);
        }
    });
});


// Driver Appointments


const validateDay = async (data) => {

    // 24.03.2022 timestamp

    let today = (luxon.DateTime.local().setZone('Europe/Istanbul').toFormat('dd.MM.yyyy'))
    let tomorrow = luxon.DateTime.local().setZone('Europe/Istanbul').plus({
        days: 1
    }).toFormat('dd.MM.yyyy')

    today = luxon.DateTime.fromFormat(today, 'dd.MM.yyyy').ts
    tomorrow = luxon.DateTime.fromFormat(tomorrow, 'dd.MM.yyyy').ts


    let comingData = []


    await data.map((item) => {
        let date = luxon.DateTime.fromFormat(item.date, 'dd/MM/yyyy').toFormat('dd.MM.yyyy')
        let currentDate = luxon.DateTime.fromFormat(date, 'dd.MM.yyyy').ts

        let diff = currentDate >= today && currentDate <= tomorrow;


        console.log(diff)

        date === 'Invalid DateTime' || diff === false ? null : comingData.push(item)

    })


    console.log(comingData)
    return comingData;
}

router.get('/driverAppointments', (req, res) => {
    let id = req.query.id
    console.log(id)

    if (id) {
        let filter = {
            driver_id: id,
            archived: false,
        }

        userAppointment.find(filter, async (err, data) => {
            if (err) {
                console.log(err);
            } else {


                res.send(await validateDay(data));

            }
        });
        return;
    }
    //invalid data
    res.status(400).send({
        message: 'Invalid Data'
    });

    return;


});




// ADD DATA

router.post('/drivers', async (req, res) => {
    let {
        name,
        photo,
        phone,
        email,
        password,
        arac,
        tc,
        il,
        arac_plaka
    } = req.body;
    encryptedPassword = await bcrypt.hash(password, 10);

    let oldUser = await DriverSchema.findOne({
        phone
    });

    if (oldUser === null) {
        DriverSchema.create({
            name,
            phone,
            photo,
            email,
            tc,
            password: encryptedPassword,
            arac,
            il,
            arac_plaka
        }).then((data) => {
            res.json({
                success: true,
                message: 'Driver added successfully'
            });
        });
    } else {
        res.json({
            success: false,
            message: 'Driver already exists'
        });
    }




});


router.post('/drivers/score', async (req, res) => {
    let {
        driver_id,
        rating,
        customerPhone,
        trip_id
    } = req.body;

    let filter = {
        trip_id
    }

    let trip = await driverScore.findOne(filter);
    console.log(trip)


    if (trip) {
        return res.status(400).json({
            message: 'You have already rated this trip'
        })
    }


    DriverScoreSchema.create({
        driver_id,
        rating,
        customerPhone,
        trip_id
    }, async (err, data) => {
        if (err) {
            console.log(err);
        } else {
            let score = await driverScore.find({
                driver_id: driver_id
            })

            const initialValue = 0;
            const sumWithInitial = score.reduce((a, b) => a + b.rating, initialValue)


            let total = sumWithInitial / score.length
            console.log(sumWithInitial, total)

            DriverSchema.findByIdAndUpdate(driver_id, {
                score: total
            }, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('score updated')
                }

            })
            res.json({
                success: true,
                message: 'Score added successfully'
            });
        }

    })





})


router.post('/drivers/application', (req, res) => {

    // get form data


    let form = new formidable.IncomingForm();


    form.parse(req, async (err, fields, files) => {

        let {
            name,
            phone,
            il,
            arac_yil,
            arac_model,
            arac_marka,
            referans,
            iban,
        } = fields;


        let arac = {
            arac_yil,
            arac_model,
            arac_marka
        }


        let isValidFile = files.file ? true : false;

        if (!name || !phone || !il  || !isValidFile || !arac_marka || !arac_model || !arac_yil) {
            return res.status(400).json({
                message: 'Invalid Data'
            })
        }

        let newName = Date.now() + '_' + name + '_' + phone + '.jpg';
        let oldPath = files.file.filepath;
        let newPath = './public/driver_applications/' + newName;

        let oldUser = await DriverAppSchema.findOne({
            phone
        });

        if (oldUser === null) {
            DriverAppSchema.create({
                name,
                phone,
                arac,
                il,
                referans,
                iban,
                file: newName
            }).then((data) => {



                // save file
                fs.writeFile(newPath, fs.readFileSync(oldPath), (err) => {

                    if (err) {
                        console.log(err);
                    } else {
                        console.log('file saved')
                    }
                })

                res.json({
                    success: true,
                    message: 'Application added successfully'
                });
            });
        } else {
            res.json({
                success: false,
                message: 'Application already exists'
            });
        }

    })
})


router.post('/drivers/calcLocation', (req, res) => {


    let driver = DriverStart.FindOne({
        _id: req.body.id
    });

    if (driver) {
        res.json({
            success: true,
            message: 'Driver location added successfully'
        });
    }



    DriverStart.create(req.body).then(() => {
        res.json({
            success: true,
            message: 'Driver Location added successfully'
        });
    });

})




// UPDATE DATA

router.put('/drivers', async (req, res) => {

    let data = req.body.params;



    let isBcyrpt = await bcrypt.compare(data.password, data.password);
    let encryptedPassword = !isBcyrpt ? await bcrypt.hash(data.password, 10) : data.password;

    DriverSchema.findByIdAndUpdate(data.id, {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: encryptedPassword,
        tc: data.tc,
        arac: data.arac,
        arac_plaka: data.arac_plaka


    }).then((xd) => {
        res.json({
            success: true,
            message: 'Driver updated successfully'
        });
    }).catch(err => {
        console.log(err);
    })



});

router.put('/drivers/savedata', (req, res) => {

    let id = req.body.id;
    console.log(id);

    DriverSchema.findByIdAndUpdate(id, {
        saveData: req.body.saveData
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }

    })



})




// DELETE DATA



router.delete('/drivers/:id', (req, res) => {
    DriverSchema.findByIdAndRemove(req.params.id, (err, driver) => {
        if (err) {
            console.log(err);
        } else {
            res.json(driver);
        }
    });
});




router.delete('/driverAppointments', (req, res) => {
    let id = req.query.id


    userAppointment.findByIdAndUpdate(id, {
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


});




module.exports = router;