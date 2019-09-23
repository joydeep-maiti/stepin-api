const monthObj = {
    "monthName": "",
    "year": "",
    "monthNumber": "",
    "numberOfDays": "",
    "bookingArray": []
}

const dataBaseName = "hotel-booking";

const collections = {
    room: "room",
    booking: "booking"
}

const mongoUrl = process.env.MONGODB_URL;

module.exports = { monthObj, dataBaseName, collections, mongoUrl };