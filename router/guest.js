const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne,} = require("./data");
const { ObjectID} = require("mongodb");

dataBaseConnection().then(dbs=>{
    router.get("/guestReport",cors(),async(req,res)=>{
        console.log("GET /posreport", req.query);
        let bookingids =[]
        let report =[]
        let reportType = req.query.reportType;
        let dates = daysBetweenDates(req.query.fromDate, req.query.toDate)
        var date = dates[0].toISOString()
        var date1=dates[dates.length-1].toISOString()
        date= date.split('T')[0]+"T00:00:00.000Z"
        date1=date1.split('T')[0]+"T23:59:59.999Z"
       
        
        console.log(date , date1);

        try{

            findAll(dbs, collections.booking)
            .then(result =>{
                result.forEach(element =>{
                    bookingids.push(element._id);
                })
            console.log(bookingids.length); 
            for(const i in bookingids){
              if(reportType === "Guest"){
                findOne(dbs,collections.booking,
                  {$and:[
                    {$and:[
                      {checkIn: {$gte:date}},{checkOut: {$lte:date1}},
                    ]},
                    {_id:ObjectID(bookingids[i])}
                    
                  ]}
                  ).
                  then(ress =>{
                    if(ress)
                    {
                    report.push({
                      ...ress
                    }) 
                    if(i == bookingids.length-1){
                      console.log("Hello")
                      console.log(report.length)
                    var guestReport= getGuestReport(report,reportType);
                      res.status(200).send(guestReport);
                     // console.log("Details:",guestReport,nationality)
                    
                    }
                    
                    }else{
                      if(i == bookingids.length-1){
                        console.log("Hello")
                        console.log(report.length)
                      var guestReport= getGuestReport(report,reportType);
                        res.status(200).send(guestReport);
                       // console.log("Details:",guestReport,nationality)
                      
                      }
                    }
                    //res.send(result);
                  })
              
                }
                 if (reportType === "Foreign Guest"){
                  // console.log("Hello")
                  findOne(dbs,collections.booking,
                    {$and:[
                      {$and:[
                        {checkIn: {$gte:date}},{checkOut: {$lte:date1}},
                      ]},
                      {_id:ObjectID(bookingids[i])}
                      
                    ]}
                    ).
                    then(ress =>{
                      if(ress)
                      {
                      report.push({
                        ...ress
                      }) 
                      if(i == bookingids.length-1){
                        console.log("others")
                      var guestReport= getGuestReport(report,reportType);
                      console.log(guestReport);
                        res.status(200).send(guestReport);
                       // console.log("Details:",guestReport,nationality)
                      
                      }
                      }else{
                        if(i == bookingids.length-1){
                          console.log("Hello")
                          console.log(report.length)
                        var guestReport= getGuestReport(report,reportType);
                          res.status(200).send(guestReport);
                         // console.log("Details:",guestReport,nationality)
                        
                        }
                      }
                      //res.send(result);
                    })
                

                 }
            }
            })
           
        }catch(error){

        }
    })
})

function getGuestReport(data,type){
  var guestreport =[]
  //console.log(data)
  for(const i in data){
    if(type == "Guest" && data[i].nationality === "Indian"){
      console.log("Guest Type",type);
        guestreport.push({
        checkIn: (data[i].checkIn) || "",
        checkOut: (data[i].checkOut) || "",
        guestName: (data[i].firstName+" "+data[i].lastName) || "",
        nationality:(data[i].nationality) || "",
        NoofRooms: (data[i].rooms).length || "",
        bookedBy:data[i].bookedBy || "",
        referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
        Amount: data[i].roomCharges || "",
        Advance: data[i].advance || "",
        Balance:(data[i].roomCharges)-(data[i].advance)
       
   });
    }
  
    if(type == "Foreign Guest" && (data[i].nationality === "British"  || data[i].nationality === "American" || data[i].nationality === "Australian" || data[i].nationality === "Japan" || data[i].nationality === "Saudi Arab" || data[i].nationality === "UAE" || data[i].nationality === "Africa" || data[i].nationality === "French") ){
      console.log("Guest Type",type);
        guestreport.push({
        checkIn: (data[i].checkIn) || "",
        checkOut: (data[i].checkOut) || "",
        checkOut: (data[i].checkOut).split('T')[0],
        guestName: (data[i].firstName+" "+data[i].lastName) || "",
        nationality:(data[i].nationality) || "",
        PassportNumber:(data[i].Idproof)||"",
        NoofRooms: (data[i].rooms).length || "",
        bookedBy:data[i].bookedBy || "",
        referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
        Amount: data[i].roomCharges || "",
        Advance: data[i].advance || "",
        Balance:(data[i].roomCharges)-(data[i].advance)
       
   });
    }
  
  }
 
  //console.log(guestreport)
  return guestreport;``
}

function daysBetweenDates(startDate, endDate) {
    let dates = [];
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

module.exports = router;

