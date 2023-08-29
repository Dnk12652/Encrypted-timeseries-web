const express = require("express");
const dotenv = require("dotenv").config();
const mongoDbConnection = require("./db/dbConnection");

const app = express();

const Port = process.env.PORT || 8081;
//db connection
mongoDbConnection();

app.listen(Port, () => {
  console.log("server started portno", Port);
});
