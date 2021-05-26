const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll,findAllAndSort, findByObj, findOne, insertOne, updateOne, deleteOne} = require("./data")
const { ObjectID } = require("mongodb");

dataBaseConnection().then(dbs => {
    router.get("/guestDetails", cors(), async (req, res) => {
        console.log("GET /guestDetails")
        try {
          findAll(dbs, collections.guestDetails).then(result => res.status(200).send(result));
        } catch (error) {
          console.log(error);
        }
      });

      router.get("/guestDetails/:id", cors(), async (req, res) => {
        try {
          findOne(dbs, collections.guestDetails, {bookingId:new ObjectID(req.params.id)}).then(result => res.status(200).send(result));
        } catch (error) {
          console.log(error);
        }
      });

  router.post("/guestDetails", cors(), async (req, res) => {
    console.log("POST /guestDetails", req.body)
    try {
      findOne(dbs, collections.guestDetails,{guestDetails:req.body.guest})
      .then(result => {
        if(result){
          console.log(result)
          res.status(400).json({msg:"tax already exist!"})
        }else{
          insertOne(dbs, collections.tax,req.body).then(result => res.status(201).send());
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send()
    }
  });
    

  router.patch("/guestDetails", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /taxSlabs", req.body,body)
    try {
      updateOne(dbs, collections.guestDetails, {_id:new ObjectID(_id)}, {$set:body}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  })

  router.delete("/guestDetails/:id", cors(), async (req, res) => {
    console.log("DELETE /taxSlabs", req.params.id)
    try {
      deleteOne(dbs, collections.guestDetails, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
