const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, findByObj1 } = require("./data");
const { ObjectID} = require("mongodb");


dataBaseConnection().then(dbs =>{
  router.get("/collectionReport", cors(), async (req, res) =>{
    console.log("GET /collectionReport", req.query)
    let reportType=req.query.reportType;
    let date= req.query.fromDate+"T00:00:00.000Z"
    let date1=req.query.toDate+"T23:59:59.999Z"

    try{
      findByObj1(dbs, collections.billing , 
            {checkOut:{$gte:date, $lte:date1}},{billingDate:1})
          .then(result =>{
            var report = getCollectionReport(result , reportType);
            res.send(report)
          // console.log(report , report.length); 
          
          })
      // if(reportType == "Total Collection"){
      //   findByObj1(dbs, collections.billing , 
      //     {checkOut:{$gte:date, $lte:date1}},{billingDate:1})
      //   .then(result =>{
      //     var report = getCollectionReport(result , reportType);
      //     res.send(report)
      //   // console.log(report , report.length); 
        
      //   })
      // }
      // else if(reportType == "Advance"){
      //   findByObj1(dbs, collections.billing , 
         
      //     {checkOut:{$gte:date, $lte:date1},advance : {$gte:1}},{billingDate:1})
      //   .then(result =>{
      //     console.log(result)
      //     var report = getCollectionReport(result , reportType);
      //     res.send(report)
      //   console.log( report.length); 
        
      //   })
        
      // }
      // else if(reportType == "Cash"){
      //   findByObj1(dbs, collections.billing , 
         
      //     {checkOut:{$gte:date, $lte:date1},'paymentData.cash':{$gte:1}},{billingDate:1})
      //   .then(result =>{
      //     console.log(result)
      //     var report = getCollectionReport(result , reportType);
      //     res.send(report)
      //   console.log( report.length); 
        
      //   })
        
      // }

      // else if(reportType == "Card"){
      //   findByObj1(dbs, collections.billing , 
         
      //     {checkOut:{$gte:date, $lte:date1},'paymentData.card':{$gte:1}},{billingDate:1})
      //   .then(result =>{
      //     console.log(result)
      //     var report = getCollectionReport(result , reportType);
      //     res.send(report)
      //   console.log( report.length); 
        
      //   })
        
      // }

      // else if(reportType == "UPI"){
      //   findByObj1(dbs, collections.billing , 
         
      //     {checkOut:{$gte:date, $lte:date1},'paymentData.wallet':{$gte:1}},{billingDate:1})
      //   .then(result =>{
      //     console.log(result)
      //     var report = getCollectionReport(result , reportType);
      //     res.send(report)
      //   console.log( report.length); 
        
      //   })
        
      // }

    }
    catch(error){

    }
  })
})

