const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, findByObj1,findByObj2} = require("./data");
const { ObjectID} = require("mongodb");
const { add } = require("date-fns");


dataBaseConnection().then(dbs =>{
  router.get("/posreport",cors(),async(req,res) =>{
    console.log("GET /posreport", req.query);
    let reportType=req.query.reportType;
    date= req.query.fromDate+"T00:00:00.000Z"
    date1=req.query.toDate+"T23:59:59.999Z"
    let sam = "pos.Food"
        
       // console.log("dates are:",date , date1);
    try{
        if(reportType == "Food"){
          findByObj2(dbs, collections.pos, 
            {"pos.Food.date":{$gte:date, $lte:date1}},"pos.Food",{"pos.Food.date":1})
           
          .then(result =>{
            
            //console.log(result)
            ///res.send(result)
            var report = getPosReport(result ,date ,date1, reportType);
            res.send(report)
           //console.log(report.length); 
          
          })
        }
        else if(reportType == "Transport"){
          findByObj2(dbs, collections.pos, 
            {"pos.Transport.date":{$gte:date, $lte:date1}},"pos.Transport",{"pos.Transport.date":1})
           
          .then(result =>{
            
            //console.log(result)
            ///res.send(result)
            var report = getPosReport(result ,date ,date1, reportType);
            res.send(report)
           console.log(report.length); 
          
          })
          
        }
        else if(reportType == "Laundary"){
          findByObj2(dbs, collections.pos, 
            {"pos.Laundary.date":{$gte:date, $lte:date1}},"pos.Laundary",{"pos.Laundary.date":1})
           
          .then(result =>{
            
           // console.log(result.length)
            ///res.send(result)
            var report = getPosReport(result ,date ,date1, reportType);
            res.send(report)
           console.log(report.length); 
          
          })
          
        }
        else if(reportType == "Agent"){
          findByObj2(dbs, collections.pos, 
            {"pos.Agent.date":{$gte:date, $lte:date1}},"pos.Agent",{"pos.Agent.date":1})
           
          .then(result =>{
            
           // console.log(result.length)
            ///res.send(result)
            var report = getPosReport(result ,date ,date1, reportType);
            res.send(report)
           console.log(report.length); 
          
          })
          
        }
        else if(reportType == "Misc"){
          findByObj2(dbs, collections.pos, 
            {"pos.Others.date":{$gte:date, $lte:date1}},"pos.Others",{"pos.Others.date":1})
           
          .then(result =>{
            
           console.log(result.length)
            ///res.send(result)
            var report = getPosReport(result ,date ,date1, reportType);
            res.send(report)
           console.log(report.length); 
          
          })
          
        }
        else if(reportType == "All POS"){
          //console.log(collections.pos.Food.date);
          findByObj2(dbs, collections.pos, 
           {$or:[{"pos.Others.date":{$gte:date, $lte:date1}},{"pos.Food.date":{$gte:date, $lte:date1}},{"pos.Transport.date":{$gte:date, $lte:date1}},{"pos.Laundary.date":{$gte:date, $lte:date1}},{"pos.Agent.date":{$gte:date, $lte:date1}}]},"pos.Others||pos.Food||pos.Transport||pos.Laundary||pos.Agent",{"guestName":1})
         
           
          .then(result =>{
            
            //console.log(result , result.length)
            ///res.send(result)
           var report = getPosReport(result ,date,date1,reportType);
            res.send(report)
            console.log(report.length); 
          
          })
          
        }
    }
    catch(error){

    }
  })
})


