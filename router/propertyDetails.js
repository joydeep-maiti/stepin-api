const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll ,findOne,insertOne, updateOne, deleteOne} = require("./data")
const { ObjectID } = require("mongodb");

dataBaseConnection().then(dbs => {
  router.get("/propertyDetails", cors(), async (req, res) => {
    try {
      findAll(dbs, collections.propertyDetails).then(result => res.send(result));
    } catch (error) {
      console.log(error);
    }
  });
//   router.post("/propertyDetails", cors(), async (req, res) => {
//     console.log("POST /propertyDetails", req.body)
//     try {
//       findOne(dbs, collections.propertyDetails,{propertyDetails:req.body.propertyDetails})
//       .then(result => {
//         if(result){
//           console.log(result)
//           res.status(400).json({msg:"tax already exist!"})
//         }else{
//           insertOne(dbs, collections.tax,req.body).then(result => res.status(201).send());
//         }
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send()
//     }
//   });
    

  router.patch("/propertyDetails", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /propertyDetails", req.body,body)
    try {
      updateOne(dbs, collections.propertyDetails, {_id:new ObjectID(_id)}, {$set:body}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
    }
  })

//   router.delete("/propertyDetails/:id", cors(), async (req, res) => {
//     console.log("DELETE /propertyDetails", req.params.id)
//     try {
//       deleteOne(dbs, collections.tax, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
//     } catch (error) {
//       console.log(error);
//     }
//   });
});

module.exports = router;
