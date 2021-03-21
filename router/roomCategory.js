const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne } = require("./data");
const { ObjectID } = require("mongodb");

dataBaseConnection().then(dbs => {
  router.get("/roomcategory", cors(), async (req, res) => {
    console.log("GET /roomcategory")
    try {
      findAll(dbs, collections.roomcategory).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/roomcategory", cors(), async (req, res) => {
    console.log("POST /roomcategory", req.body)
    try {
      findOne(dbs, collections.roomcategory,{roomType:req.body.roomType})
      .then(result => {
        if(result){
          console.log(result)
          res.status(400).json({msg:"Room Type already exist!"})
        }else{
          insertOne(dbs, collections.roomcategory,req.body).then(result => {
            console.log("result",result)
            res.status(201).send()
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  router.patch("/roomcategory", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /roomcategory", req.body,body)
    try {
      updateOne(dbs, collections.roomcategory, {_id:new ObjectID(_id)}, {$set:body}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });

  router.delete("/roomcategory/:id", cors(), async (req, res) => {
    console.log("DELETE /roomcategory", req.params.id)
    try {
      deleteOne(dbs, collections.roomcategory, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
