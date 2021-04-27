const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const ObjectID = require("mongodb").ObjectID;


const {
  findAll,
  findOne,
  insertOne,
  updateOne,
} = require("./data");

dataBaseConnection().then(dbs => {
  router.get("/advance", cors(), async (req, res) => {
      console.log('/advance')
    try {
      findAll(dbs, collections.advancetab).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.get("/advance/:id", cors(), async (req, res) => {
    try {
      findOne(dbs, collections.advancetab, {bookingId:new ObjectID(req.params.id)}).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/advance", cors(), async (req, res) => {
    console.log("POST/advance", req.body)
    findOne(dbs, collections.advancetab,{bookingId: new ObjectID(req.body.bookingId)})
    .then(result => {
      console.log("Block1")
      if(result){
        console.log(result)
        res.status(400).json({msg:"Advance already exist!"})
      }else{
        return findOne(dbs, collections.sequence,{name:"advance"})
      }
    })
    .then(result => {
      console.log("Block2")

      if(result){
        return insertOne(dbs, collections.advancetab,{...req.body, bookingId: new ObjectID(req.body.bookingId), advanceId:"ADVANCE"+(1000000+Number(result.seq))})
      }else{
        res.status(401).send()
      }
    })
    .then(result => {
      console.log("Block3")
      if(result){
        return updateOne(dbs, collections.sequence, {name:"advance"}, {$inc:{seq:1}})
      }else{
        res.status(401).send()
      }
    })
    .then(result => {
      console.log("Block4",result)
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

  router.patch("/advance", async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /advance", req.body,body)
    try {
      updateOne(dbs, collections.advancetab, {_id:new ObjectID(_id)}, {$set:{advance:body.advance}}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });
})

module.exports = router;