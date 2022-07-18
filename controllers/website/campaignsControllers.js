const { create, list } = require("../../services/website/campaignService");

module.exports.newCampaign = (req, res) => {
  create(req.body)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

module.exports.campaignlist = (req, res) => {
  list()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};
