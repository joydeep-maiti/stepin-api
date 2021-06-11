const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findOne, insertOne, updateOne, deleteOne } = require("./data");
const { ObjectID } = require("mongodb");

dataBaseConnection().then(dbs => {
  router.get("/user", cors(), async (req, res) => {
    console.log("GET /user")
    try {
      findAll(dbs, collections.user).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });

  router.post("/user/login", cors(), async (req, res) => {
    console.log("POST /user/login", req.body)
    try {
      dbs.collection(collections.user).aggregate([
        {
          '$match': {
            'username': req.body.username, 
            'password': req.body.password
          }
        }, {
          '$lookup': {
            'from': 'access', 
            'let': {
              'rol': '$role', 
              'dept': '$department'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$and': [
                      {
                        '$eq': [
                          '$role', '$$rol'
                        ]
                      }, {
                        '$eq': [
                          '$department', '$$dept'
                        ]
                      }
                    ]
                  }
                }
              }
            ], 
            'as': 'permissionObj'
          }
        }, {
          '$unwind': {
            'path': '$permissionObj'
          }
        }, {
          '$addFields': {
            'permissions': '$permissionObj.permissions'
          }
        }, {
          '$project': {
            'username': 1, 
            'role': 1, 
            'department': 1, 
            'permissions': 1
          }
        }
      ]).toArray(async function(err, result) {
        if(err)
          res.status(500).send()
        if(result.length){
          const loggedinRes = await dbs.collection(collections.userlog).find({username:result[0].username}).sort({_id:-1}).limit(1).toArray()
          if(loggedinRes[0] && loggedinRes[0].login){
            res.status(401).json({msg:"Already logged in"})
          }else{
            let body = {
              username: result[0].username,
              login: new Date().toISOString()
            }
            insertOne(dbs, collections.userlog, body)
            .then(_response => {
              // console.log("_response",_response)
              res.status(200).send(result)
            });
          }
        }
        else
          res.status(400).send()
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });

  router.post("/user/logout", cors(), async (req, res) => {
    console.log("POST /user/logout", req.body)
    try {
      let body = {
        username: req.body.username,
        logout: new Date().toISOString()
      }
      insertOne(dbs, collections.userlog, body)
      .then(_response => {
        // console.log("_response",_response)
        res.status(200).send()
      });
    } catch (error) {
      console.log(error);
      res.status(500).send()
    }
  });

  router.post("/user", cors(), async (req, res) => {
    console.log("POST /user", req.body)
    try {
      let regex = new RegExp(["^", req.body.username, "$"].join(""), "i")
      findOne(dbs, collections.user,{username:{$regex:regex}})
      .then(result => {
        if(result){
          console.log(result)
          res.status(400).json({msg:"Username already exist!"})
        }else{
          insertOne(dbs, collections.user,req.body).then(result => {
            console.log("result",result)
            res.status(201).send()
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });

  router.patch("/user", cors(), async (req, res) => {
    const {_id, ...body} = req.body
    console.log("PATCH /user", req.body,body)
    try {
      updateOne(dbs, collections.user, {_id:new ObjectID(_id)}, {$set:body}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });

  router.delete("/user/:id", cors(), async (req, res) => {
    console.log("DELETE /user", req.params.id)
    try {
      deleteOne(dbs, collections.user, {_id:new ObjectID(req.params.id)}).then(result => res.status(200).send());
    } catch (error) {
      console.log(error);
      res.status(500).send(result)
    }
  });
});

module.exports = router;
