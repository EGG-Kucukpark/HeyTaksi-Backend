const webUsers = require("../../models/website/webUsersDB");
const instuserLocation = require("../../models/operator/location/instLocation");
const driverTrack = require("../../models/operator/Driver/trackDriverDB");

const getAllUsers = (query) => {
  return webUsers.find(query || {});
};

const getSingleUser = (query) => {
  return query ? webUsers.findOne(query) : null;
};

const createUser = (user) => {
  const newUser = new webUsers(user);
  return newUser.save();
};

const addUserToOperatorPanel = async (user) => {
  const check = await instuserLocation.findOne({ userPhone: user.userPhone });

  if (check) {
    await instuserLocation.findByIdAndDelete(check._id);
  }
  return new instuserLocation(user).save();
};

const getUserInfo = (userPhone) => {
  return instuserLocation.findOne({ userPhone });
};

const getDriverInfo = (customerPhone) => {
  return driverTrack.findOne({ customerPhone });
};

const updateUserById = (id, data) => {
  return webUsers.findByIdAndUpdate(id, data, { new: true });
};

const updateUserByQuery = (query, data) => {
  return webUsers.findByIdAndUpdate(query, data, { new: true });
};

const deleteUserFromOperatorPanel = (userPhone) => {
  return instuserLocation.findOneAndDelete({ userPhone });
};

module.exports = {
  getAllUsers,
  createUser,
  getSingleUser,
  addUserToOperatorPanel,
  deleteUserFromOperatorPanel,
  updateUserById,
  updateUserByQuery,
  getUserInfo,
  getDriverInfo,
};
