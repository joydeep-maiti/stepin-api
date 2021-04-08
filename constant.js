const monthObj = {
  monthName: "",
  year: "",
  monthNumber: "",
  numberOfDays: "",
  bookingArray: []
};

const dataBaseName = "hotel-booking";

const collections = {
  room: "room",
  booking: "booking",
  season: "season",
  roomcategory: "roomcategory",
  tax: "tax",
  rate:"rate",
  idproof:"idproof",
  reporttype:"reporttype"
};

const mongoUrl = process.env.MONGODB_URL;

module.exports = { monthObj, dataBaseName, collections, mongoUrl };
