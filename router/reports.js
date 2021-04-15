const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne } = require("./data");
const { ObjectID} = require("mongodb");


dataBaseConnection().then(dbs => {
  router.get("/dailyreport", cors(), async (req, res) => {
    console.log("GET /dailyreport", req.query)
    var todaysDate = new Date();
   todaysDate=moment(todaysDate).toDate("day").toISOString()
   date=todaysDate
   todaysDate=todaysDate.split('T')[0];
   todaysDate=daysBetweenTime(todaysDate)
    console.log(todaysDate)
  //   var date = new Date("2021-04-12T18:30:00.000Z")
  //   //d = d.split(' ')[0];
  //   date=moment(date).toDate("day").toISOString()
  //  date=date.split('T')[0];
  //  date=daysBetweenTime(date)
   
  //   console.log(date);
   const rooms1=[]
    var dateReport = []
    try {
      
      findAll(dbs, collections.room)
            .then((ress)=>{
              //console.log(ress)
              ress.forEach(element => {
               
                rooms1.push(
                  element.roomNumber
                )
              })
              rooms1.sort()
              console.log(rooms1)
              var fn=""
              for(const i in rooms1){
                //dateReport=dateReport
                  const room1 = rooms1[i];
                  
                 findOne(dbs, collections.booking,{
                  $and :[
                    {$or:[
                      {$and:[
                          {checkIn:{$gte:todaysDate[0]}},{checkIn:{$lte : todaysDate[1]}}
                      ]},
                      {$and:[
                          {checkOut:{$gte:todaysDate[0]}},{checkOut:{$lte : todaysDate[1]}}
                      ]},
                        {checkOut:{$gte:date}}
                       ]},
                    //   {$and:[
                    //     {"status.checkedIn": true},{"status.checkedOut":false}
                    // ]},
                      {"rooms.roomNumber":{$eq :room1}}
                  ]
              }).then((result)=>{
                     if(result){
                      console.log(result.checkIn.slice(0,10))
                     console.log("entered if",room1)

                      dateReport.push({
                        roomNumber1 : room1,
                        guestName : (result.firstName +" "+result.lastName),
                        pax : ("("+ result.adults+"+"+result.children+")"),
                        arraivalDate: result.checkIn,
                        departureDate: result.checkOut,
                        stay: noOfDaysStay(result.checkIn,result.checkOut),
                        planType: result.planType
                      });
                      if(i == rooms1.length-1){
                        res.status(200).send(dateReport)
                        }
                     }
                     else{
                      console.log("entered else",room1)
                      dateReport.push({
                        roomNumber1 : room1,
                        guestName : "",
                        pax : "",
                        arraivalDate: "",
                        departureDate: "",
                        stay: "",
                        planType: ""
                      
                      });
                      
                      //console.log("dateRateObj",dateReport)
                      if(i == rooms1.length-1){
                        //dateReport.sort(roomNumber1)
                        dateReport.sort(GetSortOrder("roomNumber1"));
                        res.status(200).send(dateReport)
                        }
                     } 

                    })
                    //console.log("dateRateObj",dateReport)
                  }
                  
            });
          } catch (error) {
        console.log(error);
      }
      // res.status(200).send()
    });
});

function GetSortOrder(prop) {    
  return function(a, b) {    
      if (a[prop] > b[prop]) {    
          return 1;    
      } else if (a[prop] < b[prop]) {    
          return -1;    
      }    
      return 0;    
  } 
}   


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

function daysBetweenTime(startDate) {
  let dates = [];
  const currDate = startDate+"T00:00:00.000Z";
  //console.log("currDate",currDate)
  const lastDate = startDate+"T23:59:59.999Z";
  dates.push(currDate);
  dates.push(lastDate);
  console.log ("dates",dates)
  return dates;
}

  function noOfDaysStay(startDate, endDate) {
    let dates = [];
    const currDate = moment(startDate).startOf("day");
    
    const lastDate = moment(endDate).startOf("day");
    //console.log("lastDate",currDate,lastDate)
    while (currDate.add(1, "days").diff(lastDate) < 0) {
      dates.push(currDate.clone().toDate());
    }
  
    dates.unshift(moment(startDate).toDate());
    // dates.push(moment(endDate).toDate());
   console.log("No of days",dates.length)
  
    return dates.length;
  }
let total = 0;
  function totalPax(adults,children){
     total = total + adults + children
     return total;

  }

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
   console.log("No of days",dates.length)
  
    return dates.length;
  }


module.exports = router;