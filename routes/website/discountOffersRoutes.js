const {
  getOffers,
  createOffer,
  acceptOffer,
  rejectOffer,
} = require("../../controllers/website/discountOffersControllers");

const router = require("express").Router();

router.route("/discountOffers").get(getOffers);
router.route("/discountOffers").post(createOffer);
router.route("/discountOffers/accept").post(acceptOffer);
router.route("/discountOffers/reject").post(rejectOffer);

module.exports = router;
