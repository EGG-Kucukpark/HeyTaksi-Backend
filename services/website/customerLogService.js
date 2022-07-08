const customerLogDB = require("../../models/operator/others/customerLogDB");

const createLog = (data) => {
  const customerLog = new customerLogDB(data);
  return customerLog.save();
};

const getCustomerIstatistics = async () => {
  const requestedCabs = await customerLogDB.countDocuments({
    action: "cab-requested",
  });
  const canceledCabs = await customerLogDB.countDocuments({
    action: "cab-canceled",
  });
  return {
    requestedCabs,
    canceledCabs,
  };
};

module.exports = {
  createLog,
  getCustomerIstatistics,
};
