const { default: axios } = require("axios");
const {
  getAllUsers,
  createUser,
  addUserToOperatorPanel,
} = require("../../services/website/webUsersService");
const { getBestDriverDuration } = require("../../utils/helpers/locationHelper");

const { userControl } = require("../../utils/helpers/userControlsHelper");

const apiKey = "AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA";

const getUsers = (req, res) => {
  getAllUsers()
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

const newUser = async (req, res) => {
  if (!req.body?.phone && !req.body?.email) {
    return res.status(400).json({
      message: "Phone or email is required",
    });
  }

  const checkUser = await userControl(req.body?.email, req.body?.phone);

  if (checkUser) {
    res.status(200).json(checkUser);
  } else {
    createUser(req.body)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((error) => {
        res.status(400).json(error);
      });
  }
};

const checkUserExist = async (req, res) => {
  if (!req.body?.email && !req.body?.phone) {
    return res.status(400).json({
      message: "email or phone is required",
    });
  }

  const checkUser = await userControl(req.body?.email, req.body?.phone);

  if (checkUser) {
    res.status(200).json(checkUser);
  } else {
    res.status(400).json({
      message: "User not found",
    });
  }
};

const getCab = async (req, res) => {
  if (!req.body?.address || !req.body?.phone) {
    return res.status(400).json({
      message: "Phone and address is required",
    });
  }
  const user = await userControl(req.body?.email, req.body?.phone);

  const results = await getBestDriverDuration(req.body?.address);

  if (results.duration === 0) {
    return res.status(400).json({
      message: "No drivers found",
    });
  } else {
    await addUserToOperatorPanel({
      userName: user.fullname,
      userPhone: user.phone,
      location: results.location,
      beforePrice: 0,
    });
    const sockets = await req.app.io.fetchSockets();
    sockets.map((item) => {
      item.emit("customerLoc");
    });
    return res.status(200).json(results.duration);
  }
};

const autocomplete = async (req, res) => {
  if (!req.body?.input) {
    return res.status(400).json({
      message: "Input is required",
    });
  }
  const apiResponse = await axios.get(
    encodeURI(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?components=country:tr&input=${req.body.input}&language=tr&types=geocode&key=${apiKey}`
    )
  );
  if (apiResponse.status === 200) {
    return res.status(200).json(apiResponse.data);
  }
  return res.status(400);
};

module.exports = {
  getUsers,
  newUser,
  checkUserExist,
  getCab,
  autocomplete,
};
