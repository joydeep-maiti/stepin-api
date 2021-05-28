const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne } = require("./data");
const { ObjectID } = require("mongodb");

dataBaseConnection().then(dbs => {
  router.get("/user", cors(), async (req, res) => {
    console.log("GET /user")
    try {
      findAll(dbs, collections.user).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });

  router.post("/user", cors(), async (req, res) => {
    console.log("POST /user", req.body)
    try {
      let regex = new RegExp(["^", req.body.username, "$"].join(""), "i")
      findOne(dbs, collections.user,{username:{$regex:regex}})
      .then(result => {
        if(result){
          console.log(result)
          res.status(400).json({msg:"Username already exist!"})
        }else{
          insertOne(dbs, collections.user,req.body).then(result => {
            console.log("result",result)
            res.status(201).send()
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });

  router.patch("/user", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /user", req.body,body)
    try {
      updateOne(dbs, collections.user, {_id:new ObjectID(_id)}, {$set:body}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });

  router.delete("/user/:id", cors(), async (req, res) => {
    console.log("DELETE /user", req.params.id)
    try {
      deleteOne(dbs, collections.user, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });
});

module.exports = router;
