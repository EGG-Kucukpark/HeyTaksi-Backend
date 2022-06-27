const discountOffers = require("../../models/website/discountOffersDB");

const offerDateControl = async () => {
  const waitingTime = 60;
  const offers = await discountOffers.find({ status: "waiting" });
  offers.map((item) => {
    const offerTime = new Date(item.createdAt).setMinutes(offerTime.getMinutes() + waitingTime);
    if (new Date(offerTime) < new Date()) {
      item.status = "expired";
      item.save();
    }
  });
};

const getAllOffers = async (query) => {
  await offerDateControl();
  return discountOffers.find(query || {}).populate({
    path: "user",
    select: "_id fullname phone",
  });
};

const createDiscountOffer = async (offer) => {
  const check = await discountOffers.findOne({ user: offer.user, status: "waiting" });
  if (check) {
    await discountOffers.findByIdAndDelete(check._id);
  }
  const discountOffer = new discountOffers(offer);
  return discountOffer.save();
};

const updateDiscountOffer = (query, data) => {
  return discountOffers.findOneAndUpdate(query, data, { new: true });
};

module.exports = {
  getAllOffers,
  createDiscountOffer,
  updateDiscountOffer,
};
