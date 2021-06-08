const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const ObjectID = require("mongodb").ObjectID;
const moment = require("moment");
const momentTimeZone = require("moment-timezone");

const {
  findAll,
  findOne,
  findByObj,
  insertOne,
  updateOne,
  upSert,
  correctMonthAndYear
} = require("./data");

dataBaseConnection().then(dbs => {
  router.get("/kot", cors(), async (req, res) => {
    try {
     // findAll(dbs, collections.kot).then(result => res.status(200).send(result));
     findAll(dbs,collections.kot).then(result => res.status(200).send(result));
     //console.log("sam",result)
    } catch (error) {
      console.log(error);
    }
  });

  router.get("/kot/:id", cors(), async (req, res) => {
    console.log("Get",req.params.id)
    try {
      findOne(dbs, collections.kot, {bookingId:new ObjectID(req.params.id)}).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/kot", cors(), async (req, res) => {
    //console.log("POST /kot", req.body)
    findOne(dbs, collections.kot,{bookingId: new ObjectID(req.body.bookingId)})
    .then(result => {
      if(result){
       // console.log(result)
       res.status(400).json({msg:"kot already exist!"})
       
        
      }else{
        return findOne(dbs, collections.sequence,{name:"kot"})
        
        
      }
    })
    .then(result => {
      if(result){
        //console.log(result)
        // upSert(dbs, collections.kot, { kot: req.body.kot}, { $set: {kotID:req.body.kodID ||  "POS"+(1000000+Number(result.seq))} }, { upsert: true })
        // .then(result =>{
        //   console.log(result)
        //   res.status(200).send()})
        //kot: req.body.kot[0].kotArray[0]
        let sam= 'kot[0].kotId'
        let x=getBody(req.body,result)
        console.log("x",x)
          return insertOne(dbs, collections.kot,{...x[0], bookingId: new ObjectID(x[0].bookingId)})
        //  .then(ress=>
        //   {
        //     console.log(ress);
        //   return updateOne(dbs, collections.kot,{...ress,bookingId: new ObjectID(ress.bookingId) ,$push: { 'kot[0].kotId': 'KOT000001' }})
        //   })
      }else{
        res.status(401).send()
      }
    })
    .then(result => {
      
      if(result){
        return updateOne(dbs, collections.sequence, {name:"kot"}, {$inc:{seq:1}})
      }else{
        res.status(401).send()
      }
    })
    .then(result => {
      if(result){
        res.status(201).send()
      }else{
        res.status(401).send()
      }
    })
    .catch((error)=>{
      console.log(error);
      res.status(500).send()
    })
  });

  router.patch("/kot", cors(), async (req, res) => {
    const {bookingId, ...body} = req.body
    console.log("PATCH /kot", req.body,body)
    try {
      updateOne(dbs, collections.kot, {bookingId:new ObjectID(bookingId)}, {$set:{kot:body.kot}}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  });
})

function getBody(kotbody,seq){
  console.log(kotbody)
  console.log(seq)
  var body=[]
  
  body.push({
    bookingId: kotbody.bookingId,
    kot :  getKot(kotbody.kot,seq),
    //kotID : "kot"+(1000000+Number(seq.seq))

  })
  return body

}

function getKot(sam,seq){
  var kot=[]
  for(const i in sam){
    kot.push({
      kotId: "KOT"+(1000+Number(seq.seq)+i),
      kotArray: sam[i].kotArray

    })
  }
  console.log("kot",kot)
return kot

}
module.exports = router;