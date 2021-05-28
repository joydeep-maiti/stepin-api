const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, findByObj, correctMonthAndYear, insertOne, updateOne, deleteOne, updateMany } = require("./data");
const moment = require("moment");
const momentTimeZone = require("moment-timezone");
const { ObjectID } = require("mongodb");

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
      // console.log(booking._id.toString());
      if(booking._id.toString() === bookingId)
        return false
      const checkIn = momentTimeZone.tz(booking.checkIn, zone);
      const checkOut = momentTimeZone.tz(booking.checkOut, zone);

      const startDateIsBtw = moment(startDate).isBetween(checkIn, checkOut);
      const endDateIsBtw = moment(endDate).isBetween(checkIn, checkOut);
      const checkInIsBtw = moment(checkIn).isBetween(startDate, endDate);
      const checkOutIsBtw = moment(checkOut).isBetween(startDate, endDate);
      let startDateIsInclude = false,
        endDateIsInclude = false;

      if (compareDates(startDate, checkIn))
        startDateIsInclude = true;
      if (compareDates(endDate, checkIn))
        endDateIsInclude = true;
      // if (compareDates(startDate, checkIn) || compareDates(startDate, checkOut))
      //   startDateIsInclude = true;
      // if (compareDates(endDate, checkIn) || compareDates(endDate, checkOut))
      //   endDateIsInclude = true;

      // if (bookingId) console.log(bookingId);

      return startDateIsBtw ||
        endDateIsBtw ||
        checkInIsBtw ||
        checkOutIsBtw ||
        startDateIsInclude ||
        endDateIsInclude
        ? !booking.status.checkedOut? true
        :false :false;
    };

    for (let i = 0; i <= NoOfMonthsBtwDates; i++) {
      dateObjs.push({
        months: {
          $elemMatch: correctMonthAndYear(startDateMonth + i, startDateYear)
        }
      });
    }
    // debugger

    const filter = getfilter(dateObjs);
    console.log("filter", JSON.stringify(filter))
    const filteredBookings = await findByObj(dbs, collections.booking, filter);

    filteredBookings.forEach(booking => {
      const isIncluded = checkBookingNeedsToInclude(booking);
      if (isIncluded) filteredRooms = filteredRooms.concat([...booking.rooms]);
    });

    const uniqueFilteredRooms = removeDuplicates(filteredRooms, "roomNumber");

    let availableRooms = await findByObj(dbs, collections.room, {$or:[{inactive:false},{inactive:{$exists:false}}]});

    uniqueFilteredRooms.forEach(filteredRoom => {
      availableRooms = availableRooms.filter(
        room => room.roomNumber !== filteredRoom.roomNumber
      );
    });

    res.send(sortRooms(getUpdatedRooms(availableRooms)));
  });

  router.post("/rooms", cors(), async (req, res) => {
    console.log("POST /rooms", req.body)
    try {
      findOne(dbs, collections.room,{roomNumber:req.body.roomNumber})
      .then(result => {
        if(result){
          console.log(result)
          res.status(400).json({msg:"Room already exist!"})
        }else{
          insertOne(dbs, collections.room,req.body).then(result => res.status(201).send());
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  router.patch("/rooms/dirty", cors(), async (req, res) => {
    console.log("PATCH /rooms/dirty", req.body)
    let ids = req.body.rooms;
    if(!ids || !ids.length){
      res.status(400).send()
    }else {
      let roomIds = ids.map(el=> (new ObjectID(el)))
      // console.log("roomIds",roomIds)
      try {
        updateMany(dbs, collections.room, {_id: {$in:roomIds}}, {$set:{dirty:true}}).then(result => res.status(200).send(result));
      } catch (error) {
        console.log(error);
      }
    }
  });

  router.patch("/rooms/clean", cors(), async (req, res) => {
    console.log("PATCH /rooms/dirty", req.body)
    let ids = req.body.rooms;
    if(!ids || !ids.length){
      res.status(400).send()
    }else {
      let roomIds = ids.map(el=> (new ObjectID(el)))
      // console.log("roomIds",roomIds)
      try {
        updateMany(dbs, collections.room, {_id: {$in:roomIds}}, {$set:{dirty:false}}).then(result => res.status(200).send(result));
      } catch (error) {
        console.log(error);
      }
    }
  });


  router.patch("/rooms", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    // console.log("PATCH /rooms", req.body,body)
    try {
      updateOne(dbs, collections.room, {_id:new ObjectID(_id)}, {$set:body}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });

  router.delete("/rooms/:id", cors(), async (req, res) => {
    console.log("DELETE /rooms", req.params.id)
    try {
      deleteOne(dbs, collections.room, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });

});

module.exports = router;
