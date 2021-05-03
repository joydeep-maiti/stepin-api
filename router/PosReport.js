const express = require("express");
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne } = require("./data");
const { ObjectID} = require("mongodb");


dataBaseConnection().then(dbs => {
  router.get("/posreport", cors(), async (req, res) => {
    console.log("GET /posreport", req.query)
    let reportType=req.query.reportType;
    let dates = daysBetweenDates(req.query.fromDate, req.query.toDate)
    var monthReport = []
    var posIds=[];
    var rooms=[]
    try {
    
      findAll(dbs, collections.pos)
      .then(result => {
        result.forEach(element => {
              
            //console.log(element.pos.Food[0].date)
          posIds.push(
            element._id
          )
        })
        console.log(posIds.length)
        for(const i in posIds){ 
          var date = dates[0].toISOString()
          var date1=dates[dates.length-1].toISOString()
          date= date.split('T')[0]+"T00:00:00.000Z"
          date1=date1.split('T')[0]+"T23:59:59.999Z"

          findOne(dbs,collections.pos,
            {$and :[
              {$or:[
                {$and:[{"pos.Food.date": {$gte:date}},{"pos.Food.date": {$lte:date1}}]},
                {$and:[{"pos.Transport.date": {$gte:date}},{"pos.Transport.date": {$lte:date1}}]},
                {$and:[{"pos.Laundary.date": {$gte:date}},{"pos.Laundary.date": {$lte:date1}}]},
                {$and:[{"pos.Others.date": {$gte:date}},{"pos.Others.date": {$lte:date1}}]},
                {$and:[{"pos.Agent.date": {$gte:date}},{"pos.Agent.date": {$lte:date1}}]},
                //{"rooms.roomNumber": "501" },
              ]},
              {_id:ObjectID(posIds[i])}
            ]}
            )
          .then(ress =>{
            if(ress)
            {
              monthReport.push(
               {
                 ...ress
               }
                
              )
              if(i == posIds.length-1){
                var posReport= getPosReport(monthReport,date,date1,reportType);
                posReport.sort(GetSortOrder("date"));
                res.status(200).send(posReport)
   
              }
           } 
           else{
            if(i == posIds.length-1){
             var posReport= getPosReport(monthReport,date,date1,reportType);
             posReport.sort(GetSortOrder("date"));
             res.status(200).send(posReport)

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

function getPosReport(data,date1,date2,type){
  
var posreport=[]
 var posreport1=[]
// console.log("type",type)
//
        for(var i in data){
          if((type == "Food" || type == "All POS") && data[i].pos.Food){
          //   console.log("entered Food")
          // console.log(data[i].pos.Food)
          for(var j=0;j<data[i].pos.Food.length;j++)
          {
          console.log("j=",i,data[i].pos.Food[j].date)
          console.log(data[i].pos.Food.length)
          
          if(data[i].pos.Food[j].date >= date1 && data[i].pos.Food[j].date <= date2)
          posreport.push({
            date:data[i].pos.Food[j].date.split('T')[0],
            roomNo:data[i].rooms[0].roomNumber,
            amount : data[i].pos.Food[j].amount,
            remarks: data[i].pos.Food[j].remarks
            })
          }
          posreport1=posreport;
        }
        if((type == "Transport" || type == "All POS") && data[i].pos.Transport){
        //   console.log("entered Transport")
        // console.log(data[i].pos.Transport)
        for(var j=0;j<data[i].pos.Transport.length;j++)
        {
        console.log("j=",i,data[i].pos.Transport[j].date)
        console.log(data[i].pos.Transport.length)
        
        if(data[i].pos.Transport[j].date >= date1 && data[i].pos.Transport[j].date <= date2)
        posreport.push({
          date:data[i].pos.Transport[j].date.split('T')[0],
          roomNo:data[i].rooms[0].roomNumber,
          amount : data[i].pos.Transport[j].amount,
          remarks: data[i].pos.Transport[j].remarks
          })
        }
        posreport1=posreport;
      }
      if((type == "Laundary" || type == "All POS") && data[i].pos.Laundary){
      //   console.log("entered Laundary")
      // console.log(data[i].pos.Laundary)
      for(var j=0;j<data[i].pos.Laundary.length;j++)
      {
      console.log("j=",i,data[i].pos.Laundary[j].date)
      console.log(data[i].pos.Laundary.length)
      
      if(data[i].pos.Laundary[j].date >= date1 && data[i].pos.Laundary[j].date <= date2)
      posreport.push({
        date:data[i].pos.Laundary[j].date.split('T')[0],
        roomNo:data[i].rooms[0].roomNumber,
        amount : data[i].pos.Laundary[j].amount,
        remarks: data[i].pos.Laundary[j].remarks
        })
      }
      posreport1=posreport;
    }

    if((type == "Agent" || type == "All POS") && data[i].pos.Agent){
    //   console.log("entered Agent")
    // console.log(data[i].pos.Agent)
    for(var j=0;j<data[i].pos.Agent.length;j++)
    {
    console.log("j=",i,data[i].pos.Agent[j].date)
    console.log(data[i].pos.Agent.length)
    
    if(data[i].pos.Agent[j].date >= date1 && data[i].pos.Agent[j].date <= date2)
    posreport.push({
      date:data[i].pos.Agent[j].date.split('T')[0],
      roomNo:data[i].rooms[0].roomNumber,
      amount : data[i].pos.Agent[j].amount,
      remarks: data[i].pos.Agent[j].remarks
      })
    }
    posreport1=posreport;
  }

  if((type == "Misc" || type == "All POS")  && data[i].pos.Others){
  //   console.log("entered Agent")
  // console.log(data[i].pos.Others)
  for(var j=0;j<data[i].pos.Others.length;j++)
  {
  console.log("j=",i,data[i].pos.Others[j].date)
  console.log(data[i].pos.Others.length)
  
  if(data[i].pos.Others[j].date >= date1 && data[i].pos.Others[j].date <= date2)
  posreport.push({
    date:data[i].pos.Others[j].date.split('T')[0],
    roomNo:data[i].rooms[0].roomNumber,
    amount : data[i].pos.Others[j].amount,
    remarks: data[i].pos.Others[j].remarks
    })
  }
  posreport1=posreport;
}

if(type == "All POS" && i == data.length -1 ){
 return posreport1;
}
      
          if(type != "All POS" && i == data.length -1){
          //   console.log(bookingreport.bookedBy)
          // bookingreport.filter(result => (result.bookedBy == "Agent"))
          console.log("entered",posreport)
          return posreport;
          }
        
    }
      
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
