const { createAppointment, getCustomerAppointments, getAllAppointments } = require("../../services/website/appointmentsService");

module.exports.newAppointment = (req, res) => {
  if (!req?.body?.customer && !req?.body?.email) {
    return res.status(400).json({
      message: "Customer is required",
    });
  }
  req.body.date = new Date(req?.body?.date);
  createAppointment(req?.body)
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

module.exports.customerAppointments = (req, res) => {
  if (!req?.query?.id) {
    return res.status(400).json({
      message: "User id is required",
    });
  }
  getCustomerAppointments({ customer: req?.query?.id })
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

module.exports.allAppointments = (req, res) => {
  getAllAppointments()
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};
