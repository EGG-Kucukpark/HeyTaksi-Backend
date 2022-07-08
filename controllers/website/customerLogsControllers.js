const { getCustomerIstatistics, getLogList } = require("../../services/website/customerLogService");

const getIstatistics = (req, res) => {
  getCustomerIstatistics()
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

const logList = (req, res) => {
  getLogList()
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

module.exports = {
  getIstatistics,
  logList,
};
