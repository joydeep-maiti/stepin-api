const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll,findAllAndSort, findByObj, findOne, insertOne, updateOne, deleteOne} = require("./data")
const { ObjectID } = require("mongodb");

dataBaseConnection().then(dbs => {
  router.get("/taxSlabs", cors(), async (req, res) => {
    let type = req.query.type
    try {
      switch(type){
        case "GST": findByObj(dbs, collections.tax, {type:'GST'}).then(result => res.send(result));
                    break;
        case "CITY": findByObj(dbs, collections.tax, {type:'CITY'}).then(result => res.send(result));
                      break;
        default : findAllAndSort(dbs, collections.tax, { type: -1 }).then(result => res.send(result));
                      break;
      }
    } catch (error) {
      console.log(error);
    }
  });
  router.post("/taxSlabs", cors(), async (req, res) => {
    console.log("POST /taxSlabs", req.body)
    try {
      findOne(dbs, collections.tax,{tax:req.body.tax})
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
    

  router.patch("/taxSlabs", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /taxSlabs", req.body,body)
    try {
      updateOne(dbs, collections.tax, {_id:new ObjectID(_id)}, {$set:body}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  })

  router.delete("/taxSlabs/:id", cors(), async (req, res) => {
    console.log("DELETE /taxSlabs", req.params.id)
    try {
      deleteOne(dbs, collections.tax, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
