const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne, deleteMany } = require("./data");
const { ObjectID } = require("mongodb");
const { updateRateByPercentage } = require("./rateMaster")

dataBaseConnection().then(dbs => {
  router.get("/userlog/active", cors(), async (req, res) => {
    console.log("GET /season")
    try {
        dbs.collection(collections.userlog).aggregate([
            {
              '$group': {
                '_id': '$username', 
                'logId': {
                  '$last': '$login'
                }
              }
            }, {
              '$match': {
                'logId': {
                  '$ne': null
                }
              }
            }
          ]).toArray(function(err, result) {
            if(err)
              res.status(500).send()
            else
                res.status(200).send(result)
          });
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
