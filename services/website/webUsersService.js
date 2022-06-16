const webUsers = require("../../models/website/webUsersDB");
const instuserLocation = require("../../models/operator/location/instLocation");

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
    await instuserLocation.deleteOne({ userPhone: user.userPhone });
  }
  return new instuserLocation(user).save();
};

module.exports = {
  getAllUsers,
  createUser,
  getSingleUser,
  addUserToOperatorPanel,
};
