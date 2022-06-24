const { getAllOffers, createDiscountOffer, updateDiscountOffer } = require("../../services/website/discountOffersService");
const { addUserToOperatorPanel } = require("../../services/website/webUsersService");
const { getBestDriverDuration } = require("../../utils/helpers/locationHelper");
const { userControl } = require("../../utils/helpers/userControlsHelper");

const getOffers = (req, res) => {
  getAllOffers()
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

const createOffer = async (req, res) => {
  if (!req.body?.phone && !req.body?.email) {
    return res.status(400).json({
      message: "Phone or email is required",
    });
  }
  const checkUser = await userControl(req.body?.email, req.body?.phone);

  if (checkUser) {
    createDiscountOffer({
      offeredPrice: req.body?.offeredPrice,
      location: req.body?.location,
      estimatedPrice: req.body?.estimatedPrice,
      user: checkUser._id,
    })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((error) => {
        res.status(400).json(error);
      });
    const sockets = await req.app.io.fetchSockets();
    sockets.map((item) => {
      item.emit("customerLoc");
      item.emit("newOffer");
    });
  } else {
    return res.status(400).json({
      message: "User not found",
    });
  }
};

const acceptOffer = async (req, res) => {
  const results = await getBestDriverDuration(req.body?.location);

  if (results.duration === 0) {
    return res.status(400).json({
      message: "No drivers found",
    });
  } else {
    await addUserToOperatorPanel({
      userName: req.body?.user?.fullname,
      userPhone: req.body?.user.phone,
      location: results.location,
      beforePrice: 0,
    });
    const sockets = await req.app.io.fetchSockets();
    sockets.map((item) => {
      item.emit("newCustomer");
      item.emit("customerLocation");
    });
    await updateDiscountOffer({ user: req.body?.user._id }, { status: "accepted" });
    return res.status(200).json({
      message: "İşlem başarılı",
    });
  }
};

const rejectOffer = (req, res) => {
  updateDiscountOffer({ _id: req.body?.offerId }, { status: "rejected" })
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

module.exports = {
  getOffers,
  createOffer,
  acceptOffer,
  rejectOffer,
};
