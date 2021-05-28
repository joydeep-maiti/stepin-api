const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne,upSert } = require("./data");
const { ObjectID } = require("mongodb");

dataBaseConnection().then(dbs => {
  router.get("/access", cors(), async (req, res) => {
    console.log("GET /access")
    let { role, department} = req.query
    let nulls = ["null","undefined", null, undefined]
    if(nulls.includes(role) || nulls.includes(department)){
      res.status(400).send()
    }else{
      try {
        findOne(dbs, collections.access, {role,department}).then(result => res.status(200).send(result));
      } catch (error) {
        console.log(error);
        res.status(500).send(result)
      }
    }
  });

  // router.post("/access", cors(), async (req, res) => {
  //   console.log("POST /access", req.body)
  //   try {
  //     let regex = new RegExp(["^", req.body.username, "$"].join(""), "i")
  //     findOne(dbs, collections.user,{username:{$regex:regex}})
  //     .then(result => {
  //       if(result){
  //         console.log(result)
  //         res.status(400).json({msg:"Username already exist!"})
  //       }else{
  //         insertOne(dbs, collections.user,req.body).then(result => {
  //           console.log("result",result)
  //           res.status(201).send()
  //         });
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

  router.post("/access", cors(), async (req, res) => {
    console.log("PATCH /access", req.body)
    try {
      upSert(dbs, collections.access, { role: req.body.role, department: req.body.department}, { $set: {permissions:req.body.permissions||[]} }, { upsert: true })
      .then(result => res.status(200).send())
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });

  // router.delete("/user/:id", cors(), async (req, res) => {
  //   console.log("DELETE /user", req.params.id)
  //   try {
  //     deleteOne(dbs, collections.user, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });
});

module.exports = router;
