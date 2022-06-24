const { getSingleUser } = require("../../services/website/webUsersService");

module.exports.userControl = async (email, phone) => {
  return phone ? await getSingleUser({ phone }) : await getSingleUser({ email });
};
