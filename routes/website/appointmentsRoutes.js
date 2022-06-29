const { newAppointment, allAppointments, customerAppointments } = require("../../controllers/website/appointmentsControllers");

const router = require("express").Router();

router.route("/appointments/customer").post(newAppointment);
router.route("/appointments/customer").get(customerAppointments);
router.route("/appointments").get(allAppointments);

module.exports = router;
