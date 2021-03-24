const express = require("express");
const cors = require("cors");
const moment = require('moment')

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
//const season=require("./season");
const { findAll, findOne,findByMatch, insertOne, updateOne, deleteOne, findByObj } = require("./data");
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
          
          //var seasonType = seasondetails.season;
          { 
            $sort : 
            { 
              "seasondetails.season" : 1,
              roomType : 1,
              planType : 1
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
      findOne(dbs, collections.rate,{ seasonId:data.seasonId, roomType:data.roomType, planType:data.planType })
      .then(result => {
        if(result){
          console.log(result)
          res.status(400).json({msg:"Rate already exist!"})
        }else{
          insertOne(dbs, collections.rate,data).then(result => res.status(201).send());
        }
      });
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

router.get("/rate", cors(), async (req, res) => {
  console.log("GET /rate", req.query)
  let dates = daysBetweenDates(req.query.fromDate, req.query.toDate)
  console.log(dates)
  const dateRateObj = []
  try {
    // dbs.collection("season").find({fromDate:{$lte:'2021-03-16T18:29:59.999+00:00'}}).toArray().then(result=>{
    //   console.log(result)
    //   res.send(result)
    // })
    // findByObj(dbs, collections.season,{fromDate:{$lte:'2021-03-16T18:29:59.999+00:00'}}).then(result=>{
    //   console.log(result)
    //   res.send(result)
    // })
    for(const i in dates){
      const date = dates[i].toISOString()
      console.log(date)
      findOne(dbs, collections.season,{fromDate:{$lte: date}, toDate:{$gte: date}})
      .then((res)=>{
        console.log(res)
        if(res){
          findByObj(dbs, collections.rate,{seasonId:ObjectID(res._id)})
          .then((result)=>{
            console.log(result)
            dateRateObj.push({
              date:date,
              rate:result.rate,
              extraRate:result.extraRate,
              roomType:result.roomType,
              planType:result.planType,
              season:res.season,
            })
            console.log(dateRateObj)
          })
        }
      })
    }
    
  } catch (error) {
    console.log(error);
  }
  res.status(200).send()
});



});

function daysBetweenDates(startDate, endDate) {
  let dates = [];
  const currDate = moment(startDate).startOf("day");
  const lastDate = moment(endDate).startOf("day");
  console.log("lastDate",currDate,lastDate)
  while (currDate.add(1, "days").diff(lastDate) < 0) {
    dates.push(currDate.clone().toDate());
  }

  dates.unshift(moment(startDate).toDate());
  // dates.push(moment(endDate).toDate());
  // console.log(dates)

  return dates;
}

module.exports = router;
