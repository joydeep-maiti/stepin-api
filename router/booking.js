const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const ObjectID = require("mongodb").ObjectID;
const moment = require("moment");
const momentTimeZone = require("moment-timezone");

const {
  findAll,
  findOne,
  findByObj,
  insertOne,
  updateOne,
  correctMonthAndYear
} = require("./data");

dataBaseConnection().then(dbs => {
  router.get("/bookings", cors(), async (req, res) => {
    try {
      findAll(dbs, collections.booking).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.get("/booking/idproof/:id", cors(), async (req, res) => {
    try {
      findOne(dbs, collections.idproof, {bookingId:new ObjectID(req.params.id)}).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.get("/bookings/dayCheckin", cors(), async (req, res) => {
    console.log(req.query.date)
    let nulls = ["null","undefined", null, undefined]
    let date = req.query.date && !nulls.includes(req.query.date)? new Date(req.query.date).toISOString(): new Date().toISOString()
    let start = date.split("T")[0]+"T00:00:00.000Z"
    let end = date.split("T")[0]+"T23:59:59.999Z"
    try {
      const filter = {
        'checkIn': {
          '$lte': end
        }, 
        'checkOut': {
          '$gte': start
        }, 
        'status.checkedIn': true, 
        'status.checkedOut': false
      }

      findByObj(dbs, collections.booking, filter).then(result => {
        res.send(result);
      });
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/bookings/filterByMonth", cors(), async (req, res) => {
    try {
      const filter = {
        $and: [
          {
            months: {
              $elemMatch: { month: req.body.month, year: req.body.year }
            }
          },
          { "status.cancel": { $eq: false } },
          { "status.checkedOut": { $eq: false } }
        ]
      };
      findByObj(dbs, collections.booking, filter).then(result => {
        res.send(result);
      });
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/bookings/filterByWeek", cors(), async (req, res) => {
    console.log("/bookings/filterByWeek")
    let date =new Date(req.body.fromDate) ;
    if(date == "Invalid Date"){
      res.status(400).send()
    }else{
      let todate =  moment(req.body.fromDate).add(1,'w').toISOString().split("T")[0]
      let fromDate =  moment(req.body.fromDate).toISOString().split("T")[0]
      try {
        const filter = {
          $and: [
            {$or:[{$and:[{checkIn:{$gte: fromDate}},{checkIn:{$lte: todate}}]}, {$and:[{checkOut:{$gte: fromDate}},{checkOut:{$lte: todate}}]}]},
            { "status.cancel": { $eq: false } },
            { "status.checkedOut": { $eq: false } }
          ]
        };
        findByObj(dbs, collections.booking, filter).then(result => {
          res.send(result);
        });
      } catch (error) {
        console.log(error);
      }
    }
  });

  getMonths = (checkIn, checkOut) => {
    checkIn = momentTimeZone.tz(checkIn, "Asia/Kolkata").format();
    checkOut = momentTimeZone.tz(checkOut, "Asia/Kolkata").format();

    let months = [];
    const diffrenceInMonth = moment(checkOut).month() - moment(checkIn).month();

    for (let index = 0; index <= diffrenceInMonth; index++) {
      let obj = correctMonthAndYear(
        moment(checkIn).month() + index,
        moment(checkIn).year()
      );
      months.push(obj);
    }
    return months;
  };

  router.post("/bookings/insert", cors(), async (req, res) => {
    try {
      let {idProofImage,...booking} = req.body;
      booking["months"] = getMonths(booking.checkIn, booking.checkOut);
      booking["bookingId"] = booking.firstName + booking.lastName;
      //Adding advance to advance
      console.log("Advance value",booking["advance"])
      let advance = [{date: booking.bookingDate,advanceP : booking.advance,modeofpayment : "Booking", reciptNumber : "Booking"}];
      let rooms = [...booking.rooms]
      //insertOne(dbs, collections.advancetab,{advance, bookingId: new ObjectID(req.body._id),guestName: `${booking.firstName} ${booking.lastName}`,rooms, advanceId:"ADVANCE"+(1000000+Number(booking.seq))})
      insertOne(dbs, collections.booking, booking)
      .then(result =>
        insertOne(dbs, collections.idproof, {
          bookingId: result.insertedId,
          idProofImage: idProofImage
        })
      )
      .then(result =>
        insertOne(dbs, collections.advancetab,{
          bookingId: booking._id,
           advance,
           guestName: `${booking.firstName} ${booking.lastName}`,
           rooms,
           advanceId:"ADVANCE"+(1000000+Number(result.seq))})
        )
      .then(result =>
        res.status(200).send(result)
      );
    } catch (error) {
      console.log(error);
    }
  });

  router.put("/bookings/update", cors(), async (req, res) => {
    try {
      console.log("enterted")
      let {idProofImage,...booking} = req.body;
      
      let advance =  booking.advance;
      console.log("advance",advance)
      booking["months"] = getMonths(req.body.checkIn, req.body.checkOut);
      booking["_id"] = new ObjectID(booking._id);
      updateOne(
        dbs,
        collections.booking,
        { _id: booking._id },
        { $set: booking }
      ).then(result => 
        updateOne(
          dbs,
          collections.idproof,
          { bookingId: booking._id },
          { $set: {idProofImage:idProofImage} }
        )
      ).then(result =>
        updateOne(
          dbs,
          collections.advancetab,
          { bookingId: booking._id },
          { $set :{advance : [{date: booking.bookingDate,advanceP : booking.advance,modeofpayment : "Booking", reciptNumber : "Booking"}]}}
          //{ $set : {'advance[0].advanceP': advance}}
        )
        )
      .then(result => 
        res.status(200).send(result)
      );
    } catch (error) {
      console.log(error);
    }
  });

  // router.get("/checkouts", cors(), async (req, res) => {
  //   let date = new Date().toJSON().split("T")[0]
  //   date = '2021-04-20'
  //   console.log("/checkoutsaaa",date)
  //   try {
  //     findByObj(dbs, collections.billing, {checkOut:{$gte:date}}).then(result => res.status(200).send(result));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

  router.get("/checkouts", cors(), async (req, res) => {
    let date = new Date().toJSON().split("T")[0]
    // date = '2021-04-20'
    console.log("/checkouts",date)
    try {
      // findByObj(dbs, collections.billing, {checkOut:{$gte:date}})
      dbs.collection(collections.billing).aggregate([
        {
          '$lookup': {
            'from': 'booking', 
            'localField': 'bookingId', 
            'foreignField': '_id', 
            'as': 'bookingDetails'
          }
        }, {
          '$match': {
            'checkOut': {
              '$gte': date
            }
          }
        }, {
          '$unwind': {
            'path': '$bookingDetails'
          }
        }
      ]).toArray(function(err, result) {
        res.send(result)
       });
    } catch (error) {
      console.log(error);
    }
  });

  router.get("/expectedcheckouts", cors(), async (req, res) => {

    let start = new Date().toISOString().split("T")[0]+"T00:00:00.000Z"
    let end = new Date().toISOString().split("T")[0]+"T23:59:59.999Z"

    try {
      findByObj(dbs, collections.booking, {"status.checkedIn":true, "status.checkedOut":false, $and: [{checkOut: {'$gte': start }}, {checkOut: {'$lte': end }}]})
      .then(result=>{
        res.status(200).send(result)
      })
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
