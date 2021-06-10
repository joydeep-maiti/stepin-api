const http = require("http");
const express = require("express");

const bookingRouter = require("./router/booking");
const posRouter = require("./router/pos");
const advanceRouter = require('./router/advanceRouter')
const billingRouter = require("./router/billing");
const customerRouter = require("./router/customer");
const roomRouter = require("./router/room");
const taxRouter = require("./router/tax");
const seasonRouter = require("./router/season");
const rateRouter=require('./router/rateMaster');
const roomcategoryRouter = require("./router/roomCategory");
const reportsRouter=require("./router/reports")
const posReportRouter=require('./router/PosReport')
const billingReportRouter = require ('./router/billingReport')
const guestreportRouter =  require('./router/guest');
const propertyDetailsRouter = require('./router/propertyDetails')
const search = require('./router/search');
const inventory = require('./router/intentory')
const printbill = require('./router/printBill')
const occupnacyreport = require('./router/occupancyReport')
const taxcollectionReport = require('./router/taxCollectionReport')
const user = require('./router/user')
const collectionReportRouter = require ('./router/collectionReport')
const agentReport = require('./router/agentReport');
const access = require ('./router/access')
const userlog = require ('./router/userlog')
const bodyParser = require("body-parser");
require("./router/dataBaseConnection");

// initialize the server and configure support for ejs templates
const app = new express();
const server = http.createServer(app);

app.use(bodyParser.json({limit: "8mb"}));
app.use(bodyParser.urlencoded({ limit: "8mb", extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS, PATCH");
  next();
});

app.use(bookingRouter);
app.use(posRouter);
app.use(advanceRouter);
app.use(billingRouter);
app.use(customerRouter);
app.use(roomcategoryRouter);
app.use(roomRouter);
app.use(taxRouter);
app.use(seasonRouter);
app.use(rateRouter.router);
app.use(reportsRouter)
app.use(posReportRouter)
app.use(billingReportRouter)
app.use(guestreportRouter)
app.use(propertyDetailsRouter)
app.use(occupnacyreport)
app.use(search);
app.use(printbill);
app.use(taxcollectionReport)
app.use(user);
app.use(inventory);
app.use(collectionReportRouter)
app.use(agentReport)
app.use(access)
app.use(userlog)
app.use(express.json());

// start the server
const port = process.env.PORT || 5000;
// const env = process.env.NODE_ENV || 'production';
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port}`);
});
