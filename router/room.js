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
    try {
      findAll(dbs, collections.room).then(result =>
        res.send(sortRooms(result))
      );
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/rooms/available", cors(), async (req, res) => {
    try {
      let checkIn = momentTimeZone
        .tz(req.body.checkIn, "Asia/Kolkata")
        .format();
      let checkOut = momentTimeZone
        .tz(req.body.checkOut, "Asia/Kolkata")
        .format();

      let diffrenceInMonth = moment(checkOut).month() - moment(checkIn).month();
      let bookings = [],
        filteredRooms = [];

      for (let index = 0; index <= diffrenceInMonth; index++) {
        let obj = correctMonthAndYear(
          moment(checkIn).month() + index,
          moment(checkIn).year()
        );

        const filter = {
          $and: [
            {
              months: {
                $elemMatch: obj
              }
            },
            { "status.cancel": { $eq: false } }
          ]
        };

        result = await findByObj(dbs, collections.booking, filter);
        bookings = result.length > 0 ? bookings.concat(result) : bookings;
      }

      if (req.body.bookingId !== null) {
        bookings = bookings.filter(
          booking => booking._id.toString() !== req.body.bookingId.toString()
        );
      }

      bookings.forEach(booking => {
        let isCheckInInclude = false,
          isCheckOutInclude = false;

        let bookingCheckIn = momentTimeZone
          .tz(booking.checkIn, "Asia/Kolkata")
          .format();

        let bookingCheckOut = momentTimeZone
          .tz(booking.checkOut, "Asia/Kolkata")
          .format();

        let checkInCheck = moment(checkIn).isBetween(
          bookingCheckIn,
          bookingCheckOut
        );

        let checkOutCheck = moment(checkOut).isBetween(
          bookingCheckIn,
          bookingCheckOut
        );

        if (
          moment(checkIn).format("DD.MM.YYYY") ===
            moment(bookingCheckIn).format("DD.MM.YYYY") ||
          moment(checkIn).format("DD.MM.YYYY") ===
            moment(bookingCheckOut).format("DD.MM.YYYY")
        ) {
          isCheckInInclude = true;
        }

        if (
          moment(checkOut).format("DD.MM.YYYY") ===
            moment(bookingCheckIn).format("DD.MM.YYYY") ||
          moment(checkOut).format("DD.MM.YYYY") ===
            moment(bookingCheckOut).format("DD.MM.YYYY")
        ) {
          isCheckOutInclude = true;
        }

        if (
          checkInCheck ||
          checkOutCheck ||
          isCheckInInclude ||
          isCheckOutInclude
        )
          filteredRooms = filteredRooms.concat([...booking.rooms]);
      });

      filteredRooms = [...new Set(filteredRooms)];

      const allRooms = await findAll(dbs, collections.room);
      let availableRooms = allRooms;

      filteredRooms.forEach(filteredRoom => {
        availableRooms = availableRooms.filter(
          room => room._id.toString() !== filteredRoom._id.toString()
        );
      });

      res.send(sortRooms(availableRooms));
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
