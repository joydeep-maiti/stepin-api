const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne,findByObj1 } = require("./data");
const { ObjectID} = require("mongodb");


dataBaseConnection().then(dbs =>{
  router.get("/bookingreport",cors(),async(req,res)=>{
    console.log("GET /bookingreport", req.query);
    let bookingids =[]
    let report =[]
    let reportType = req.query.reportType;
    let roomnumber = req.query.roomnumber;
   

    date= req.query.fromDate+"T00:00:00.000Z"
    date1=req.query.toDate+"T23:59:59.999Z"
    
    datedup = req.query.fromDate+"T00:00:00.000Z"
    datedup1 = req.query.fromDate+"T23:59:59.999Z"
    
    console.log("dates are:",date , date1);


    try{
      if(reportType == "Monthly Booking"){
        console.log("HI")
        findByObj1(dbs, collections.booking , 
          {checkIn:{$gte:date, $lte:date1},'status.cancel':false},{checkIn:1})
        .then(result =>{
         // console.log(result)
          var report = getBookingReport(result , reportType);
          res.send(report)
        // console.log(report , report.length); 
        
        })
      }
      else if(reportType == "Daily Booking"){
        findByObj1(dbs, collections.booking , 
         
          {bookingDate:{$gte:datedup, $lte:datedup1},'status.cancel':false,},{bookingDate:1})
        .then(result =>{
          var report = getBookingReport(result , reportType);
          res.send(report)
        console.log(report , report.length); 
        
        })
        
      }
      else if(reportType == "Cancelled"){
        findByObj1(dbs, collections.booking , 
         
          {checkIn:{$gte:date, $lte:date1},'status.cancel':true,},{checkIn:1})
        .then(result =>{
          var report = getBookingReport(result , reportType);
          res.send(report)
        console.log(report , report.length); 
          
        })
        
      }
      else if(reportType == "Arrival Date"){
        console.log("hi")
        findByObj1(dbs, collections.booking , 
         
          {checkIn:{$gte:date, $lte:date1},$and:[
            {'status.checkedIn':false} , {'status.checkedOut':false},{'status.cancel':false}]},{checkIn:1})
        .then(result =>{
          var report = getBookingReport(result , reportType);
          res.send(report)
        console.log(report , report.length); 
        
        })
        
      }
      else if(reportType == "Walkin Booking"){
        console.log("hi")
        findByObj1(dbs, collections.booking , 
         
          {checkIn:{$gte:date, $lte:date1},'status.cancel':false,bookedBy:"Walk In"},{checkIn:1})
        .then(result =>{
          var report = getBookingReport(result , reportType);
          res.send(report)
        console.log(report , report.length); 
        
        })
        
      }
      else if(reportType == "Agency Booking"){
        console.log("hi")
        findByObj1(dbs, collections.booking , 
         
          {bookingDate:{$gte:date, $lte:date1},'status.cancel':false,bookedBy:"Agent"},{bookingDate:1})
        .then(result =>{
          var report = getBookingReport(result , reportType);
          res.send(report)
        console.log(report , report.length); 
        
        })
        
      }
      else if(reportType == "Member Booking"){
        console.log("hi")
        findByObj1(dbs, collections.booking , 
         
          {bookingDate:{$gte:date, $lte:date1},'status.cancel':false,bookedBy:"Member"},{bookingDate:1})
        .then(result =>{
          var report = getBookingReport(result , reportType);
          res.send(report)
        console.log(report , report.length); 
        
        })
        
      }
      else if(reportType == "HeadOffice Booking"){
        console.log("hi")
        findByObj1(dbs, collections.booking , 
         
          {bookingDate:{$gte:date, $lte:date1},'status.cancel':false,bookedBy:"Head Office"},{bookingDate:1})
        .then(result =>{
          var report = getBookingReport(result , reportType);
          res.send(report)
        console.log(report , report.length); 
        
        })
        
      }
    }
    
    catch(error){

    }
  })

})


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

