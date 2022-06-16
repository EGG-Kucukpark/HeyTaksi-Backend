const {
  checkUserExist,
  getUsers,
  newUser,
  getCab,
  autocomplete
} = require("../../controllers/website/webUsersControllers");

const router = require("express").Router();

router.route("/webUsers").get(getUsers);
router.route("/webUsers").post(newUser);
router.route("/webUsers/checkUser").post(checkUserExist);
router.route("/webUsers/getCab").post(getCab);

router.route("/autocomplete").post(autocomplete);

module.exports = router;
