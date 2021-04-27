const express = require("express");
const cors = require("cors");
const moment = require('moment')

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
//const season=require("./season");
const { findAll, findOne,findByMatch, insertOne, updateOne, deleteOne, findByObj, upSert } = require("./data");
const { ObjectID } = require("mongodb");
const { response } = require("express");


dataBaseConnection().then(dbs => {
  
  router.get("/rateMaster/percentage", cors(), async (req, res) => {
    console.log("GET /rateMaster/percentage")

    findAll(dbs, collections.season)
    .then(result => {
      if(result){
        let promises = []
        result.forEach(el=>{
          promises.push(findOne(dbs, collections.rate, {seasonId:ObjectID(el._id)}))
        })
        return Promise.all(promises)
      }else{
        res.status(500).send();
      }
    })
    .then(result=>{
      // console.log(result)
      res.status(200).send(result)
    })
    .catch((error)=>{
      console.log(error);
      res.status(500).send()
    })
  })

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

router.patch("/rateMaster/percentage", cors(), async (req, res) => {
  let data=req.body;
  data.seasonId=ObjectID(req.body.seasonId);
  // data.seasonId=ObjectID("603b879f4de7fa001e6aeb7b");
  const {_id, ...body} = data
  
  // console.log("PATCH /rateMaster/percentage", data)

  let percent = data.percent

  findByObj(dbs, collections.rate,{seasonId:ObjectID('603b86c34de7fa001e6aeb7a')})
  .then(result=>{
    let promises = []
    result.forEach(el=>{
      let obj = {...el}
      delete obj._id;
      obj.seasonId = data.seasonId;
      obj.rate = Math.round(Number(obj.rate)+ Number(obj.rate)*(Number(percent)/100));
      obj.extraRate = Math.round(Number(obj.extraRate)+ Number(obj.rate)*(Number(percent)/100));
      obj.percent = Number(percent)
      promises.push(upSert(dbs, collections.rate, {roomType: obj.roomType, planType: obj.planType, seasonId: obj.seasonId},{$set:obj}, {upsert:true}))
    })
    return Promise.all(promises)
  })
  .then(result=>{
    res.status(200).send()
  })
  .catch((err)=>{
    console.log(err)
    res.status(500).send(err)
  })
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
  const promises = []
  try {
    for(const i in dates){
      const date = dates[i].toISOString()
      console.log(date)
      promises.push(
        new Promise((resolve,reject)=>{
          let season;
          findOne(dbs, collections.season,{fromDate:{$lte: date}, toDate:{$gte: date}})
          .then((ress)=>{
            if(ress){
              season = ress.season
              return findByObj(dbs, collections.rate,{seasonId:ObjectID(ress._id)})
            }else {
              season = "Regular"
              return findByObj(dbs, collections.rate,{seasonId:ObjectID('603b86c34de7fa001e6aeb7a')})
            }
          })
          .then((result)=>{
            let rates = []
            result.forEach(element => {
              dateRateObj.push({
                date:date,
                ...element,
                season:season,
              })
              rates.push({
                date:date,
                ...element,
                season:season,
              })
            });
            resolve(rates)
          })
          .catch((err)=>{
            reject("Rejected for "+date+" "+err)
          }) 
        })
      )  
    }
    Promise.all(promises)
    .then(result=>{
      const rates = []
      result.map(el => {
        rates.push(...el)
      })
      console.log("RESULT",rates)
      res.status(200).send(rates)
    })
    .catch(()=>{
      res.status(500).send()
    }) 
    
  } catch (error) {
    console.log(error);
  }
  // res.status(200).send()
});

// router.get("/rate", cors(), async (req, res) => {
//   console.log("GET /rate", req.query)
//   let dates = daysBetweenDates(req.query.fromDate, req.query.toDate)
//   console.log(dates)
//   const dateRateObj = []
//   try {
//     // dbs.collection("season").find({fromDate:{$lte:'2021-03-16T18:29:59.999+00:00'}}).toArray().then(result=>{
//     //   console.log(result)
//     //   res.send(result)
//     // })
//     // findByObj(dbs, collections.season,{fromDate:{$lte:'2021-03-16T18:29:59.999+00:00'}}).then(result=>{
//     //   console.log(result)
//     //   res.send(result)
//     // })
//     for(const i in dates){
//       const date = dates[i].toISOString()
//       console.log(date)
//       findOne(dbs, collections.season,{fromDate:{$lte: date}, toDate:{$gte: date}})
//       .then((ress)=>{
//         // console.log(res)
//         if(ress){
//           findByObj(dbs, collections.rate,{seasonId:ObjectID(ress._id)})
//           .then((result)=>{
//             // console.log(result)
//             result.forEach(element => {
//               dateRateObj.push({
//                 date:date,
//                 ...element,
//                 season:ress.season,
//               })
//             });
//             console.log("dateRateObj",i,dates.length)
//             if(i == dates.length-1){
//               console.log("in",i)
//               res.status(200).send(dateRateObj)
//             }
//           })
//         }else {
//           findByObj(dbs, collections.rate,{seasonId:ObjectID('603b86c34de7fa001e6aeb7a')})
//           .then((result)=>{
//             // console.log(result)
//             result.forEach(element => {
//               dateRateObj.push({
//                 date:date,
//                 ...element,
//                 season:'Regular',
//               })
//             });
//             console.log("dateRateObj",i,dates.length)
//             if(i == dates.length-1){
//               console.log("in",i)
//               res.status(200).send(dateRateObj)
//             }
//         })
//       }
//     })
//     } 
    
//   } catch (error) {
//     console.log(error);
//   }
//   // res.status(200).send()
// });



});

function daysBetweenDates(startDate, endDate) {
  let dates = [];
  const currDate = moment(startDate).startOf("day");
  //console.log(currDate)
  const lastDate = moment(endDate).startOf("day");
  //console.log("lastDate",currDate,lastDate)
  while (currDate.add(1, "days").diff(lastDate) < 0) {
    dates.push(currDate.clone().toDate());
  }

  dates.unshift(moment(startDate).toDate());
  // dates.push(moment(endDate).toDate());
  console.log(dates)

  return dates;
}

module.exports = router;
