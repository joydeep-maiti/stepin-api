const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, findByObj1 } = require("./data");
const { ObjectID} = require("mongodb");


dataBaseConnection().then(dbs =>{
  router.get("/billingReport", cors(), async (req, res) =>{
    console.log("GET /billingReport", req.query)
    let reportType=req.query.reportType;
    let date= req.query.fromDate+"T00:00:00.000Z"
    let date1=req.query.toDate+"T23:59:59.999Z"

    try{
      if(reportType == "Billing Summary"){
        findByObj1(dbs, collections.billing , 
          {checkOut:{$gte:date, $lte:date1}},{billingDate:1})
        .then(result =>{
          var report = getBillingReport(result , reportType);
          res.send(report)
        // console.log(report , report.length); 
        
        })
      }
      else if(reportType == "Due"){
        findByObj1(dbs, collections.billing , 
         
          {checkOut:{$gte:date, $lte:date1},'paymentData.billingStatus':'Due'},{billingDate:1})
        .then(result =>{
          console.log(result)
          var report = getBillingReport(result , reportType);
          res.send(report)
        console.log( report.length); 
        
        })
        
      }
      else if(reportType == "Paid"){
        findByObj1(dbs, collections.billing , 
         
          {checkOut:{$gte:date, $lte:date1},'paymentData.billingStatus':'Paid'},{billingDate:1})
        .then(result =>{
          console.log(result)
          var report = getBillingReport(result , reportType);
          res.send(report)
        console.log( report.length); 
        
        })
        
      }

      else if(reportType == "Bill to Company"){
        findByObj1(dbs, collections.billing , 
         
          {checkOut:{$gte:date, $lte:date1},'paymentData.billingStatus':'Bill to Company'},{billingDate:1})
        .then(result =>{
          console.log(result)
          var report = getBillingReport(result , reportType);
          res.send(report)
        console.log( report.length); 
        
        })
        
      }

    }
    catch(error){

    }
  })
})

function getBillingReport(data , type){
  var billingreport = [];
  for (const i in data){
    if(type == "Billing Summary"){
      grandTotal = parseFloat(data[i].paymentData.totalRoomCharges || 0.00)+ parseFloat(data[i].paymentData.posTotal || 0.00)
      due=parseFloat(grandTotal-(parseFloat(data[i].advance || 0.00) + parseFloat(data[i].paymentData.cash || 0.00) + parseFloat(data[i].paymentData.card || 0.00) + (data[i].paymentData.cheque || 0.00) + parseFloat(data[i].paymentData.wallet || 0.00) ));
      due = due.toFixed(2)  
      console.log(due)
      //if(due < 1) due=0.00;
      //console.log(data[i].paymentData.cash)
        billingreport.push({
          billNo : data[i].billingId,
          //checkOut : data[i].checkOut,
          name : data[i].guestName || "",
          billingDate : data[i].checkOut.split('T')[0],
          roomrate : parseFloat(data[i].roomCharges) ,
          //totalAmount : parseFloat(data[i].totalAmount),
          boardingDate : "" ,
          //discount : parseFloat(data[i].discount || 0.00),
           // cash : parseFloat(data[i].paymentData.cash || 0.00 ),
          // card : parseFloat(data[i].paymentData.card || 0.00),
          // cheque : parseFloat(data[i].paymentData.cheque || 0.00),
          // wallet : parseFloat(data[i].paymentData.wallet || 0.00),
         tax : parseFloat(data[i].paymentData.tax || 0.00 ),
         food : getPos(data[i],"Food") ||  "",
         transport : getPos(data[i],"Transport") || "",
          laundary : getPos(data[i],"Laundary") || "",
         misc : getPos(data[i],"Others") || "",
          phone : "",
         // grandTotal : (grandtotal = grandTotal + (getPos(data[i],"Food") || 0) + (getPos(data[i],"Transport") || 0) + (getPos(data[i],"Laundary") || 0) + (getPos(data[i],"Others") || 0) + (getPos(data[i],"Agent") || 0)),
          grandTotal : grandTotal,
         advance : parseFloat(data[i].advance || 0.00),
          Balance : parseFloat(due),
          //status : data[i].paymentData.billingStatus,
          })
  }
  if(type == "Due" && data[i].paymentData.billingStatus == "Due"){
    grandTotal = parseFloat(data[i].paymentData.totalRoomCharges || 0.00)+ parseFloat(data[i].paymentData.posTotal || 0.00)
    due=parseFloat(grandTotal-(parseFloat(data[i].advance || 0.00) + parseFloat(data[i].paymentData.cash || 0.00) + parseFloat(data[i].paymentData.card || 0.00) + (data[i].paymentData.cheque || 0.00) + parseFloat(data[i].paymentData.wallet || 0.00) ));
    due = due.toFixed(2)  
    console.log(due)
      billingreport.push({
        billNo : data[i].billingId,
        name : data[i].guestName || "",
        billingDate : data[i].checkOut.split('T')[0],
        roomrate : parseFloat(data[i].roomCharges) ,
        boardingDate : "" ,
       tax : parseFloat(data[i].paymentData.tax || 0.00 ),
       food : getPos(data[i],"Food") || "",
        transport : getPos(data[i],"Transport") || "",
        laundary : getPos(data[i],"Laundary") || "",
        misc : getPos(data[i],"Others") || "",
        phone : "",
        grandTotal : grandTotal,
        advance : parseFloat(data[i].advance || 0.00),
        Balance : parseFloat(due),
        //status : data[i].paymentData.billingStatus,
        })
      }
      if(type == "Paid" && data[i].paymentData.billingStatus == "Paid"){
 
        grandTotal = parseFloat(data[i].paymentData.totalRoomCharges || 0.00)+ parseFloat(data[i].paymentData.posTotal || 0.00)
        due=parseFloat(grandTotal-(parseFloat(data[i].advance || 0.00) + parseFloat(data[i].paymentData.cash || 0.00) + parseFloat(data[i].paymentData.card || 0.00) + (data[i].paymentData.cheque || 0.00) + parseFloat(data[i].paymentData.wallet || 0.00) ));
        due = due.toFixed(2)  
        console.log(due)
          //if(due < 1) due=0.00;
          //console.log(data[i].paymentData.cash)
          billingreport.push({
            billNo : data[i].billingId,
            name : data[i].guestName || "",
            billingDate : data[i].checkOut.split('T')[0],
            roomrate : parseFloat(data[i].roomCharges) ,
            //totalAmount : parseFloat(data[i].totalAmount),
            boardingDate : "" ,
           tax : parseFloat(data[i].paymentData.tax || 0.00 ),
           food : getPos(data[i],"Food") || "",
            transport : getPos(data[i],"Transport") || "",
            laundary : getPos(data[i],"Laundary") || "",
            misc : getPos(data[i],"Others") || "",
            phone : "",
            grandTotal : grandTotal ,
            advance : parseFloat(data[i].advance || 0.00),
            Balance : parseFloat(due),
            //status : data[i].paymentData.billingStatus,
            })
          }

          if(type == "Bill to Company" && data[i].paymentData.billingStatus == "Bill to Company"){
            grandTotal = parseFloat(data[i].paymentData.totalRoomCharges || 0.00)+ parseFloat(data[i].paymentData.posTotal || 0.00)
            due=parseFloat(grandTotal-(parseFloat(data[i].advance || 0.00) + parseFloat(data[i].paymentData.cash || 0.00) + parseFloat(data[i].paymentData.card || 0.00) + (data[i].paymentData.cheque || 0.00) + parseFloat(data[i].paymentData.wallet || 0.00) ));
            due = due.toFixed(2)  
            console.log(due)
              billingreport.push({
                billNo : data[i].billingId,
                name : data[i].guestName || "",
                billingDate : data[i].checkOut.split('T')[0],
                roomrate : parseFloat(data[i].roomCharges) ,
                boardingDate : "" ,
               tax : parseFloat(data[i].paymentData.tax || 0.00 ),
               food : getPos(data[i],"Food") || "",
                transport : getPos(data[i],"Transport") || "",
                laundary : getPos(data[i],"Laundary") || "",
                misc : getPos(data[i],"Others") || "",
                phone : "",
                grandTotal : grandTotal,
                advance : parseFloat(data[i].advance || 0.00),
                Balance : parseFloat(due),
                //status : data[i].paymentData.billingStatus,
                })
              }

  
  }console.log(billingreport.length)
  return billingreport;
 
}

