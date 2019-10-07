const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll } = require("./data");

dataBaseConnection().then(dbs => {
  router.get("/taxSlabs", cors(), async (req, res) => {
    try {
      findAll(dbs, collections.tax).then(result => res.send(result));
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
