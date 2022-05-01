const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const operatorSchema = require("../../models/operator/operatorUser/operatorDB");


require('dotenv').config({
  path: './.env'
})



router.use(bodyParser.urlencoded({
  extended: false
}));



router.post("/operator/Login", async (req, res) => {


  try {

    const phone = req.body.phone
    const password = req.body.password.toLowerCase()

    // Validate user input
    if (!(phone && password)) {
      res.status(400).send("All input is required");
      return;

    }
    // Validate if user exist in our database
    let user = await operatorSchema.findOne({
      phone
    });

 


    if (user && (await bcrypt.compare(password, user.password))) {

      const token = jwt.sign({
          user_id: user._id,
          phone
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


router.post("/operator/register", async (req, res) => {

  try {
    // Get user input
    const {
      name,
      phone,
      password,
    } = req.body;

    // Validate user input
    if (!(password && phone)) {
      res.status(400).send("All input is required");
    }


    const oldUser = await operatorSchema.findOne({
      phone
    });





    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);



    if (oldUser) {
      operatorSchema.findByIdAndUpdate(oldUser._id, {
        user_type: "company",
        password: encryptedPassword
      },  (err, user) => {
        if (err) {
          res.status(400).send("Error updating user");
          return;
        }
        res.status(200).json(user);
      });
      return;
    }

    // Create user in our database
    const user = await operatorSchema.create({
      name,
      phone,
      password: encryptedPassword,
      user_type: "company",
    });

    // Create token
    const token = jwt.sign({
        user_id: user._id,
        phone
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