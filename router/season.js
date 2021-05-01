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
  router.get("/season", cors(), async (req, res) => {
    console.log("GET /season")
    try {
      findAll(dbs, collections.season).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/season", cors(), async (req, res) => {
    console.log("POST /season", req.body, req.query)

    try {
      let regex = new RegExp(["^", req.body.season, "$"].join(""), "i")
      console.log("regex",regex)
      let fromD = req.body.fromDate.split("T")[0]
      let toD = req.body.toDate.split("T")[0]
      // console.log("req.body.fromDate",fromD,toD)
      // return
      findOne(dbs, collections.season,{$or:[{season:{$regex:regex}},{fromDate:{$gte:fromD ,$lte:toD}},{toDate:{$gte:fromD, $lte:toD}},{fromDate:{$lte:fromD},toDate:{$gte:toD}}]})
      .then(result => {
        console.log("result",result)
        if(result){
          res.status(400).json({msg:"Season already exist!"})
        }else{
          const data = req.body
          data.fromDate = req.body.fromDate;
          data.toDate = req.body.toDate;
          return insertOne(dbs, collections.season,data)
        }
      })
      .then(result => {
        if(req.query.copyrate == "true"){
          console.log("result",result)
          console.log("result",result.insertedId)
          updateRateByPercentage(dbs, {seasonId:ObjectID(result.insertedId)}, 0, res)
        }else{
          res.status(201).send()
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send()
    }
  });

  router.patch("/season", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /season", body)
    try {
      const data = body
      // data.fromDate = moment(req.body.fromDate).startOf("date")._d;
      // data.toDate = moment(req.body.toDate).endOf("date")._d;
      data.fromDate = req.body.fromDate;
      data.toDate = req.body.toDate;
      updateOne(dbs, collections.season, {_id:new ObjectID(_id)}, {$set:data}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });

  router.delete("/season/:id", cors(), async (req, res) => {
    console.log("DELETE /season", req.params.id)
    if(req.params.id === "5d3edc251c9d4400006bc08e" ){
      res.status(400).json({msg:"Regular Season Can Not Be Deleted!"})
      return
    }
    try {
      deleteOne(dbs, collections.season, {_id:new ObjectID(req.params.id)})
      .then(result => {
        deleteMany(dbs, collections.rate, {seasonId:new ObjectID(req.params.id)})
      })
      .then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
