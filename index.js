const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const luxon = require("luxon");
const path = require("path");
require("./config/database");
const fs = require("fs");

var options = {
  key: fs.readFileSync("privkey.pem"),
  cert: fs.readFileSync("cert.pem"),
  ca: fs.readFileSync("chain.pem"),
};

//Socket
const socket = require("socket.io");
const https = require("https").createServer(options, app);
const http = require("http").createServer(app);

const https2 = require("https").createServer(options, app);

//Routes & Middleware
const drivers = require("./routes/operator/drivers");
const auth = require("./routes/operator/auth");
const locations = require("./routes/operator/locations");
const authMid = require("./middleware/Auth");
const general = require("./routes/operator/general");
const calcLoc = require("./routes/operator/locations");
const trip = require("./routes/operator/trip");
const user = require("./routes/operator/user");
const extarnal = require("./routes/operator/external");
const operatorAuth = require("./routes/operator/operatorAuth");
const webUsersRoutes = require("./routes/website/webUsersRoutes");
const discountOffersRoutes = require("./routes/website/discountOffersRoutes");
const appointmentsRoutes = require("./routes/website/appointmentsRoutes");

// Partner

const partnerAuth = require("./routes/partner/auth");
const partnerGeneral = require("./routes/partner/general");

// Company

const companyAuth = require("./routes/company/auth");
const companyGeneral = require("./routes/company/general");

//Models
const insLocation = require("./models/operator/location/instLocation");
const allTrips = require("./models/operator/Trips/allTripsDB");
const tripDb = require("./models/operator/Trips/tripDB");
const trackDriverDB = require("./models/operator/Driver/trackDriverDB");
const activeTrips = require("./models/operator/Trips/activeTrips");
const driverLocationData = require("./models/operator/Driver/driverLocationData");
const driverDB = require("./models/operator/Driver/driverDB");
const userDb = require("./models/operator/user/userDB");
const userAppointment = require("./models/operator/user/userAppointments");

const allTripsDB = require("./models/operator/Trips/allTripsDB");
const generalDB = require("./models/operator/general/generalDB");
const destinationTrips = require("./models/operator/Trips/destinationTrips");
const instuserLocation = require("./models/operator/location/instLocation");
const heytaksi_log = require("./models/operator/others/heytaksi_log");

//Settings
const socketPort = 5555;
const mainPort = 2222;
const httpPort = 1111;

global.operatorSocket = null;

// images file
//serve images

let isAutoPilot = false;

// Stack

let stack = [];

const io = socket(https2, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  },
});

app.io = io;
https.listen(mainPort, () => {
  console.log(`Express listening on ${mainPort}`);
});

http.listen(httpPort, () => {
  console.log(`Express listening on ${httpPort}`);
});

app.use(cors());
app.use(bodyParser.json());

//Routes
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(auth);
app.use(drivers);
app.use(locations);
app.use(general);
app.use(calcLoc);
app.use(trip);
app.use(user);
app.use(extarnal);
app.use(operatorAuth);
app.use(webUsersRoutes);
app.use(discountOffersRoutes);
app.use(appointmentsRoutes);

//Partner Routes

app.use(partnerAuth);
app.use(partnerGeneral);

// Company Routes
app.use(companyAuth);
app.use(companyGeneral);

//Socket

https2.listen(socketPort, () => {
  console.log(`Socket listening on ${socketPort}`);
});

setInterval(async () => {
  let driverData = await trackDriverDB.find({});

  driverData.filter(async (item) => {
    if (luxon.DateTime.local() - item.last_update > 2 * 60 * 1000 && item.status != "logout" && item.status != "offline") {
      await trackDriverDB.findByIdAndUpdate(item._id, {
        status: "disconnect",
      });
    }
    let diff = luxon.DateTime.local() - item.last_update;
    let time = 3;

    if (diff % time === 0 && item.status === "disconnect" && item.phone != "905322629413") {
      axios("https://app.turkpark.com.tr/api/callDriver", {
        params: {
          number: item.phone,
        },
      });
    }
  });

  // Date.now if 10 min ago delete
  let newDate = new Date(new Date() - 1 * 24 * 60 * 60 * 1000);

  instuserLocation.deleteMany(
    {
      createdAt: {
        $lt: newDate,
      },
    },
    (err, res) => {
      if (err) {
        console.log(err);
      }
    }
  );
}, 1 * 60 * 1000);

