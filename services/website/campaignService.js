const campaignDB = require("../../models/operator/others/campaignsDB");

module.exports.create = (data) => {
  return new campaignDB(data).save();
};

module.exports.list = (query) => {
  return campaignDB.find(query || {});
};

module.exports.update = (id, data) => {
  return campaignDB.findByIdAndUpdate(id, data, { new: true });
};

module.exports.remove = (id) => {
  return campaignDB.findByIdAndDelete(id);
};

module.exports.activeCampaignlist = () => {
  return campaignDB.findOne({
    status: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });
};
