const axios = require("axios");

const driversDB = require("../../models/operator/Driver/trackDriverDB");

const findAdressCoordinates = async (startLoc) => {
  let addressLocation = {
    lat: null,
    lng: null,
  };
  await axios(encodeURI(`https://maps.googleapis.com/maps/api/geocode/json?address=${startLoc}+Izmir&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`))
    .then((res) => {
      addressLocation.lat = res.data.results[0].geometry.location.lat;
      addressLocation.lng = res.data.results[0].geometry.location.lng;
    })
    .catch((err) => {
      console.log(err);
    });
  return addressLocation;
};

const getActiveDrivers = async () => {
  return await driversDB.find({ status: "online" });
};

const getDuration = async (userAddress, driverAdress) => {
  const duration = await axios(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userAddress.lat}%2C${userAddress.lng}&destinations=${driverAdress.lat}%2C${driverAdress.lng}%&key=AIzaSyAvSIFGIo-hmpQwRS-SKcUkqAepbT3LzVA`
  );
  return duration.data.rows[0].elements[0].duration.value;
};

const getBestDriverDuration = async (address) => {
  const drivers = await getActiveDrivers();
  const userAddress = await findAdressCoordinates(address);

  let result = 0;

  if (drivers.length > 0) {
    for await (let driver of drivers) {
      const duration = await getDuration(userAddress, {
        lat: driver.lat,
        lng: driver.lng,
      });
      result = result === 0 ? duration : duration < result ? duration : result;
    }
  }
  return {
    location: {
      degreesLatitude: userAddress.lat,
      degreesLongitude: userAddress.lng,
    },
    duration: result > 0 ? Math.ceil(result / 60) : 0,
  };
};

module.exports = {
  getBestDriverDuration,
  getDuration,
  findAdressCoordinates,
};
