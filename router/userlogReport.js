const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findByObj } = require("./data");
const { ObjectID } = require("mongodb");
const { updateRateByPercentage } = require("./rateMaster")

dataBaseConnection().then(dbs => {
  router.get("/report/userlog", cors(), async (req, res) => {
    console.log("GET /report/userlog", req.query)
    let user = req.query.user
    let from = req.query.fromDate
    let to = req.query.toDate
    let nulls = ["null","undefined", null, undefined]
    if(nulls.includes(user) || nulls.includes(from) || nulls.includes(to)){
      res.status(400).send()
      
    }else {
      from = from+"T00:00:00.000Z"
      to = to+"T23:59:59.999Z"
  
      try {
        if(user==="All User"){
          findByObj(dbs,collections.userlog,{$or:[{login:{$gte:from,$lte:to}}, {logout:{$gte:from,$lte:to}}]}).then(result => res.status(200).send(result));
        }else {
          findByObj(dbs,collections.userlog,{username:user, $or:[{login:{$gte:from,$lte:to}}, {logout:{$gte:from,$lte:to}}]}).then(result => res.status(200).send(result));
        }
      } catch (error) {
        console.log(error);
      }
    }

  });
});

module.exports = router;
