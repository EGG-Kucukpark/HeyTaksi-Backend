const axios = require("axios");

module.exports.connectSocket = () => {
  axios
    .get(
      "http://crmsntrl.netgsm.com.tr:9111/8503040320/linkup",
      (params = {
        username: "8503040320",
        password: "Deniz123.",
        caller: "905413499067",
        called: "905315221489",
        ring_timeout: "20",
        crm_id: "XXX",
        wait_response: "1",
        originate_order: "of",
        trunk: "8503040320",
      })
    )
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};