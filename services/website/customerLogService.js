const customerLogDB = require("../../models/operator/others/customerLogDB");

const createLog = (data) => {
  const customerLog = new customerLogDB(data);
  return customerLog.save();
};

module.exports = {
  createLog,
};
