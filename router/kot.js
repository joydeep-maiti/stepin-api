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
  router.get("/kot", cors(), async (req, res) => {
    try {
      findAll(dbs, collections.kot).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.get("/kot/:id", cors(), async (req, res) => {
    try {
      findOne(dbs, collections.kot, {bookingId:new ObjectID(req.params.id)}).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/kot", cors(), async (req, res) => {
    //console.log("POST /kot", req.body)
    findOne(dbs, collections.kot,{bookingId: new ObjectID(req.body.bookingId)})
    .then(result => {
      if(result){
       // console.log(result)
        res.status(400).json({msg:"kot already exist!"})
      }else{
        return findOne(dbs, collections.sequence,{name:"kot"})
      }
    })
    .then(result => {
      if(result){
        console.log(result)
         return insertOne(dbs, collections.kot,{...req.body, bookingId: new ObjectID(req.body.bookingId),kotId:"KOT"+(1000000+Number(result.seq))})
      }else{
        res.status(401).send()
      }
    })
    .then(result => {
      if(result){
        return updateOne(dbs, collections.sequence, {name:"kot"}, {$inc:{seq:1}})
      }else{
        res.status(401).send()
      }
    })
    .then(result => {
      if(result){
        res.status(201).send()
      }else{
        res.status(401).send()
      }
    })
    .catch((error)=>{
      console.log(error);
      res.status(500).send()
    })
  });

  router.patch("/kot", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /kot", req.body,body)
    try {
      updateOne(dbs, collections.kot, {_id:new ObjectID(_id)}, {$set:{kot:body.kot}}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });
})

module.exports = router;