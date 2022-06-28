const { getOffers, createOffer, acceptOffer, rejectOffer, customerOffers } = require("../../controllers/website/discountOffersControllers");

const router = require("express").Router();

router.route("/discountOffers").get(getOffers);
router.route("/discountOffers").post(createOffer);
router.route("/discountOffers/accept").post(acceptOffer);
router.route("/discountOffers/reject").post(rejectOffer);
router.route("/discountOffers/user").get(customerOffers);

module.exports = router;
