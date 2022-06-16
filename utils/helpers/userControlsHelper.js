const { getSingleUser } = require("../../services/website/webUsersService");

module.exports.userControl = async (email, phone) => {
  return email
    ? await getSingleUser({ email })
    : await getSingleUser({ phone });
};
