
let currentTrip = (await axios('http://www.turkpark.com.tr:2222/currentTripData', {params:{id:trip_id}})).data
let options = (await axios('http://www.turkpark.com.tr:2222/options')).data

let finalData = {
    tripId: data.tripId,
    driverID: data.driver.driverID,
    customerPhone: data.customerPhone,
    price: 0,
    distance: 0,
    discountedPrice: 0,
    discount: 0,
    waitTime: 0,
    beforePrice: 0,
    startLocation: {},
    endLocation: {},
    finalPrice: 0,
}



if (data.waitTime > 5) {
    finalData.price += data.waitTime - 5
}


if (Math.floor(data.distance) <= options[0].minDistance) {
    finalData.price += options[0].minPrice;

} else {

    let time = (data.tripTime / 60) / 60;
    let distance = data.distance
    let timeDiff = 1;
    let currentDay = luxon.DateTime.local().toFormat('cccc')
    let currentTime = luxon.DateTime.local().setZone('Europe/Istanbul').toFormat('HH:mm:ss')

    options[0].prices[currentDay].forEach(element => {
        let start = luxon.DateTime.local().setZone('Europe/Istanbul').toFormat(element.start, 'HH:mm:ss')
        let end = luxon.DateTime.local().setZone('Europe/Istanbul').toFormat(element.end, 'HH:mm:ss')

        if (currentTime >= start && currentTime <= end) {
            timeDiff = element.priceRatio
        }
    })

    // avg speed time is seconds
    let avgSpeed = distance / time;

    let avgSpeedPrice = avgSpeed >= 40 ? 1 : avgSpeed <= 30 ? 1.1 : 1.2;

    let totalPrice = distance * avgSpeedPrice * options[0].price * timeDiff;

    finalData.price += totalPrice

}



finalData.distance = parseInt(data.distance.toFixed(1))
finalData.price = parseInt(finalData.price.toFixed(2))
finalData.beforePrice = currentTrip.beforePrice
finalData.finalPrice += finalData.price + currentTrip.beforePrice
finalData.discount = (finalData.finalPrice % 1).toFixed(2)
finalData.discountedPrice = Math.floor(finalData.finalPrice)