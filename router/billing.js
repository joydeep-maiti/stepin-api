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
  router.get("/billing", cors(), async (req, res) => {
    try {
      findAll(dbs, collections.billing).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.get("/billing/:id", cors(), async (req, res) => {
    try {
      findOne(dbs, collections.billing, {bookingId:new ObjectID(req.params.id)}).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });
})

module.exports = router;