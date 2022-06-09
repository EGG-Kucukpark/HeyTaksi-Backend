const express = require("express");
const router = express.Router();
const User = require("../../models/operator/user/userDB");
const userLocation = require("../../models/operator/location/userLocation");
const instLocation = require("../../models/operator/location/instLocation");
const notification = require("../../models/operator/others/notifiDB");
const timeScheduleDB = require("../../models/operator/general/timeScheduleDB");
const heytaksi_log = require("../../models/operator/others/heytaksi_log");
const heytaksi_log_details = require("../../models/operator/others/heyTaksi_log_detail");

const generalDB = require("../../models/operator/general/generalDB");
const { db, findById } = require("../../models/operator/user/userDB");

require("dotenv").config({
  path: "./.env",
});

// AUTH ROUTES

/* 
router.get('/me', async (req, res) => {
  
  let {
    userToken,
    type,
    id
  } = req.params;

  const filter = {
    type: type
  }

  const token = await tokens.findOne(filter)

  const decoded = jwt.verify(userToken, token.name);

  if (decoded) {
    const user = await User.findById(id);
    res.send(user);
  } else {
    res.status(401).send({
      error: 'Invalid Data'
    });
  }

}) */

//FETCH DATA

router.get("/", (req, res) => {
  User.find().then((users) => {
    res.json(users);
  });
});

router.get("/instCustomerLocation", (req, res) => {
  instLocation.find().then((locations) => {
    res.json(locations);
  });
});

router.get("/getUserLocations", (req, res) => {
  userLocation.find().then((locations) => {
    res.json(locations);
  });
});

router.get("/customer/subsActive", async (req, res) => {
  let usersActive = await User.find({
    disabled: {
      $eq: false,
    },
  });
  res.json(usersActive);
});

router.get("/notifications", async (req, res) => {
  notification
    .find()
    .sort({
      created_at: -1,
    })
    .then((notifications) => {
      res.json(notifications);
    });
});

router.get("/heytaksi/log", async (req, res) => {
  res.json(
    await heytaksi_log.find().sort({
      created_at: -1,
    })
  );
});

router.get("/heytaksi/log/details", async (req, res) => {
  let filter = {
    start: req.query.start,
    end: req.query.end,
  };

  let data = await heytaksi_log_details.find(filter);

  res.json(data);
});

router.post("/customer/add", async (req, res) => {
  let { name, phone } = req.body;

  let oldUser = await User.findOne({
    phone,
  });

  if (oldUser === null || oldUser === undefined) {
    User.create({
      name,
      phone,
    }).then((user) => {
      res.json(user);
    });
  } else {
    res.json(oldUser);
  }
});

router.post("/customer/instLocation", async (req, res) => {
  let { name, phone, location, beforePrice } = req.body;

  let filter = {
    userPhone: phone,
  };

  await instLocation.deleteOne(filter);

  instLocation
    .create({
      userName: name,
      userPhone: phone,
      location: location,
      beforePrice: beforePrice,
    })
    .then((location) => {
      res.json(location);
    });
});

router.post("/customer/location", async (req, res) => {
  let { name, phone, location, beforePrice } = req.body;

  userLocation.create({
    userName: name,
    userPhone: phone,
    location,
    beforePrice,
  });
});

router.post("/notification/add", async (req, res) => {
  let { name, phone, type } = req.body;

  if (name && phone && type) {
    notification.create({
      userName: name,
      userPhone: phone,
      Notype: type,
    });
    return;
  }

  res.json({
    error: "Invalid Data",
  });
});

// UPDATE DATA

router.put("/notifications/readAll", async (req, res) => {
  notification.updateMany(
    {},
    {
      read: true,
    },
    (err, result) => {
      if (err) {
        console.log(err);
      }
    }
  );
});

router.put("/customer/update", async (req, res) => {
  User.findByIdAndUpdate(req.body.id, {
    kvkk: req.body.kvkk,
  }).catch((err) => {
    console.log(err);
  });
});

