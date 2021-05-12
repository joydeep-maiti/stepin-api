const express = require("express");
const axios = require('axios');
const cors = require("cors");
const moment = require("moment")

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne,} = require("./data");
const { ObjectID, Db} = require("mongodb");
const { response } = require("express");

dataBaseConnection().then(dbs=>{
    router.get("/search",cors(),async(req,res)=>{
        console.log("GET /search", req.query);
        var firstname = req.query.firstname;
        var lastname = req.query.lastname;
        var contact = req.query.contact;
        var report = [];
        var bookingids = [];
        var sam = [];
        // var lname =  req.headers.lname;
        // var contact = re.headers.contact;
        try{
          
          findAll(dbs,collections.booking)
          .then(response =>{
            response.forEach(el =>{
              bookingids.push(el._id);
             })
             //res.send(response)
             //console.log(res);
             console.log(bookingids.length)
             for(const i in bookingids){
               if(firstname || lastname || contact){
                findOne(dbs,collections.booking,
                  {$and:[
                    { $or:[
                      {firstName:(firstname)},{lastName:(lastname)},{contactNumber:(contact)}
                    ]},
                    {_id:ObjectID(bookingids[i])}
                    
                  ]}
                  )
                .then(response =>{
                  if(response){
                    report.push({
                      ...response
                    })
                    if(i == bookingids.length-1){
                      console.log("others")
                    var guestReport= getsearchData(report,firstname,lastname,contact);
                    console.log(guestReport);
                      res.status(200).send(guestReport);
                      console.log("Details:",guestReport)
                    
                    }
                    }else{
                      if(i == bookingids.length-1){
                        console.log("Hello")
                        console.log(report.length)
                      var guestReport= getsearchData(report,firstname,lastname,contact);
                        res.status(200).send(guestReport);
                        console.log("Details:",guestReport)
                      
                      }
                    }
                  // response.forEach(element =>{
                  //   fnames.push(element.firstName);
                    
                //})
                })
      
               }
              
             }
          })

        }
        catch(error){

        }
    })
})
function getsearchData(data,fname , lname , contact){
  var searchdata = [];
  for(const i in data){
    if(fname || lname || contact){
      console.log("hii");
      searchdata.push({
       checkIn: (data[i].checkIn) || "",
        checkOut: (data[i].checkOut) || "",
        guestName: (data[i].firstName+" "+data[i].lastName) || "",
        contactNumber:(data[i].contactNumber)||"",
        NoofRooms: (data[i].rooms).length || "",
        bookedBy:data[i].bookedBy || "",
        referenceNumber: data[i].referencenumber || data[i].memberNumber || "",
        Amount: data[i].roomCharges || "",
        Advance: data[i].advance || "",
        Balance:(data[i].roomCharges)-(data[i].advance)
      })
    }
  
  }
 return searchdata;
}

module.exports = router;