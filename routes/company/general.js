const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
 
const userSchema = require("../../models/operator/user/userDB");



router.put('/company/resetpassword', (req, res) => {

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

    userSchema.findOne({
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