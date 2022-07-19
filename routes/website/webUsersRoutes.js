const { newCampaign, campaignlist, activeCampaign, updateCampaign } = require("../../controllers/website/campaignsControllers");
const { getIstatistics, logList } = require("../../controllers/website/customerLogsControllers");
const { checkUserExist, getUsers, newUser, getCab, autocomplete, getInfos, cancelCab } = require("../../controllers/website/webUsersControllers");

const router = require("express").Router();

router.route("/webUsers").get(getUsers);
router.route("/webUsers").post(newUser);
router.route("/webUsers/checkUser").post(checkUserExist);
router.route("/webUsers/getCab").post(getCab);
router.route("/webUsers/getCab").get(getInfos);
router.route("/webUsers/cancelCab").post(cancelCab);
router.route("/customer-logs").get(getIstatistics);
router.route("/customer-logs-list").get(logList);

router.route("/campaigns").post(newCampaign);
router.route("/campaigns").get(campaignlist);
router.route("/active-campaign").get(activeCampaign);
router.route("/campaigns/:id").patch(updateCampaign);

router.route("/autocomplete").post(autocomplete);

module.exports = router;