function getCollectionReport(data , type){
  var billingreport = [];
  for (const i in data){
    if(type == "Total Collection"){
      grandTotal = parseFloat(data[i].paymentData.totalRoomCharges || 0.00)+ parseFloat(data[i].paymentData.posTotal || 0.00) 
      due=parseFloat(grandTotal-(parseFloat(data[i].advance || 0.00) + parseFloat(data[i].paymentData.cash || 0.00) + parseFloat(data[i].paymentData.card || 0.00) + (data[i].paymentData.cheque || 0.00) + parseFloat(data[i].paymentData.wallet || 0.00) ));
      due = due.toFixed(2)  
      console.log(due)
      //if(due < 1) due=0.00;
      //console.log(data[i].paymentData.cash)
        billingreport.push({
          billNo : data[i].billingId,
          //checkOut : data[i].checkOut,
          billingDate : data[i].checkOut.split('T')[0],
          name : data[i].guestName || "",
          totalAmount : parseFloat(grandTotal).toFixed(2) ,
          //totalAmount : parseFloat(data[i].totalAmount),
          //boardingDate : "" ,
          discount : parseFloat(data[i].discount || 0.00),
          grandTotal : grandTotal.toFixed(2),
          advance : parseFloat(data[i].advance || 0.00),
          cash : parseFloat(data[i].paymentData.cash || 0.00 ),
          card : parseFloat(data[i].paymentData.card || 0.00),
          //cheque : parseFloat(data[i].paymentData.cheque || 0.00),
          wallet : parseFloat(data[i].paymentData.wallet || 0.00),
          due : parseFloat(due),
          status : data[i].paymentData.billingStatus,
          })
  }
  if(type == "Advance" &&  parseFloat(data[i].advance) > 0){
    grandTotal = parseFloat(data[i].paymentData.totalRoomCharges || 0.00)+ parseFloat(data[i].paymentData.posTotal || 0.00)
    due=parseFloat(grandTotal-(parseFloat(data[i].advance || 0.00) + parseFloat(data[i].paymentData.cash || 0.00) + parseFloat(data[i].paymentData.card || 0.00) + (data[i].paymentData.cheque || 0.00) + parseFloat(data[i].paymentData.wallet || 0.00) ));
    due = due.toFixed(2)  
    console.log(due)
        billingreport.push({
            billNo : data[i].billingId,
            //checkOut : data[i].checkOut,
            billingDate : data[i].checkOut.split('T')[0],
            name : data[i].guestName || "",
            totalAmount : parseFloat(grandTotal).toFixed(2) ,
            //totalAmount : parseFloat(data[i].totalAmount),
            //boardingDate : "" ,
            discount : parseFloat(data[i].discount || 0.00),
            grandTotal : grandTotal.toFixed(2),
            advance : parseFloat(data[i].advance || 0.00),
           // cash : parseFloat(data[i].paymentData.cash || 0.00 ),
           // card : parseFloat(data[i].paymentData.card || 0.00),
            //cheque : parseFloat(data[i].paymentData.cheque || 0.00),
            //wallet : parseFloat(data[i].paymentData.wallet || 0.00),
            due : parseFloat(due),
            status : data[i].paymentData.billingStatus,
            })
      }
      if(type == "Cash" && parseFloat(data[i].paymentData.cash )> 0){
 
        grandTotal = parseFloat(data[i].paymentData.totalRoomCharges || 0.00)+ parseFloat(data[i].paymentData.posTotal || 0.00)
        due=parseFloat(grandTotal-(parseFloat(data[i].advance || 0.00) + parseFloat(data[i].paymentData.cash || 0.00) + parseFloat(data[i].paymentData.card || 0.00) + (data[i].paymentData.cheque || 0.00) + parseFloat(data[i].paymentData.wallet || 0.00) ));
        due = due.toFixed(2)  
        console.log(due)
          //if(due < 1) due=0.00;
          //console.log(data[i].paymentData.cash)
          billingreport.push({
            billNo : data[i].billingId,
            //checkOut : data[i].checkOut,
            billingDate : data[i].checkOut.split('T')[0],
            name : data[i].guestName || "",
            totalAmount : parseFloat(grandTotal).toFixed(2) ,
            //totalAmount : parseFloat(data[i].totalAmount),
            //boardingDate : "" ,
            discount : parseFloat(data[i].discount || 0.00),
            grandTotal : grandTotal.toFixed(2),
           // advance : parseFloat(data[i].advance || 0.00),
            cash : parseFloat(data[i].paymentData.cash || 0.00 ),
           // card : parseFloat(data[i].paymentData.card || 0.00),
           // cheque : parseFloat(data[i].paymentData.cheque || 0.00),
           // wallet : parseFloat(data[i].paymentData.wallet || 0.00),
            due : parseFloat(due),
            status : data[i].paymentData.billingStatus,
            })
          }

          if(type == "Card" && parseFloat(data[i].paymentData.card) > 0){
 
            grandTotal = parseFloat(data[i].paymentData.totalRoomCharges || 0.00)+ parseFloat(data[i].paymentData.posTotal || 0.00)
            due=parseFloat(grandTotal-(parseFloat(data[i].advance || 0.00) + parseFloat(data[i].paymentData.cash || 0.00) + parseFloat(data[i].paymentData.card || 0.00) + (data[i].paymentData.cheque || 0.00) + parseFloat(data[i].paymentData.wallet || 0.00) ));
            due = due.toFixed(2)  
            console.log(due)
              //if(due < 1) due=0.00;
              //console.log(data[i].paymentData.cash)
              billingreport.push({
                billNo : data[i].billingId,
                //checkOut : data[i].checkOut,
                billingDate : data[i].checkOut.split('T')[0],
                name : data[i].guestName || "",
                totalAmount : parseFloat(grandTotal).toFixed(2) ,
                //totalAmount : parseFloat(data[i].totalAmount),
                //boardingDate : "" ,
                discount : parseFloat(data[i].discount || 0.00),
                grandTotal : grandTotal.toFixed(2),
               // advance : parseFloat(data[i].advance || 0.00),
               // cash : parseFloat(data[i].paymentData.cash || 0.00 ),
               card : parseFloat(data[i].paymentData.card || 0.00),
               // cheque : parseFloat(data[i].paymentData.cheque || 0.00),
                //wallet : parseFloat(data[i].paymentData.wallet || 0.00),
                due : parseFloat(due),
                status : data[i].paymentData.billingStatus,
                })
              }

              if(type == "UPI" && parseFloat(data[i].paymentData.wallet )> 0){
 
                grandTotal = parseFloat(data[i].paymentData.totalRoomCharges || 0.00)+ parseFloat(data[i].paymentData.posTotal || 0.00)
                due=parseFloat(grandTotal-(parseFloat(data[i].advance || 0.00) + parseFloat(data[i].paymentData.cash || 0.00) + parseFloat(data[i].paymentData.card || 0.00) + (data[i].paymentData.cheque || 0.00) + parseFloat(data[i].paymentData.wallet || 0.00) ));
                due = due.toFixed(2)  
                console.log(due)
                  //if(due < 1) due=0.00;
                  //console.log(data[i].paymentData.cash)
                  billingreport.push({
                    billNo : data[i].billingId,
                    //checkOut : data[i].checkOut,
                    billingDate : data[i].checkOut.split('T')[0],
                    name : data[i].guestName || "",
                    totalAmount : parseFloat(grandTotal).toFixed(2) ,
                    //totalAmount : parseFloat(data[i].totalAmount),
                    //boardingDate : "" ,
                    discount : parseFloat(data[i].discount || 0.00),
                    grandTotal : grandTotal.toFixed(2),
                   // advance : parseFloat(data[i].advance || 0.00),
                   // cash : parseFloat(data[i].paymentData.cash || 0.00 ),
                   //card : parseFloat(data[i].paymentData.card || 0.00),
                   // cheque : parseFloat(data[i].paymentData.cheque || 0.00),
                   wallet : parseFloat(data[i].paymentData.wallet || 0.00),
                    due : parseFloat(due),
                    status : data[i].paymentData.billingStatus,
                    })
                  }

  
  }console.log(billingreport.length)
  return billingreport;
 
}



module.exports = router;