// DELETE DATA

router.delete("/customer/instLocation", (req, res) => {
  instLocation.deleteOne(
    {
      userPhone: req.query.phone,
    },
    (err, result) => {
      if (err) {
        console.log(err);
      }
    }
  );
});

router.get("/options", async (req, res) => {
  let data = await generalDB.find({});

  res.json(data[0]);
});

router.get("/prices", async (req, res) => {
  let data = {
    price: 0,
    waitPrice: 0,
    waitTime: 0,
    minTime: 0,
    minPrice: 0,
    minDistance: 0,
  };
  let priceData = await generalDB.find({});

  data.price = priceData[0].price;
  data.waitPrice = priceData[0].waitPrice;
  data.minDistance = priceData[0].minDistance;
  data.minPrice = priceData[0].minPrice;
  data.minTime = priceData[0].minTime;

  res.json(data);
});

router.post("/options", (req, res) => {
  generalDB.create(
    {},
    {
      new: true,
    }
  );
});

router.put("/options", async (req, res) => {
  let {
    price, // 4 TL
    estimatedPrice,
    waitPrice, // 1 TL
    minPrice, // 30 TL
    minDistance, // 7 Km
    maxDistance, // 40 Km
    driverDiscount, // 15%
    partnerDiscount, // 10%
    minTime, // 15 dakika
    start,
    end,
    day,
    priceRatio,
    times,
    toCustomer,
    msgCall,
    hrCall,
    adsCall,
    numbers,
  } = req.body;

  generalDB
    .findByIdAndUpdate("6232f38425c35446ed173925", {
      price,
      estimatedPrice,
      waitPrice,
      minPrice,
      driverDiscount,
      partnerDiscount,
      minDistance,
      minTime,
      toCustomer,
      maxDistance,
      msgCall,
      hrCall,
      adsCall,
      numbers,
    })
    .catch((err) => {
      console.log(err);
    });

  let db = await generalDB.findById("6232f38425c35446ed173925");
  db.times = times;

  if (priceRatio && start && end && day) {
    let data = await timeScheduleDB.create({
      start,
      end,
      priceRatio,
      day,
    });

    await db.prices[day].push({
      id: data._id,
      start,
      end,
      priceRatio,
    });

    console.log(db.prices);

    generalDB.findByIdAndUpdate(
      "6232f38425c35446ed173925",
      {
        prices: db.prices,
      },
      {
        new: true,
      },
      (err, result) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }

  db.save();

  res.json(db);
});

router.delete("/timeOptions", async (req, res) => {
  let { id, day } = req.query;

  if (!id || !day) {
    return res.status(400).json({
      message: "Bad Request",
    });
  }

  await timeScheduleDB.findByIdAndDelete(id);

  let db = await generalDB.findById("6232f38425c35446ed173925");

  await db.prices[day].splice(
    db.prices[day].findIndex((x) => x.id == id),
    1
  );

  generalDB.findByIdAndUpdate(
    "6232f38425c35446ed173925",
    {
      prices: db.prices,
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return res.json(result);
    }
  );
});

router.put("/timeOptions", async (req, res) => {
  let { id, day, start, end, priceRatio } = req.body;

  if (!id || !day || !start || !end || !priceRatio) {
    return res.status(400).json({
      message: "Bad Request",
    });
  }

  await timeScheduleDB.findByIdAndUpdate(id, {
    start,
    end,
  });

  let db = await generalDB.findById("6232f38425c35446ed173925");

  db.prices[day][db.prices[day].findIndex((x) => x.id == id)].start = start;
  db.prices[day][db.prices[day].findIndex((x) => x.id == id)].end = end;
  db.prices[day][db.prices[day].findIndex((x) => x.id == id)].priceRatio =
    priceRatio;

  generalDB.findByIdAndUpdate(
    "6232f38425c35446ed173925",
    {
      prices: db.prices,
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return res.json(result);
    }
  );
});

module.exports = router;
