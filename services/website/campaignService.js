const campaignDB = require("../../models/operator/others/campaignsDB");

export const create = (data) => {
  return new campaignDB(data).save();
};

export const list = () => {
  return campaignDB.find({});
};
