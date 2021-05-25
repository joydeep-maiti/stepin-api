const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne,findByObj1 } = require("./data");
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
                         {$and:[
                          {"status.checkedIn": true},{"status.checkedOut":false},{"status.cancel":false}
                      ]},
                        {"rooms.roomNumber":{$eq :room1}}
                    ]
                }).then((result)=>{
                       if(result){
                        console.log(result.checkIn.slice(0,10))
                       console.log("entered if",room1)
  
                        dateReport.push({
                          roomNumber1 : room1,
                          guestName : (result.firstName +" "+result.lastName),
                          pax : (result.adults+"+"+result.children),
                          arraivalDate: result.checkIn,
                          departureDate: result.checkOut,
                          stay: noOfDaysStay(result.checkIn,result.checkOut),
                          adults: result.adults,
                          children: result.children,
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
                          adults:"",
                          children: "",
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


  dataBaseConnection().then(dbs => {
    router.get("/monthlyreport", cors(), async (req, res) => {
      console.log("GET /monthlyreport", req.query)
      let reportType=req.query.reportType;
      let dates = daysBetweenDates(req.query.fromDate, req.query.toDate)
      var monthReport = []
      var bookingIds=[];
      var rooms1=[];
      var totalRooms;
      try {
        findAll(dbs, collections.room)
        .then((ress)=>{
          //console.log(ress)
          ress.forEach(element => {
           
            rooms1.push(
              element.roomNumber
            )
          })
          totalRooms= rooms1.length
          console.log(rooms1.length)
        findAll(dbs, collections.booking)
        .then(result => {
          result.forEach(element => {
                 
            bookingIds.push(
              element._id
            )
          })
          console.log(bookingIds.length)
          for(const i in bookingIds){
            var date = dates[0].toISOString()
            var date1=dates[dates.length-1].toISOString()
            date= date.split('T')[0]+"T00:00:00.000Z"
            date1=date1.split('T')[0]+"T23:59:59.999Z"
  
            findOne(dbs,collections.booking,
              {$and :[
                {$or:[
                {$and:[
                  {checkIn: {$gte:date}},{checkIn: {$lte:date1}}
                ]},
                {$and:[
                  {checkIn:{$lte:date}},{checkOut:{$gte:date1}}
                ]},
                {$and:[
                  {checkOut: {$gte:date}},{checkOut: {$lte:date1}}
                ]}
              ]},
              {$and:[
                {"status.checkedIn": true},{"status.checkedOut":false},{"status.cancel":false}
            ]},
                {_id:ObjectID(bookingIds[i])}
              ]}
              )
            .then(ress =>{
              if(ress)
              {
                //console.log("entered")
              monthReport.push({
                ...ress
                
              })
              if(i == bookingIds.length-1){
                //dateReport.sort(roomNumber1)
                //dateReport.sort(GetSortOrder("roomNumber1"));
                console.log("month report",monthReport.length-1)
                //console.log("monthReport Data",monthReport)
                var monthlyReport= getReport(monthReport,dates,totalRooms);
                res.status(200).send(monthlyReport)
                }
             } 
             else{
              if(i == bookingIds.length-1){
                //dateReport.sort(roomNumber1)
                //dateReport.sort(GetSortOrder("roomNumber1"));
                console.log(totalRooms)
               // console.log("getting results only for checki and checkout same")
                var monthlyReport= getReport(monthReport,dates,totalRooms);
                res.status(200).send(monthlyReport)
                //res.status(200).send(monthReport)
             }
            }
            })
  
          }
  
        })
        
        //res.status(200).send(result));
      })
          
              
            } catch (error) {
          console.log(error);
        }
        // res.status(200).send()
    });
  });

  function getReport(data,dates,totalRooms){ 
    const monthlyReport=[];
    console.log(data.length-1)

    for (const i in dates){
  let todaysDate=moment(dates[i]).toDate("day").toISOString()
   let originalDate = todaysDate;
   todaysDate=todaysDate.split('T')[0];
   todaysDate=daysBetweenTime(todaysDate)
      const date1 = todaysDate[0]
      const date2 = todaysDate[1]
      let occupiedRooms=0;
      let adults=0;
      let children=0;
      // let startDay=date
      for(const j in data){
       // console.log("j=",j)
        if( ((data[j].checkOut >= date1) && (data[j].checkOut <= date2)) || ((data[j].checkIn >= date1) & (data[j].checkIn <= date2)) || ((data[j].checkIn <= originalDate) &(data[j].checkOut >= originalDate)) ){
          occupiedRooms=occupiedRooms+1;
          adults=adults+parseInt(data[j].adults);
          children=children+parseInt(data[j].children);
          }
          //console.log("datalength=",data.length)
          if(j == data.length-1){
            monthlyReport.push({
            date : date1.split('T')[0],
            TotalRooms : totalRooms, 
            OccupiedRooms : occupiedRooms,
            Adults : adults,
            Children : children,
            Pax : (adults+children),
            OccupancyPercent : Math.floor((occupiedRooms/totalRooms)*100) + "%"
         });
            /*console.log("entered")
          console.log("occupiedRooms",occupiedRooms)
          console.log("adults",adults)
          console.log("children",children)*/
        }
        
         
      }
      

    }
    return monthlyReport;


  }

  function daysBetweenTime(startDate) {
    console.log(startDate)
    let dates = [];
    const currDate = startDate+"T00:00:00.000Z";
    //console.log("currDate",currDate)
    const lastDate = startDate+"T23:59:59.999Z";
    dates.push(currDate);
    dates.push(lastDate);
    //console.log ("dates",dates)
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
    var last;
    console.log('startDate',startDate)
    console.log('endDate',endDate)
    const currDate = moment(startDate).startOf("day");
   console.log('currDate',currDate)
    const lastDate = moment(endDate).endOf("day");
    console.log("lastDate",lastDate)
    while (currDate.add(1, "days").diff(lastDate) < 0) {
      dates.push(currDate.clone().toDate());
    }
    //console.log('dates',Date.getDate())
  
    //dates.unshift(moment(startDate).toDate());
    dates.push(moment(lastDate).toDate());
    //dates.push(moment(endDate).toDate());
    //dates.push(moment(lastDate+1).toDate());
    //console.log("")
    //last.setDate(endDate.getDate() + 1);

  //console.log("kaste",last)
    console.log('dates',dates)
  
    return dates;
  }

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
module.exports = router;