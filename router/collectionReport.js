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
      if(reportType == "Advance"){
        dbs.collection('advancetab').aggregate([
        {
        $lookup:
        {
        from: "billing",
        localField: "bookingId",
        foreignField: "bookingId",
        as: "details"
        }
        
        },
        {
        $match: {'advance.date': {$gte:date,$lte:date1}}
        }
        ]).toArray(function (err, data) {
          var billingreport=[]
          for (const i in data){

          for(var j=0;j<data[i].advance.length;j++)
          {
          //console.log(data[i].advance[j])
          if(parseFloat(data[i].advance[j].advanceP) > 0)
          {
              billingreport.push({
                  billNo : getBillingId(data[i].details) ? getBillingId(data[i].details) : data[i].bookingId,
                  //checkOut : data[i].checkOut,
                  advanceDate : data[i].advance[j].date ,
                  name : data[i].guestName || "",
                  //totalAmount : parseFloat(grandTotal).toFixed(2) ,
                  //totalAmount : parseFloat(data[i].totalAmount),
                  //boardingDate : "" ,
                  roomNumber : getRoomNumber(data[i]),
                  modeOfPayment : data[i].advance[j].modeofpayment,
                  receiptNumber : data[i].advance[j].reciptNumber,
                  advance : parseFloat(data[i].advance[j].advanceP)
                 
                  })
            }
          }
          }
        
        res.send(billingreport);
        
        })
      }
      // if(reportType== "Advance"){
      //   findByObj1(dbs, collections.advancetab , 
      //     {'advance.date':{$gte:date, $lte:date1}},{date:1})
      //   .then(result =>{
      //    // console.log(result)
      //     var report = getCollectionReport(result , reportType);
      //     res.send(report)
      //   // console.log(report , report.length); 
        
      //   })

      // }
      else{
      findByObj1(dbs, collections.billing , 
            {checkOut:{$gte:date, $lte:date1}},{billingDate:1})
          .then(result =>{
            var report = getCollectionReport(result , reportType);
            res.send(report)
          // console.log(report , report.length); 
          
          })
        }
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
  if(type == "Advance" ){
    for(var j=0;j<data[i].advance.length;j++)
    {
    //console.log(data[i].advance[j])
    if(parseFloat(data[i].advance[j].advanceP) > 0)
    {
        billingreport.push({
            //billNo : data[i].billingId,
            //checkOut : data[i].checkOut,
            advanceDate : data[i].advance[j].date ,
            name : data[i].guestName || "",
            //totalAmount : parseFloat(grandTotal).toFixed(2) ,
            //totalAmount : parseFloat(data[i].totalAmount),
            //boardingDate : "" ,
            roomNumber : getRoomNumber(data[i]),
            modeOfPayment : data[i].advance[j].modeofpayment,
            receiptNumber : data[i].advance[j].reciptNumber,
            advance : parseFloat(data[i].advance[j].advanceP)
           
            })
      }
    }
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
               cardType : data[i].paymentData.cardNum,
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
                   walletType: data[i].paymentData.walletType,
                    due : parseFloat(due),
                    status : data[i].paymentData.billingStatus,
                    })
                  }

  
  }console.log(billingreport.length)
  return billingreport;
 
}
 
function getRoomNumber(data){
  let roomNo=""
  for(i=0;i<data.rooms.length;i++){
    roomNo=data.rooms[i].roomNumber;
  }
  return roomNo
}

function getBillingId(data){
  let billno="";
  for(const i in data){
    console.log(data[i])
    if(data[i].billingId == "")
    billno=data[i].bookingId;
    else
    billno=data[i].billingId;
  }
  return billno;
}

module.exports = router;