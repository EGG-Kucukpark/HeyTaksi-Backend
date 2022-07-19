const { create, list, activeCampaignlist, update } = require("../../services/website/campaignService");
const { DateTime } = require("luxon");
module.exports.newCampaign = async (req, res) => {
  if (await activeCampaignlist()) return res.status(400).json({ message: "Aktif kampanya bulunmaktadır." });
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
      if (!response) return res.status(400).json({ message: "Aktif kampanya bulunmaktadır." });
      let results = response.toObject();
      results.startDate = DateTime.fromJSDate(response.startDate).toFormat("dd.MM.yyyy HH:mm");
      results.endDate = DateTime.fromJSDate(response.endDate).toFormat("dd.MM.yyyy HH:mm");
      res.status(200).json(results);
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
