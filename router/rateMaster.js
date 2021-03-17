const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
//const season=require("./season");
const { findAll, findOne,findByMatch, insertOne, updateOne, deleteOne } = require("./data");
const { ObjectID } = require("mongodb");


dataBaseConnection().then(dbs => {
 
  router.get("/rateMaster", cors(), async (req,res) => {
      dbs.collection('rate').aggregate([
          {
              $lookup:
              {
                  from: "season",
                  localField: "seasonId",
                  foreignField: "_id",
                  as: "seasondetails"
             }
            },
             {
                  $unwind:{
                      path:"$seasondetails"
                    }
             }
        ]) .toArray(function(err, result) {
             res.send(result)
            })
     });

router.post("/rateMaster", cors(), async (req, res) => {
    //console.log("POST /rateMaster", req.body)
    let data=req.body;
    data.seasonId=ObjectID(req.body.seasonId);
    try {
          insertOne(dbs, collections.rate,data).then(result => res.status(201).send());
    } catch (error) {
      console.log(error);
      res.status(500).send()
    }
  });

router.patch("/rateMaster", cors(), async (req, res) => {
    let data=req.body;
  data.seasonId=ObjectID(req.body.seasonId);
  const {_id, ...body} = data
  
  console.log("PATCH /rateMaster", req.body,data)
  try {
    updateOne(dbs, collections.rate, {_id:new ObjectID(_id)}, {$set:body}).then(result => res.status(200).send());
  } catch (error) {
    console.log(error);
  }
});

router.delete("/rateMaster/:id", cors(), async (req, res) => {
  console.log("DELETE /rateMaster", req.params.id)
  try {
    deleteOne(dbs, collections.rate, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
  } catch (error) {
    console.log(error);
  }
});

});
module.exports = router;
