const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findByObj, correctMonthAndYear } = require("./data");
const moment = require("moment");
const momentTimeZone = require("moment-timezone");

const sortRooms = rooms => {
  rooms.sort((a, b) => {
    if (a.roomNumber < b.roomNumber) return -1;
    if (a.roomNumber > b.roomNumber) return 1;
    return 0;
  });

  return rooms;
};

dataBaseConnection().then(dbs => {
  router.get("/rooms", cors(), (req, res) => {
    console.log("/rooms")
    try {
      findAll(dbs, collections.room).then(result =>
        res.send(sortRooms(result))
      );
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/rooms/available", cors(), async (req, res) => {
    let filteredRooms = [],
      dateObjs = [];
    const zone = "Asia/Kolkata";
    const bookingId = req.body.bookingId;
    const startDate = momentTimeZone.tz(req.body.checkIn, zone);
    const endDate = momentTimeZone.tz(req.body.checkOut, zone);
    const startDateMonth = moment(startDate).month();
    const startDateYear = moment(startDate).year();

    const NoOfMonthsBtwDates =
      moment(endDate).month() - moment(startDate).month();

    const removeDuplicates = (myArr, prop) =>
      myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
      });

    const getfilter = monthFilter => ({
      $and: [{ $or: monthFilter }, { "status.cancel": { $eq: false } }]
    });

    const getUpdatedRooms = rooms =>
      rooms.map(room => ({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        _id: room._id
      }));

    const formatDate = (date, format = "DD.MM.YYYY") =>
      moment(date).format(format);

    const compareDates = (date1, date2) => {
      if (formatDate(date1) === formatDate(date2)) return true;
      else return false;
    };

    const checkBookingNeedsToInclude = booking => {
      const checkIn = momentTimeZone.tz(booking.checkIn, zone);
      const checkOut = momentTimeZone.tz(booking.checkOut, zone);

      const startDateIsBtw = moment(startDate).isBetween(checkIn, checkOut);
      const endDateIsBtw = moment(endDate).isBetween(checkIn, checkOut);
      const checkInIsBtw = moment(checkIn).isBetween(startDate, endDate);
      const checkOutIsBtw = moment(checkOut).isBetween(startDate, endDate);
      let startDateIsInclude = false,
        endDateIsInclude = false;

      if (compareDates(startDate, checkIn) || compareDates(startDate, checkOut))
        startDateIsInclude = true;
      if (compareDates(endDate, checkIn) || compareDates(endDate, checkOut))
        endDateIsInclude = true;

      if (bookingId) console.log(bookingId);

      return startDateIsBtw ||
        endDateIsBtw ||
        checkInIsBtw ||
        checkOutIsBtw ||
        startDateIsInclude ||
        endDateIsInclude
        ? true
        : false;
    };

    for (let i = 0; i <= NoOfMonthsBtwDates; i++) {
      dateObjs.push({
        months: {
          $elemMatch: correctMonthAndYear(startDateMonth + i, startDateYear)
        }
      });
    }

    const filter = getfilter(dateObjs);
    const filteredBookings = await findByObj(dbs, collections.booking, filter);

    filteredBookings.forEach(booking => {
      const isIncluded = checkBookingNeedsToInclude(booking);
      if (isIncluded) filteredRooms = filteredRooms.concat([...booking.rooms]);
    });

    const uniqueFilteredRooms = removeDuplicates(filteredRooms, "roomNumber");

    let availableRooms = await findAll(dbs, collections.room);

    uniqueFilteredRooms.forEach(filteredRoom => {
      availableRooms = availableRooms.filter(
        room => room.roomNumber !== filteredRoom.roomNumber
      );
    });

    res.send(sortRooms(getUpdatedRooms(availableRooms)));
  });
});

module.exports = router;
