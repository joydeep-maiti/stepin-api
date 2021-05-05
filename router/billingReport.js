const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne } = require("./data");
const { ObjectID} = require("mongodb");


dataBaseConnection().then(dbs => {
  router.get("/billingReport", cors(), async (req, res) => {
    console.log("GET /Billingreport", req.query)
    let reportType=req.query.reportType;
    let dates = daysBetweenDates(req.query.fromDate, req.query.toDate)
    var monthReport = []
    var billingIds=[];
    var rooms=[]
    try {
    
      await findAll(dbs, collections.billing)
      .then(async (result) => {
        await result.forEach(element => {
              
            //console.log(element.pos.Food[0].date)
          billingIds.push(
            element._id
          )
        })
        console.log(billingIds.length)
        for(const i in billingIds){ 
          var date = dates[0].toISOString()
          var date1=dates[dates.length-1].toISOString()
          date= date.split('T')[0]+"T00:00:00.000Z"
          date1=date1.split('T')[0]+"T23:59:59.999Z"

          await findOne(dbs,collections.billing,
            {$and :[
                {$and:[
                  {checkOut: {$gte:date}},{checkOut: {$lte:date1}}
                ]},
                {_id:ObjectID(billingIds[i])}
              ]}
              )
          .then(async (ress) =>{
            if(ress)
            {
                //console.log("entereed")
              await monthReport.push(
               {
                 ...ress
               }
                
              )
              if(i == billingIds.length-1){
                var billingReport= await (getBillingReport(monthReport,reportType));
                billingReport.sort(GetSortOrder("billingDate"));
                res.status(200).send(billingReport)
   
              }
           } 
           else{
            if(i == billingIds.length-1){
             var billingReport=await (getBillingReport(monthReport,reportType));
             billingReport.sort(GetSortOrder("billingDate"));
             res.status(200).send(billingReport)

           }
          }
        
          })
        
        
        }

      })
       
          } catch (error) {
        console.log(error);
      }
      // res.status(200).send()
  });
});

function getBillingReport(data,type){
  
var billingreport=[]
 var posreport1=[]
// console.log("type",type)
//

        for(var i in data){
        //   console.log("j=",i,data[i].pos.Food[j].date)
        //grandTotal=data[i].totalAmount -(data[i].discount || 0) + (data[i].paymentData.tax || 0.00);
        if(type == "Billing Summary"){
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
                roomrate : parseFloat(data[i].totalAmount) ,
                //totalAmount : parseFloat(data[i].totalAmount),
                boardingDate : data[i].checkIn.split('T')[0] ,
                //discount : parseFloat(data[i].discount || 0.00),
                 // cash : parseFloat(data[i].paymentData.cash || 0.00 ),
                // card : parseFloat(data[i].paymentData.card || 0.00),
                // cheque : parseFloat(data[i].paymentData.cheque || 0.00),
                // wallet : parseFloat(data[i].paymentData.wallet || 0.00),
               tax : parseFloat(data[i].paymentData.tax || 0.00 ),
               food : getPos(data[i],"Food") || "",
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
              roomrate : parseFloat(data[i].totalAmount) ,
              boardingDate : data[i].checkIn.split('T')[0] ,
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
                  roomrate : parseFloat(data[i].totalAmount) ,
                  //totalAmount : parseFloat(data[i].totalAmount),
                  boardingDate : data[i].checkIn.split('T')[0] ,
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
                      roomrate : parseFloat(data[i].totalAmount) ,
                      boardingDate : data[i].checkIn.split('T')[0] ,
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
          if(i == data.length -1){
          console.log("entered")
          return billingreport;
          }
        
    }
      
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

  
module.exports = router;
