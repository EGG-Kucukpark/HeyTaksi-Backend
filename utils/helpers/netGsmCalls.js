const axios = require("axios");

const apisettings = {
  username: 8503040320,
  password: "Deniz123.",
  internal_num: 101,
  ring_timeout: 10,
  crm_id: "XXX",
  wait_response: 1,
  originate_order: "of",
  trunk: 8503040320,
};

module.exports.callDriver = (number) => {
  axios
    .get("http://crmsntrl.netgsm.com.tr:9111/8503040320/originate", {
      params: {
        ...apisettings,
        customer_num: number,
      },
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports.callCustomerFromDriver = (caller, called) => {
  axios
    .get("http://crmsntrl.netgsm.com.tr:9111/8503040320/linkup", {
      params: {
        ...apisettings,
        caller,
        called,
      },
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
};
