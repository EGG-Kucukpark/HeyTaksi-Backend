const { create, list, activeCampaignlist, update } = require("../../services/website/campaignService");

module.exports.newCampaign = async (req, res) => {
  if (activeCampaignlist()) return res.status(400).json({ message: "Aktif kampanya bulunmaktadır." });
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

module.exports.activeCampaign = (req, res) => {
  activeCampaignlist()
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

module.exports.updateCampaign = (req, res) => {
  if (!req.params.id) return res.status(400).json({ message: "ID gerekli" });

  update(req.params.id, req.body)
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};
