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
  router.get("/getAllBills", cors(), async (req, res) => {
    try {
        dbs.collection(collections.billing).aggregate([
          {
            '$lookup': {
              'from': 'booking', 
              'localField': 'bookingId', 
              'foreignField': '_id', 
              'as': 'bookingDetails'
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
})

//GetbyDate
router.get("/getBillsbyDate", cors(), async (req, res) => {
    let date = req.query.date;
    let start = date+"T00:00:00.000Z"
    let end = date+"T23:59:59.999Z"
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
              '$gte': start,
              '$lte':end
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






});



module.exports = router;
