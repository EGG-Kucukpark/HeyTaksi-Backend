const discountOffers = require("../../models/website/discountOffersDB");

const getAllOffers = (query) => {
  return discountOffers.find(query || {}).populate({
    path: "user",
    select: "_id fullname phone",
  });
};

const createDiscountOffer = async (offer) => {
  const check = await discountOffers.findOne({ user: offer.user });
  console.log(check);
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
