const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne } = require("./data");
const { ObjectID} = require("mongodb");


dataBaseConnection().then(dbs => {
  router.get("/bookingsbydate", cors(), async (req, res) => {
    console.log("GET /rate", req.query)
    let dates = daysBetweenDates(req.query.fromDate, req.query.toDate)
    let dateRateObj = []
    try {
      for(const i in dates){
        const date = dates[i].toISOString()
        //console.log(dates.length)
        //console.log(date)
        findOne(dbs, collections.booking,{checkIn:{$lte: date}, checkOut:{$gte: date}})
        .then((result)=>{
            if(result)
            {
                  dateRateObj.push({
                    ...result
                  })
            }
                //console.log("dateRateObj",i,dates.length)
            if(i == dates.length-1){
                  console.log("in",i)
                  res.status(200).send(dateRateObj)
            }
            console.log(dateRateObj.length)
         });
        }}catch (error) {
        console.log(error);
      }
      // res.status(200).send()
    });
});

dataBaseConnection().then(dbs => {
  router.get("/submenu/:menu", cors(), async (req, res) => {
    console.log("GET /rate", req.query)
    let submenu=[]
    
    let menu = req.params.menu;
    try {
        findOne(dbs, collections.reporttype, {type : menu})
        .then((result)=>{
          //console.log(result)
          //console.log(result.subtypes);
            if(result)
            {
              for(const i in result.subtypes)
              {
                console.log(result.subtypes[i].active)
                if(result.subtypes[i].active == true){
                  submenu.push(
                    result.subtypes[i].subType
                  )
                }
                if(i == result.subtypes.length-1){
                res.status(200).send(submenu)
                }
            }
            }
         });
        }catch (error) {
        console.log(error);
      }
      // res.status(200).send()
    });
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
   // console.log(dates)
  
    return dates;
  }

module.exports = router;