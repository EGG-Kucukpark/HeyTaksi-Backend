const { default: axios } = require("axios");
const {
  getAllUsers,
  createUser,
  addUserToOperatorPanel,
  updateUserById,
  getUserInfo,
  getDriverInfo,
  deleteUserFromOperatorPanel,
} = require("../../services/website/webUsersService");
const { getBestDriverDuration, getDuration } = require("../../utils/helpers/locationHelper");

const { userControl } = require("../../utils/helpers/userControlsHelper");

const apiKey = "AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA";

const { createLog } = require("../../services/website/customerLogService");

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

  let checkUser = await userControl(req.body?.email, req.body?.phone);

  if (req.body?.email && checkUser && !checkUser?.email)
    checkUser = await updateUserById(checkUser._id, {
      email: req.body?.email,
    });

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

  const results = await getBestDriverDuration(req.body?.address.start);

  if (results.duration === 0) {
    return res.status(400).json({
      message: "No drivers found",
    });
  } else {
    await createLog({
      customer: user._id,
      action: "cab-requested",
      location: {
        start: req.body?.address?.start,
        end: req.body?.address?.end,
      },
    });
    await addUserToOperatorPanel({
      userName: user.fullname,
      userPhone: user.phone,
      location: {
        ...results.location,
        start: req.body?.address?.start,
        end: req.body?.address?.end,
      },
      beforePrice: 0,
    });
    const sockets = await req.app.io.fetchSockets();
    sockets.map((item) => {
      item.emit("customerLoc");
      item.emit("customerLocation");
      item.emit("newCustomer");
    });
    return res.status(200).json(results.duration);
  }
};

const getInfos = async (req, res) => {
  if (!req.query?.phone) {
    return res.status(400).json({
      message: "Phone is required",
    });
  }
  const activeUser = await getUserInfo(req.query?.phone);

  if (activeUser?.status === "trip") {
    const driver = await getDriverInfo(req.query?.phone);
    const duration = await getDuration(
      {
        lat: activeUser.location.degreesLatitude,
        lng: activeUser.location.degreesLongitude,
      },
      { lat: driver.lat, lng: driver.lng }
    );
    return res.status(200).json({
      location: {
        start: activeUser.location.start,
        end: activeUser.location.end,
      },
      status: activeUser.status,
      duration: Math.ceil(duration / 60),
      createdAt: activeUser.createdAt,
    });
  } else if (activeUser?.status === "online") {
    return res.status(200).json({
      location: {
        start: activeUser.location.start,
        end: activeUser.location.end,
      },
      status: activeUser.status,
      createdAt: activeUser.createdAt,
    });
  } else if (!activeUser) {
    return res.status(400).json({
      message: "No user found",
    });
  }
};

const autocomplete = async (req, res) => {
  if (!req.body?.input) {
    return res.status(400).json({
      message: "Input is required",
    });
  }
  const apiResponse = await axios.get(
    encodeURI(`https://maps.googleapis.com/maps/api/place/autocomplete/json?components=country:tr&input=${req.body.input}&language=tr&key=${apiKey}`)
  );
  if (apiResponse.status === 200) {
    return res.status(200).json(apiResponse.data);
  }
  return res.status(400);
};

const cancelCab = async (req, res) => {
  if (!req.body?.phone) {
    return res.status(400).json({
      message: "Phone is required",
    });
  }

  //Check driver if acceppted customer
  /* const activeDriver = await getDriverInfo({ customerPhone: req.body?.phone });
  console.log(activeDriver);
  if (activeDriver) {
    activeDriver.customerPhone = null;
    activeDriver.customerName = null;
    activeDriver.status = "online";
    activeDriver.save();
  }
 */
  const activeUser = await getUserInfo(req.body?.phone);
  const user = await userControl(req.body?.email, req.body?.phone);

  const sockets = await req.app.io.fetchSockets();
  if (activeUser && activeUser?.status === "online") {
    deleteUserFromOperatorPanel(activeUser._id)
      .then(async () => {
        sockets.map( (item) => {
          item.emit("customerLoc");
        });
        res.status(200).json({
          message: "Müşteri silindi.",
        });
        await createLog({
          customer: user._id,
          action: "cab-canceled",
        });
      })
      .catch((error) => {
        res.status(400).json(error);
      });
  } else if (activeUser && activeUser?.status === "trip") {
    deleteUserFromOperatorPanel(activeUser._id)
      .then(async () => {
        await createLog({
          customer: user._id,
          action: "cab-canceled",
        });
        sockets.map((item) => {
          item.emit("tripCancel", { userPhone: req.body?.phone });
          item.emit("driverLoc");
          item.emit("customerLoc");
        });
        res.status(200).json({
          message: "Müşteri silindi.",
        });
      })
      .catch((error) => {
        res.status(400).json(error);
      });
  } else {
    return res.status(400).json({
      message: "Müşteri bulunamadı.",
    });
  }
};

module.exports = {
  getUsers,
  newUser,
  checkUserExist,
  getCab,
  autocomplete,
  getInfos,
  cancelCab,
};