function getPosReport(data ,date1,date2, type){
  var posreport=[]
  var posreport1=[]
  let sam =""
  let sam1 =[]
  for(const i in data){
    if((type == "Food" ) && data[i].pos.Food){
      //   console.log("entered Food")
      // console.log(data[i].pos.Food)
      for(var j=0;j<data[i].pos.Food.length;j++)
      {
      console.log("j=",i,data[i].pos.Food[j].date)
      console.log(data[i].pos.Food.length)
      
      if(data[i].pos.Food[j].date >= date1 && data[i].pos.Food[j].date <= date2)
      posreport.push({
        date:data[i].pos.Food[j].date.split('T')[0],
        guestName: data[i].guestName,
        roomNo:data[i].rooms[0].roomNumber,
        amount : data[i].pos.Food[j].amount,
        remarks: data[i].pos.Food[j].remarks
        })
      }
      posreport1=posreport;
    }
    if((type == "Transport" ) && data[i].pos.Transport){
      //   console.log("entered Transport")
      // console.log(data[i].pos.Transport)
      for(var j=0;j<data[i].pos.Transport.length;j++)
      {
      console.log("j=",i,data[i].pos.Transport[j].date)
      console.log(data[i].pos.Transport.length)
      
      if(data[i].pos.Transport[j].date >= date1 && data[i].pos.Transport[j].date <= date2)
      posreport.push({
        date:data[i].pos.Transport[j].date.split('T')[0],
        guestName: data[i].guestName,
        roomNo:data[i].rooms[0].roomNumber,
        amount : data[i].pos.Transport[j].amount,
        remarks: data[i].pos.Transport[j].remarks
        })
      }
      posreport1=posreport;
    }
    if((type == "Laundary" ) && data[i].pos.Laundary){
    //   console.log("entered Laundary")
    // console.log(data[i].pos.Laundary)
    for(var j=0;j<data[i].pos.Laundary.length;j++)
    {
    console.log("j=",i,data[i].pos.Laundary[j].date)
    console.log(data[i].pos.Laundary.length)
    
    if(data[i].pos.Laundary[j].date >= date1 && data[i].pos.Laundary[j].date <= date2)
    posreport.push({
      date:data[i].pos.Laundary[j].date.split('T')[0],
      guestName: data[i].guestName,
      roomNo:data[i].rooms[0].roomNumber,
      amount : data[i].pos.Laundary[j].amount,
      remarks: data[i].pos.Laundary[j].remarks
      })
    }
    posreport1=posreport;
  }
  if((type == "Agent" ) && data[i].pos.Agent){
    //   console.log("entered Agent")
    // console.log(data[i].pos.Agent)
    for(var j=0;j<data[i].pos.Agent.length;j++)
    {
    console.log("j=",i,data[i].pos.Agent[j].date)
    console.log(data[i].pos.Agent.length)
    
    if(data[i].pos.Agent[j].date >= date1 && data[i].pos.Agent[j].date <= date2)
    posreport.push({
      date:data[i].pos.Agent[j].date.split('T')[0],
      guestName: data[i].guestName,
      roomNo:data[i].rooms[0].roomNumber,
      amount : data[i].pos.Agent[j].amount,
      remarks: data[i].pos.Agent[j].remarks
      })
    }
    posreport1=posreport;
  }

  if((type == "Misc")  && data[i].pos.Others){
  //   console.log("entered Agent")
  // console.log(data[i].pos.Others)
  for(var j=0;j<data[i].pos.Others.length;j++)
  {
  console.log("j=",i,data[i].pos.Others[j].date)
  console.log(data[i].pos.Others.length)
  
  if(data[i].pos.Others[j].date >= date1 && data[i].pos.Others[j].date <= date2)
  posreport.push({
    date:data[i].pos.Others[j].date.split('T')[0],
    guestName: data[i].guestName,
    roomNo:data[i].rooms[0].roomNumber,
    amount : data[i].pos.Others[j].amount,
    remarks: data[i].pos.Others[j].remarks
    })
  }
  posreport1=posreport;
}
if((type == "All POS")  &&(data[i].pos.Others || data[i].pos.Food || data[i].pos.Transport || data[i].pos.Laundary || data[i].pos.Agent) ){
  //   console.log("entered Agent")
  // console.log(data[i].pos.Others)
  
  if(data[i].pos.Others || data[i].pos.Food || data[i].pos.Transport || data[i].pos.Laundary || data[i].pos.Agent){
     sam = (data[i].pos.Others || data[i].pos.Food || data[i].pos.Transport || data[i].pos.Laundary || data[i].pos.Agent);
    
  }
  
   for(var j = 0 ; j<sam.length;j++){
     let sample = data[i].pos;
     let Food = getPos(data[i].pos.Food,"Food");
     let Transport = getPos(data[i].pos.Transport,"Transport")
      posreport.push({
        guestName: (data[i].guestName) || "",
       date:(sam[j].date) || "",
       //Food:data[i].sam[j].Food,
       
        Food:getPos(data[i].pos.Food,"Food") ,
        Transport:getPos(data[i].pos.Transport,"Transport"),
         Laundary:getPos(data[i].pos.Laundary,"Laundary"),
         Agent:getPos(data[i].pos.Agent,"Agent") || "",
         Others:getPos(data[i].pos.Others,"Others") || "",
        Total:((getPos(data[i].pos.Food,"Food")-0)+(getPos(data[i].pos.Transport,"Transport")-0)+(getPos(data[i].pos.Laundary,"Laundary")-0)+(getPos(data[i].pos.Agent,"Agent")-0)+(getPos(data[i].pos.Others,"Others")-0))
          }
        )
     
     //console.log("date",sam[j].date);
     

   }
  
  posreport1=posreport;
}


  }

  return posreport1
}

function getPos(data, type){
  let amount = "";
  let sam =0;
  if(data == undefined){
    return "";
  }else{
    for(var i =0 ; i<data.length ; i++){
      amount  = data[i].amount
      console.log("ouput",data[i].amount);
    }
    console.log(amount)
    return amount ;
  }
}



module.exports = router;
