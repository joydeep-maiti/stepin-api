const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne } = require("./data");
const { ObjectID } = require("mongodb");

dataBaseConnection().then(dbs => {
  router.get("/season", cors(), async (req, res) => {
    console.log("GET /season")
    try {
      findAll(dbs, collections.season).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/season", cors(), async (req, res) => {
    console.log("POST /season", req.body)
    try {
      findOne(dbs, collections.season,{season:req.body.season})
      .then(result => {
        if(result){
          console.log(result)
          res.status(400).send({msg:"Season already exist!"})
        }else{
          insertOne(dbs, collections.season,req.body).then(result => res.status(201).send());
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  router.patch("/season", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /season", req.body,body)
    try {
      updateOne(dbs, collections.season, {_id:new ObjectID(_id)}, {$set:body}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });

  router.delete("/season/:id", cors(), async (req, res) => {
    console.log("DELETE /season", req.params.id)
    try {
      deleteOne(dbs, collections.season, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
