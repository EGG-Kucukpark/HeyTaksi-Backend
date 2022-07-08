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
  const trips = await customerLogDB.countDocuments({
    action: "trip-ended",
  });
  return {
    requestedCabs,
    canceledCabs,
    trips,
  };
};

module.exports = {
  createLog,
  getCustomerIstatistics,
};