const locationToAddress = async (location) => {
  let data = undefined;
  await axios
    .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`)
    .then((res) => {
      data = res.data.results[0].formatted_address;
    })
    .catch((err) => {
      console.log(err);
    });

  return data;
};

io.on("connection", (socket) => {
  const autoTripFunction = async (data) => {
    if (data.drivers === undefined) return;

    const user = await insLocation.findOne({
      userPhone: data.customer,
    });

    if (data.drivers.length > 0 && user) {
      stack.push(data);

      stack.filter((item) => {
        item.drivers.filter((item) => {
          data.drivers[0];
        });
      });

      var driver = data.drivers[0];

      console.log(user, "user");
      console.log(driver, "driver");

      var nameArry = user.userName.split(" ");
      user.userName = nameArry.length > 1 ? nameArry[0] + " " + nameArry[1][0].toUpperCase() + "." : nameArry[0];

      if (user && user.isTripOn === false) {
        var finalData = {
          customer: user,
          driver: driver,
          note: "",
        };
      }
    }

    socket.broadcast.emit("customerLocApp", finalData);
  };

  socket.on("newNotification", (data) => {
    console.log("Yeni Bildirim!");
    socket.broadcast.emit("notification", data);
  });

  socket.on("customerLocation", async (data) => {
    console.log("Yeni Customer Location!");
    let options = await generalDB.findOne({});
    console.log(data, "KONUM");

    if (isAutoPilot) {
      let customer = await instuserLocation
        .findOne({
          status: "online",
        })
        .sort({
          createdAt: -1,
        })
        .limit(1);

      let drivers = await trackDriverDB.find({
        status: "online",
      });

      if (drivers.length > 0 && customer)
        await axios
          .post("https://www.turkpark.com.tr:2222/calcLoc/auto", {
            user: {
              degreesLatitude: customer.location.degreesLatitude,
              degreesLongitude: customer.location.degreesLongitude,
            },
            drivers,
          })
          .then((res) => {
            let resultDrivers = res.data.sort((a, b) => {
              if (a.distance < b.distance) return -1;
              if (a.distance > b.distance) return 1;
              return 0;
            });

            resultDrivers.filter((item) => options.minDistance >= item.distance / 1000);

            console.log(resultDrivers, "resultDrivers");

            if (resultDrivers.length > 0) {
              let data = {
                drivers: resultDrivers,
                customer: customer.userPhone,
              };
              autoTripFunction(data);
            }
          });
    }

    socket.broadcast.emit("driverLoc");
    socket.broadcast.emit("customerLoc");
  });

  socket.on("cancel", async (data) => {
    console.log("Cancel!");

    socket.broadcast.emit("driverLoc");
    socket.broadcast.emit("customerLoc");

    socket.broadcast.emit("tripCancel", data);
  });

  socket.on("driverLocation", async (data) => {
    let driver = {
      id: data.user._id,
      name: data.user.name,
      lat: data.lat,
      lng: data.lng,
      phone: data.user.phone,
      status: data.user.status,
      last_online: luxon.DateTime.local().setZone("Europe/Istanbul").toFormat("dd-MM-yyyy HH:mm:ss"),
      last_update: luxon.DateTime.local(),
    };

    // sort created at
    let driverLog = await driverLocationData
      .find({
        driverID: driver.id,
      })
      .sort({
        timestamp: -1,
      });

    if (driverLog.length > 0) {
      if (driverLog[0].status != driver.status) {
        driverLocationData.create(
          {
            driverID: driver.id,
            driverName: driver.name,
            driverPhone: driver.phone,
            location: {
              lat: driver.lat,
              lng: driver.lng,
            },
            status: driver.status,
            timestamp: driver.last_update,
          },
          (err, result) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    } else {
      driverLocationData.create(
        {
          driverID: driver.id,
          driverName: driver.name,
          location: {
            lat: driver.lat,
            lng: driver.lng,
          },
          status: driver.status,
          timestamp: driver.last_update,
        },
        (err, result) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }

    let filter = {
      driverID: driver.id,
    };

    let x = await trackDriverDB.findOneAndUpdate(
      filter,
      {
        lat: driver.lat,
        status: driver.status,
        lng: driver.lng,
        last_online: driver.last_online,
        last_update: driver.last_update,
      },
      {}
    );

    if (x == null) {
      await trackDriverDB.create({
        driverID: driver.id,
        name: data.user.name,
        lat: data.lat,
        lng: data.lng,
        phone: data.user.phone,
        status: data.user.status,
        last_online: luxon.DateTime.local().setZone("Europe/Istanbul").toFormat("dd-MM-yyyy HH:mm:ss"),
        last_update: luxon.DateTime.local(),
      });
    }

    let driverData = await trackDriverDB.find({});
    driverData.filter((item) => {
      if (item.status == "logout") {
        driverData.splice(driverData.indexOf(item), 1);
      }
    });

    socket.broadcast.emit("driverLoc");
    socket.broadcast.emit("customerLoc");
  });

  socket.on("customerLocationApp", async (data, callback) => {
    var driver = data.driver;

    let user = await insLocation.findOne({
      _id: data.customer,
    });

    user.driver = {
      name: driver.name,
      phone: driver.phone,
    };

    user.save();

    if (user) {
      var nameArry = user.userName.split(" ");
      user.userName = nameArry.length > 1 ? nameArry[0] + " " + nameArry[1][0].toUpperCase() + "." : nameArry[0];
      var finalData = {
        customer: user,
        driver: driver,
        note: data.note || "",
      };
      console.log("manuel", finalData);

      socket.emit("customerLocApp", finalData);

      socket.broadcast.emit("customerLocApp", finalData);
    }
  });

  socket.on("customerAppointmentStart", async (data) => {
    var driver = data.driver;

    let driverData = await trackDriverDB.findOne({
      driverID: data.driver.driverID,
    });

    driver.lat = driverData.lat;
    driver.lng = driverData.lng;
    driver.status = driverData.status;

    let user2 = await userAppointment.findOne({
      phone: data.customer,
    });

    let user = {
      _id: user2._id,
      userName: user2.name,
      userPhone: user2.phone,
      location: user2.address1Loc,
      status: "online",
    };

    var nameArry = user.userName.split(" ");
    user.userName = nameArry.length > 1 ? nameArry[0] + " " + nameArry[1][0].toUpperCase() + "." : nameArry[0];

    if (user) {
      var finalData = {
        customer: user,
        driver: driver,
        note: data.note || "",
      };

      socket.emit("customerLocApp", finalData);
      socket.broadcast.emit("driverLoc");
      socket.broadcast.emit("customerLoc");

      socket.broadcast.emit("customerLocApp", finalData);
    }
  });

  socket.on("startTrip", async (data) => {
    console.log("tripdata => ", data);
    const filter = {
      userPhone: data.userPhone,
    };

    insLocation.findOneAndDelete(filter, (err, doc) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Silindi");
      }
    });

    let tripData = {
      trip_id: data.tripId,
      lng: data.lng,
      lat: data.lat,
      distance: data.distance,
      userPhone: data.userPhone,
      end: "",
    };

    allTrips.create(tripData, (err, trip) => {
      if (err) {
        console.log(err);
      }
    });

    stack.filter((item) => {
      if (item.customer.userPhone === tripData.userPhone) {
        stack.slice(stack.indexOf(item), 1);
      }
    });

    socket.broadcast.emit("driverLoc");
    socket.broadcast.emit("customerLoc");

    socket.broadcast.emit("startTripNot", data);
  });

  socket.on("destination", async (data) => {
    let tripData = await tripDb.findById(data.tripId);

    console.log(tripData);

    destinationTrips.create(
      {
        tripId: data.tripId,
        customerPhone: data.customerPhone,
        destination: {
          lat: data.lat,
          lng: data.lng,
        },

        driverPhone: tripData.driverPhone,
        driverName: tripData.driverName,
        customerPhone: tripData.customerPhone,
        customerName: tripData.customerName,
      },
      (err, trip) => {
        if (err) {
          console.log(err);
        }
      }
    );
    socket.broadcast.emit("driverLoc");
    socket.broadcast.emit("customerLoc");

    socket.broadcast.emit("destinationNot", data);
  });

  socket.on("tripNotification", (data) => {
    socket.broadcast.emit("startTripMsg1", data);
  });

  socket.on("logout", (data) => {
    console.log("Logout!", data);

    let filter = {
      driverID: data.driver._id,
    };

    trackDriverDB.findOneAndUpdate(
      filter,
      {
        status: "logout",
      },
      {
        new: true,
      },
      (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log("Logout", result);
      }
    );
    socket.broadcast.emit("updateDrivers");
  });

  socket.on("endTrip", async (data) => {
    let options = await generalDB.find({});
    let finalData = {
      tripId: data.tripId,
      driverID: data.driver.driverID,
      customerPhone: data.customerPhone,
      price: 0,
      distance: 0,
      discountedPrice: 0,
      discount: 0,
      waitTime: 0,
      beforePrice: 0,
      startLocation: {},
      endLocation: {},
      finalPrice: 0,
    };

    // Hesaplama

    if (data.waitTime > 5) {
      finalData.price += data.waitTime - 5;
    }

    if (Math.floor(data.distance) <= options[0].minDistance) {
      finalData.price += options[0].minPrice;
    } else {
      let time = data.tripTime / 60 / 60;
      let distance = data.distance;
      let timeDiff = 1;

      let currentDay = luxon.DateTime.local().toFormat("cccc");

      let currentTime = luxon.DateTime.local().setZone("Europe/Istanbul").toFormat("HH:mm:ss");

      options[0].prices[currentDay].forEach((element) => {
        let start = luxon.DateTime.local().setZone("Europe/Istanbul").toFormat(element.start, "HH:mm:ss");
        let end = luxon.DateTime.local().setZone("Europe/Istanbul").toFormat(element.end, "HH:mm:ss");

        if (currentTime >= start && currentTime <= end) {
          timeDiff = element.priceRatio;
        }
      });

      // avg speed time is seconds
      let avgSpeed = distance / time;

      let avgSpeedPrice = avgSpeed >= 40 ? 1 : avgSpeed <= 30 ? 1.1 : 1.2;

      let totalPrice = distance * avgSpeedPrice * options[0].price * timeDiff;

      finalData.price += totalPrice;
    }

    let user = await userDb.findOne({
      phone: data.customerPhone,
    });

    let currentTrip = await tripDb.findById(data.tripId);

    let customerLocation = await insLocation.findOne({
      userPhone: data.customerPhone,
    });

    let allTripsData = await allTripsDB
      .find({
        trip_id: data.tripId,
      })
      .sort({
        created_at: -1,
      });

    await destinationTrips.findOneAndDelete({
      tripId: data.tripId,
    });

    await activeTrips.findOneAndDelete({
      trip_id: data.tripId,
    });

    await insLocation.findOneAndDelete({
      userPhone: data.customerPhone,
    });
    trackDriverDB.findOneAndUpdate(
      {
        driverID: data.driver.driverID,
      },
      {
        customerName: null,
        customerPhone: null,
      },
      (err, user) => {
        if (err) {
          console.log(err);
        }
      }
    );

    finalData.distance = parseInt(data.distance.toFixed(1));
    finalData.price = parseInt(finalData.price.toFixed(2));
    finalData.beforePrice = currentTrip.beforePrice;
    finalData.finalPrice += finalData.price + currentTrip.beforePrice;
    finalData.discount = (finalData.finalPrice % 1).toFixed(2);
    finalData.discountedPrice = Math.floor(finalData.finalPrice);

    let driverPrice = finalData.price - finalData.price * 0.15;
    let partnerPrice = user?.user_type === "partner" ? finalData.price - finalData.price * 0.1 : 0;
    let location = customerLocation != null ? customerLocation.location : "";

    let endLocation = {
      lat: allTripsData[0].lat || 0,
      lng: allTripsData[0].lng || 0,
    };

    console.log(endLocation, "endLocation");
    console.log(currentTrip.startLocation, "currentTrip.startLocation");

    finalData.startLocation = await locationToAddress(currentTrip.startLocation);
    finalData.endLocation = await locationToAddress(endLocation);

    tripDb.findByIdAndUpdate(
      data.tripId,
      {
        distance: finalData.distance,
        endLocation: {
          lat: endLocation.lat,
          lng: endLocation.lng,
          formatted_address: finalData.endLocation,
        },
        customerAddressLocation: location,
        driverDiscounted: driverPrice,
        partnerDiscounted: partnerPrice,
        customerDiscounted: finalData.discountedPrice,
        total: finalData.price,
        waitTime: data.waitTime,
        end: luxon.DateTime.local().setZone("Europe/Istanbul").toFormat("dd-MM-yyyy HH:mm:ss"),
      },
      (err, trip) => {
        if (err) {
          console.log(err);
          return;
        }

        socket.broadcast.emit("driverLoc");
        socket.broadcast.emit("customerLoc");

        socket.broadcast.emit("endTripInfo", finalData);
        socket.emit("endTripMsg", finalData);
      }
    );
  });

  socket.on("endTripCoupon", (data) => {
    console.log(data, "end");

    tripDb.findByIdAndUpdate(
      data.tripId,
      {
        customerDiscounted: data.finalPrice,
        end: luxon.DateTime.local().setZone("Europe/Istanbul").toFormat("dd-MM-yyyy HH:mm:ss"),
        coupon: true,
        coupon_code: data.coupon_code,
        coupon_discount: data.coupon_discount,
      },
      (err, trip) => {
        if (err) {
          console.log(err);
        }
      }
    );

    socket.broadcast.emit("TripCouponMsg", data);
  });

  socket.on("endTripMsg", (data) => {
    socket.broadcast.emit("driverLoc");
    socket.broadcast.emit("customerLoc");

    console.log("endTripMsg", data);
  });

  socket.on("tripMsg", (data) => {
    socket.broadcast.emit("tripMsg1", data);
  });

  socket.on("comeTrip", async (data) => {
    const filter = {
      userPhone: data.customerPhone,
    };
    const update = {
      status: "trip",
      isTripOn: true,
    };
    const options = {
      new: true,
    };

    insLocation.findOneAndUpdate(filter, update, options, (err, user) => {
      if (err) {
        console.log(err);
      }
    });

    let user = await insLocation.findOne(filter);

    if (user) {
      trackDriverDB.findOneAndUpdate(
        {
          driverID: data.driver.driverID,
        },
        {
          customerName: user.userName,
          customerPhone: user.userPhone,
        },
        (err, user) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else {
      let appointmentUser = await userAppointment.findOne({
        phone: data.customerPhone,
      });

      trackDriverDB.findOneAndUpdate(
        {
          driverID: data.driver.driverID,
        },
        {
          customerName: appointmentUser.name,
          customerPhone: appointmentUser.phone,
        }
      );
    }

    socket.broadcast.emit("driverLoc");
    socket.broadcast.emit("customerLoc");

    socket.broadcast.emit("comeTripMsg", data);
  });

  socket.on("autoTripData", () => {
    socket.emit("autoTripMsg", isAutoPilot);
  });

  socket.on("autoTrip", async (data) => {
    isAutoPilot = data;
    socket.broadcast.emit("autoTripMsg", isAutoPilot);

    /* if (data.drivers === undefined) return;



        if (data.drivers.length > 0) {
            stack.push(data);

            stack.filter(item => {
                item.drivers.filter(item => {
                    data.drivers[0]
                })
            })

            var driver = data.drivers[0]

            const user = await insLocation.findOne({
                userPhone: data.customer
            })



            var nameArry = user.userName.split(" ");
            user.userName = nameArry.length > 1 ? nameArry[0] + " " + nameArry[1][0].toUpperCase() + '.' : nameArry[0];



            if (user && user.isTripOn === false) {
                var finalData = {
                    customer: user,
                    driver: driver,
                    note: '',
                }
                socket.broadcast.emit('customerLocApp', finalData);
            }
        } */
  });

  socket.on("driverCancelTrip", async (res) => {
    console.log(res, "res");

    let data = res.data;

    const filter = {
      userPhone: data.customer.userPhone,
    };
    const update = {
      status: "online",
    };
    const options = {
      new: true,
    };

    insLocation.findOneAndUpdate(filter, update, options, (err, user) => {
      if (err) {
        console.log(err);
      }
    });

    trackDriverDB.findOneAndUpdate(
      {
        driverID: data.driver.driverID,
      },
      {
        customerName: null,
        customerPhone: null,
      },
      (err, user) => {
        if (err) {
          console.log(err);
        }
      }
    );

    socket.broadcast.emit("driverLoc");
    socket.broadcast.emit("customerLoc");

    socket.broadcast.emit("tripCancel", data);
  });

  socket.on("rejectTrip", async (x) => {
    await driverDB.findByIdAndUpdate(x.driver.driverID, {
      $inc: {
        cancelCount: 1,
      },
    });

    let data = x.customerPhone;

    stack.filter(async (element) => {
      if (element.customer === data && element.drivers.length > 1) {
        element.drivers.shift();
        const user = await insLocation.findOne({
          userPhone: data,
        });

        let finalData = {
          customer: user,
          driver: element.drivers[0],
          note: "",
        };
        socket.broadcast.emit("driverLoc");
        socket.broadcast.emit("customerLoc");

        socket.broadcast.emit("customerLocApp", finalData);
      }
    });
  });

  // PARTNER SOCKET
  socket.on("partnetTrips", async (data) => {
    let phones = [];

    phones.push(data.user.phone);

    data.user.sub_users.forEach((element) => {
      phones.push(element.phone);
    });

    console.log(phones);
    let tripData = await activeTrips.find({
      customerPhone: [...phones],
    });

    socket.emit("partnetTripsMsg", tripData);
  });
});
