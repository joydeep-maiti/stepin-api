const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, findByObj1 } = require("./data");
const { ObjectID} = require("mongodb");

dataBaseConnection().then(dbs =>{
router.get("/taxcollection",cors(), async(req , res) =>{
    console.log("GET /taxcollection", req.query)
    let reportType=req.query.reportType;
    let date= req.query.fromDate+"T00:00:00.000Z"
    let date1=req.query.toDate+"T23:59:59.999Z"

    try{
        if(reportType == "Tax Collection"){
            findByObj1(dbs, collections.billing , 
                {checkOut:{$gte:date, $lte:date1}},{billingDate:1})
              .then(result =>{
                var report = getTaxReport(result , reportType);
                res.send(report)
              // console.log(report , report.length); 
              
              })
        }

    }catch(error){

    }
})
})
function getTaxReport(data , type){
    var billingreport = [];
  for (const i in data){
      if(type == "Tax Collection"){
        billingreport.push({
            billNo : data[i].billingId,
            //checkOut : data[i].checkOut,
            name : data[i].guestName || "",
            billingDate : data[i].checkOut.split('T')[0],
            roomrate : parseFloat(data[i].roomCharges) ,
            tax : parseFloat(data[i].paymentData.tax || 0.00 )
        })
      }
  }
  return billingreport;
}

module.exports = router;