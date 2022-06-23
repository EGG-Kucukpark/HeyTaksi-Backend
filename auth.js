const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const DriverSchema = require('../../models/operator/Driver/driverDB');


require('dotenv').config({
  path: '../.env'
})

const config = process.env.TOKEN_KEY;



router.use(bodyParser.urlencoded({
  extended: false
}));



router.post("/login", async (req, res) => {

  if (!(req.body.email && req.body.password)) {

    res.status(404).json({
      error: 'Allah'
    })
    return;
  }

  try {
    const email = req.body.email.toLowerCase()
    const password = req.body.password.replace().toLowerCase()

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
      return;

    }
    // Validate if user exist in our database
    const user = await DriverSchema.findOne({
      email
    });




    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign({
          user_id: user._id,
          email
        },
        process.env.TOKEN_KEY, {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
      return;
    }


    res.status(400).send("Invalid Credentials");
    return;

  } catch (err) {
    console.log(err);
  }

});


router.post("/register", async (req, res) => {

  try {
    // Get user input
    const {
      name,
      phone,
      email,
      password,
      
    } = req.body;

    // Validate user input
    if (!(email && password && name && phone)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await DriverSchema.findOne({
      email
    });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await DriverSchema.create({
      name,
      phone,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign({
        user_id: user._id,
        email
      },
      process.env.TOKEN_KEY, {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

module.exports = router;