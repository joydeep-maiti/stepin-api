const http = require("http");
const express = require("express");

const bookingRouter = require("./router/booking");
const roomRouter = require("./router/room");
const bodyParser = require("body-parser");
require("./router/dataBaseConnection");

// initialize the server and configure support for ejs templates
const app = new express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bookingRouter);
app.use(roomRouter);

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
