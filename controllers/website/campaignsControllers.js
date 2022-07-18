const { create, list } = require("../../services/website/campaignService");

export const newCampaign = (req, res) => {
  create(req.body)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

export const campaignlist = (req, res) => {
  list()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};
