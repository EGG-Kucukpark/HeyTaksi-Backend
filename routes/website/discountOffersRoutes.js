const {
  getOffers,
  createOffer,
  acceptOffer,
} = require("../../controllers/website/discountOffersControllers");

const router = require("express").Router();

router.route("/discountOffers").get(getOffers);
router.route("/discountOffers").post(createOffer);
router.route("/discountOffers/accept").post(acceptOffer);

module.exports = router;