function getPos(data,type){

  if ( data.posData == null)
    return "";
  
    else{
      let amount=0;
      if(type == "Food" && data.posData.pos.Food){
       
        for(var j=0;j<data.posData.pos.Food.length;j++)
            {
            console.log("j=",j,data.posData.pos.Food.length)
            console.log(data.posData.pos.Food[j].amount)
            amount=amount+ parseFloat(data.posData.pos.Food[j].amount)
            console.log ("amount",amount);
           
            if (j == data.posData.pos.Food.length-1){
              console .log("entered",amount)
              return amount
            }
          }
        }
  
          if(type == "Transport" && data.posData.pos.Transport){
       
            for(var j=0;j<data.posData.pos.Transport.length;j++)
                {
                console.log("j=",j,data.posData.pos.Transport.length)
                console.log(data.posData.pos.Transport[j].amount)
                amount=amount+ parseFloat(data.posData.pos.Transport[j].amount)
                console.log ("amount",amount);
               
                if (j == data.posData.pos.Transport.length-1){
                  console .log("entered",amount)
                  return amount
                }
              }
            }
  
            if(type == "Laundary" && data.posData.pos.Laundary){
       
              for(var j=0;j<data.posData.pos.Laundary.length;j++)
                  {
                  console.log("j=",j,data.posData.pos.Laundary.length)
                  console.log(data.posData.pos.Laundary[j].amount)
                  amount=amount+ parseFloat(data.posData.pos.Laundary[j].amount)
                  console.log ("amount",amount);
                 
                  if (j == data.posData.pos.Laundary.length-1){
                    console .log("entered",amount)
                    return amount
                  }
                }
              }
  
              if(type == "Others" && data.posData.pos.Others){
       
                for(var j=0;j<data.posData.pos.Others.length;j++)
                    {
                    console.log("j=",j,data.posData.pos.Others.length)
                    console.log(data.posData.pos.Others[j].amount)
                    amount=amount+ parseFloat(data.posData.pos.Others[j].amount)
                    console.log ("amount",amount);
                   
                    if (j == data.posData.pos.Others.length-1){
                      console .log("entered",amount)
                      return amount
                    }
                  }
                }
  
                if(type == "Agent" && data.posData.pos.Agent){
       
                  for(var j=0;j<data.posData.pos.Agent.length;j++)
                      {
                      console.log("j=",j,data.posData.pos.Agent.length)
                      console.log(data.posData.pos.Agent[j].amount)
                      amount=amount+ parseFloat(data.posData.pos.Agent[j].amount)
                      console.log ("amount",amount);
                     
                      if (j == data.posData.pos.Agent.length-1){
                        console .log("entered",amount)
                        return amount
                      }
                    }
                  }
  
              
       
  
    }
  }

module.exports = router;