const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const luxon = require("luxon");

///////////////////////////////////////////////////////

const trip = require("../../models/operator/Trips/tripDB");
const allTrips = require("../../models/operator/Trips/allTripsDB");
const activeTrip = require("../../models/operator/Trips/activeTrips");
const interCity = require("../../models/operator/Trips/interCityDB");
const instuserLocation = require("../../models/operator/location/instLocation");
const destinationTrips = require("../../models/operator/Trips/destinationTrips");
const users = require("../../models/operator/user/userDB");
const { findCoordinateAddress } = require("../../utils/helpers/locationHelper");

router.use(bodyParser());

//Fetch Data

router.get("/trips", (req, res) => {
  trip.find({}, (err, trips) => {
    if (err) {
      res.send(err);
    }
    res.json(trips);
  });
});

router.get("/trips/customer", (req, res) => {
  if (!req?.query?.phone) {
    return res.status(400).json({
      message: "Phone is required",
    });
  }
  trip.find({ customerPhone: req?.query?.phone }, (err, trips) => {
    if (err) {
      res.send(err);
    }
    res.json(trips);
  });
});

router.get("/allTrips", (req, res) => {
  allTrips.find({}, (err, trips) => {
    if (err) {
      res.send(err);
    }
    res.json(trips);
  });
});

router.get("/destinations", (req, res) => {
  destinationTrips.find({}, (err, trips) => {
    if (err) {
      res.send(err);
    }
    res.json(trips);
  });
});

router.get("/currentTripData", async (req, res) => {
  console.log("currentTripData", req.query.trip_id, req.params.trip_id);
  const filter = {
    trip_id: req.query.trip_id,
  };
  console.log(filter);

  let allTrips = await allTrips
    .find(filter)
    .sort({
      created_at: -1,
    })
    .limit(1);

  console.log("allTrips", allTrips);

  res.status(200).json(allTrips);
});

// InterCity Trips

router.get("/interCity", (req, res) => {
  let filter = {
    departure: req.query.departure,
    arrival: req.query.arrival,
    date: req.query.date,
    type: "shared",
  };

  req.query.type == "all"
    ? (filter = {
        departure: req.query.departure,
        arrival: req.query.arrival,
        type: "shared",
      })
    : (filter = filter);

  interCity.find(filter, (err, interCity) => {
    if (err) {
      res.send(err);
    }
    res.json(interCity);
  });
});

// ADD DATA
router.post("/trip", async (req, res) => {
  let { driver, customer } = req.body;

  let user = await users.findOne({
    phone: customer.userPhone,
  });

  console.log("user => ", customer);

  let db = (
    await instuserLocation.find({
      _id: customer._id,
    })
  )[0];

  let driverID = driver.driverID;
  let driverPhone = driver.phone;
  let customerPhone = customer.userPhone;
  let driverName = driver.name;
  let customerName = customer.userName;
  const formatted_address = await findCoordinateAddress({
    lat: driver.lat,
    lng: driver.lng,
  });
  let startLocation = {
    lat: driver.lat,
    lng: driver.lng,
    formatted_address,
  };

  let beforePrice = db ? db.beforePrice : 0;

  // Today's Date timestamp
  let currentDate = luxon.DateTime.local().toFormat("dd.MM.yyyy");

  let timestamp = luxon.DateTime.fromFormat(currentDate, "dd.MM.yyyy").ts;

  trip.create(
    {
      driverID,
      driverPhone,
      customerPhone,
      driverName,
      customerName,
      startLocation,
      timestamp,
      beforePrice,
      start: luxon.DateTime.local().setZone("Europe/Istanbul").toFormat("dd.MM.yyyy HH:mm:ss"),
      end: "",
    },
    (err, trip) => {
      if (err) {
        return res.send(err);
      }
      activeTrip.create({
        trip_id: trip._id,
        driverPhone,
        driverName,
        customerPhone,
        customerName,
        start: luxon.DateTime.local().setZone("Europe/Istanbul").toFormat("dd.MM.yyyy HH:mm:ss"),
      });

      res.json(trip);
    }
  );
});

router.post("/interCity", async (req, res) => {
  let data;

  await interCity
    .create({
      departure: req.body.departure,
      arrival: req.body.arrival,
      date: req.body.date,
      time: req.body.time,
      price: req.body.price,
      seats: req.body.seats,
      driver: req.body.driver,
      driverPhone: req.body.driverPhone,
      type: req.body.type,
    })
    .then((res) => {
      data = res;
    });

  await interCity
    .findByIdAndUpdate(data._id, {
      $push: {
        users: req.body.user,
      },
    })
    .then((res) => {
      data = res;
    });

  res.status(200).send(data);
});

router.put("/interCity", async (req, res) => {
  let x = await interCity.findById(req.body.trip_id);

  let userData = {
    name: req.body.name,
    phone: req.body.phone,
    location: req.body.location,
  };

  x.users.map(async (user) => {
    if (user.phone === userData.phone) {
      res.status(400).send("Bu sefere önceden kayıt oluşturulmuş.");
    } else {
      await interCity
        .findByIdAndUpdate(req.body.trip_id, {
          $push: {
            users: userData,
          },
        })
        .then((res) => {
          data = res;
        });
      res.status(200).send(data);
    }
  });
});

module.exports = router;