function getBookingReport(data,type){
  var bookingreport=[];
  for(const i in data){

    if((type == "Monthly Booking" || type == "Daily Booking" )&& data[i].status.cancel == false)
    {
      console.log("entered",type)
      bookingreport.push({
        bookingId: data[i]._id || "",
        bookingDate: (data[i].bookingDate)|| "",
        guestName: (data[i].firstName+" "+data[i].lastName) || "",
        dateOfArrival: (data[i].checkIn) || "",
        dateOfDeparture: (data[i].checkOut)|| "",
        nights: noOfDaysStay(data[i].checkIn,data[i].checkOut) || "",
        NoofRooms: (data[i].rooms).length || "",
        bookedBy:data[i].bookedBy || "",
        referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
        Amount: data[i].roomCharges || "",
        Advance: data[i].advance 
   });
      /*console.log("entered")
    console.log("occupiedRooms",occupiedRooms)
    console.log("adults",adults)
    console.log("children",children)*/
  }
  if(type == "Arrival Date" && data[i].status.checkedIn == false && data[i].status.checkedOut == false && data[i].status.cancel == false){
    console.log("entered",type)
      bookingreport.push({
        bookingId: data[i]._id || "",
        bookingDate: (data[i].bookingDate)|| "",
        guestName: (data[i].firstName+" "+data[i].lastName) || "",
        dateOfArrival: (data[i].checkIn) || "",
        dateOfDeparture: (data[i].checkOut)|| "",
        nights: noOfDaysStay(data[i].checkIn,data[i].checkOut) || "",
        NoofRooms: (data[i].rooms).length || "",
        bookedBy:data[i].bookedBy || "",
        referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
        Amount: data[i].roomCharges || "",
        Advance: data[i].advance 
      });
  }
  if(type == "Cancelled" && data[i].status.cancel == true)
  {
    console.log(data[i].status.cancel == true)

    console.log("entered",type)
    bookingreport.push({
      bookingId: data[i]._id || "",
      bookingDate: (data[i].bookingDate).split('T')[0] || "",
      guestName: (data[i].firstName+" "+data[i].lastName) || "",
      dateOfArrival: (data[i].checkIn).split('T')[0] || "",
      dateOfDeparture: (data[i].checkOut).split('T')[0] || "",
      nights: noOfDaysStay(data[i].checkIn,data[i].checkOut) || "",
      NoofRooms: (data[i].rooms).length || "",
      bookedBy:data[i].bookedBy || "",
      referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
      Amount: data[i].roomCharges || "",
      Advance: data[i].advance 
 });
}
if(type == "Walkin Booking" && data[i].bookedBy == "Walk In" && data[i].status.cancel == false)
{
  console.log("entered",type)
  
  bookingreport.push({
    bookingId: data[i]._id || "",
    bookingDate: (data[i].bookingDate) || "",
    guestName: (data[i].firstName+" "+data[i].lastName) || "",
    dateOfArrival: (data[i].checkIn) || "",
    dateOfDeparture: (data[i].checkOut) || "",
    nights: noOfDaysStay(data[i].checkIn,data[i].checkOut) || "",
    NoofRooms: (data[i].rooms).length || "",
    bookedBy:data[i].bookedBy || "",
    referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
    Amount: data[i].roomCharges || "",
    Advance: data[i].advance 
});

}
if(type == "Agency Booking" && data[i].bookedBy == "Agent" && data[i].status.cancel == false)
{
  console.log("entered",type)
  
    bookingreport.push({
      bookingId: data[i]._id || "",
      bookingDate: (data[i].bookingDate).split('T')[0] || "",
      guestName: (data[i].firstName+" "+data[i].lastName) || "",
      dateOfArrival: (data[i].checkIn).split('T')[0] || "",
      dateOfDeparture: (data[i].checkOut).split('T')[0] || "",
      nights: noOfDaysStay(data[i].checkIn,data[i].checkOut) || "",
      NoofRooms: (data[i].rooms).length || "",
      bookedBy:data[i].bookedBy || "",
      referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
      Amount: data[i].roomCharges || "",
      Advance: data[i].advance 
 });

}
if(type == "Member Booking" && data[i].bookedBy == "Member" && data[i].status.cancel == false)
{
  console.log("entered",type)
  
    bookingreport.push({
      bookingId: data[i]._id || "",
      bookingDate: (data[i].bookingDate).split('T')[0] || "",
      guestName: (data[i].firstName+" "+data[i].lastName) || "",
      dateOfArrival: (data[i].checkIn).split('T')[0] || "",
      dateOfDeparture: (data[i].checkOut).split('T')[0] || "",
      nights: noOfDaysStay(data[i].checkIn,data[i].checkOut) || "",
      NoofRooms: (data[i].rooms).length || "",
      bookedBy:data[i].bookedBy || "",
      referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
      Amount: data[i].roomCharges || "",
      Advance: data[i].advance 
 });

}
if(type == "HeadOffice Booking" && data[i].bookedBy == "Head Office" && data[i].status.cancel == false)
{
  console.log("entered",type)
  
  bookingreport.push({
    bookingId: data[i]._id || "",
    bookingDate: (data[i].bookingDate).split('T')[0] || "",
    guestName: (data[i].firstName+" "+data[i].lastName) || "",
    dateOfArrival: (data[i].checkIn).split('T')[0] || "",
    dateOfDeparture: (data[i].checkOut).split('T')[0] || "",
    nights: noOfDaysStay(data[i].checkIn,data[i].checkOut) || "",
    NoofRooms: (data[i].rooms).length || "",
    bookedBy:data[i].bookedBy || "",
    referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
    Amount: data[i].roomCharges || "",
    Advance: data[i].advance 
});

}


  }
  return bookingreport;
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

module.exports = router;
