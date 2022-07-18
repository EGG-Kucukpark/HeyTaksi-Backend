const campaignDB = require("../../models/operator/others/campaignsDB");

module.exports.create = (data) => {
  return new campaignDB(data).save();
};

module.exports.list = () => {
  return campaignDB.find({});
};
