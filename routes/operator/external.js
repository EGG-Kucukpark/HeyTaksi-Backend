const express = require("express");
const router = express.Router();
const axios = require("axios");
const bodyParser = require("body-parser");

const heytaksi_log = require("../../models/operator/others/heytaksi_log.js");
const heyTaksi_log_detail = require("../../models/operator/others/heyTaksi_log_detail.js");
const { DateTime } = require("luxon");
const generalDB = require("../../models/operator/general/generalDB.js");

router.use(bodyParser.json());

router.get("/driver/call-customer", (req, res) => {
  if (!req?.query?.driver || req?.query?.customer) return res.status(400).json({ message: "driver and customer number required" });
  axios
    .get("http://crmsntrl.netgsm.com.tr:9111/8503040320/linkup", {
      params: {
        username: 8503040320,
        password: "Deniz123.",
        internal_num: 101,
        ring_timeout: 10,
        crm_id: "XXX",
        wait_response: 1,
        originate_order: "of",
        trunk: 8503040320,
        caller: req?.query?.driver,
        called: req?.query?.customer,
      },
    })
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
});

router.post("/calcPrice", async (req, res) => {
  let begin = req.body.begin;
  let end = req.body.end;
  let loc1 = null;
  let loc2 = null;
  let data = null;

  await axios(encodeURI(`https://maps.googleapis.com/maps/api/geocode/json?address=${begin}&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`))
    .then((res) => {
      loc1 = res.data.results[0].geometry.location;
    })
    .catch((err) => {
      console.log(err);
    });

  await axios(encodeURI(`https://maps.googleapis.com/maps/api/geocode/json?address=${end}&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`))
    .then((res) => {
      loc2 = res.data.results[0].geometry.location;
    })
    .catch((err) => {
      console.log(err);
    });

  if (loc1 != null && loc2 != null) {
    await axios(
      encodeURI(
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${loc1.lat},${loc1.lng}&destinations=${loc2.lat},${loc2.lng}&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`
      )
    )
      .then((x) => {
        data = x.data.rows[0].elements[0].distance.value;
      })
      .catch((err) => {
        console.log(err);
      });

    res.status(200).json(data);
    return;
  }

  return res.status(400).json({
    message: "Invalid location",
  });
});

router.post("/textloc", async (req, res) => {
  let location = {
    degreesLatitude: undefined,
    degreesLongitude: undefined,
  };

  await axios(encodeURI(`https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.address_text}+Izmir&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`))
    .then((res) => {
      location.degreesLatitude = res.data.results[0].geometry.location.lat;
      location.degreesLongitude = res.data.results[0].geometry.location.lng;
    })
    .catch((err) => {
      return err;
    });
  res.send(location);
});

router.post("/getLoc", async (req, res) => {
  let data = undefined;
  await axios
    .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.body.loc.lat},${req.body.loc.lng}&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`)
    .then((res) => {
      data = res.data.results[0].formatted_address;
    })
    .catch((err) => {
      console.log(err);
    });

  res.json(data);
});

router.post("/heytaksi/log", async (req, res) => {
  if (req.body.ip_address === "195.174.194.97") return res.send("Bizim IP");

  let options = await generalDB.find();

  await heyTaksi_log_detail.create({
    ip_address: req.body.ip_address,
    type: req.body.type,
    il: req.body.il,
  });

  let heytaksi_logDB = await heytaksi_log.find({});

  let IDS = [];

  heytaksi_logDB.filter(async (item) => {
    // created_at 10 min diff from now

    // some mock date

    let itemTime = new Date(item.created_at);

    let now = new Date();
    let diff = itemTime.getTime() - now.getTime();

    if (diff < 600000) {
      IDS.push(item._id);
    }
  });

  if (IDS.length > 0) {
    heytaksi_log.updateMany(
      {
        _id: {
          $in: IDS,
        },
      },
      {
        closed: true,
        logout_at: new Date(),
      },
      (err, res) => {
        if (err) {
          console.log(err);
        }

        console.log("ok");
      }
    );
  }

  let user = await heytaksi_log.find({
    ip_address: req.body.ip_address,
    closed: false,
  });

  const type = req.body.type;

  if (user.length > 0 && user[0].closed === false) {
    user[0].clicks[type]++;
    type === "keyword" ? user[0].clicks.ads++ : "";

    let isClosed = type === "closed" ? true : false;

    let editUser = await heytaksi_log.findOneAndUpdate(
      {
        ip_address: req.body.ip_address,
        closed: false,
      },
      {
        clicks: user[0].clicks,
        closed: isClosed,
        logout_at: isClosed ? Date.now() : "",
      },
      {
        new: true,
      }
    );

    return res.status(200).json(editUser);
  }

  let newUser = new heytaksi_log({
    ip_address: req.body.ip_address,
    il: req.body.il,
    clicks: {
      visit: 0,
      calculate: 0,
      callTaxi: 0,
      whatsappButton: 0,
      phone: 0,
      ads: 0,
      friendClick: 0,
      keyword: 0,
    },
    key: "",
  });

  newUser.clicks[type]++;

  if (type === "keyword") {
    newUser.clicks.ads++;
    newUser.key = req.body.data;
    let options = await generalDB.findOne();

    if (options.adsCall) {
      options.numbers.adsNumbers.forEach((item) => {
        console.log(item);
        axios("https://app.turkpark.com.tr/api/callDriver", {
          params: {
            number: item,
          },
        });
      });
    }
  }

  newUser.save((err, data) => {
    if (err) return res.status(400).json(err);
    res.status(200).json(data);
  });
});

module.exports = router;
