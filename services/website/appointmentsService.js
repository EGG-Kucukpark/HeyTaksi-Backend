const appointmentDB = require("../../models/website/appointmentDB");

const createAppointment = (data) => {
  const newAppointment = new appointmentDB(data);
  return newAppointment.save();
};

const getAllAppointments = (query) => {
  return appointmentDB
    .find(query || {})
    .populate({
      path: "customer",
      select: "fullname",
    })
    .populate({
      path: "driver",
      select: "name",
    });
};

const getCustomerAppointments = (query) => {
  return appointmentDB.find(query || {});
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getCustomerAppointments,
};
