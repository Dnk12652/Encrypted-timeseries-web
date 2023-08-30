const express = require("express");
const dotenv = require("dotenv").config();
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const { createAndsendEncryptedMessage } = require("./utills/commonData");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const Port = process.env.PORT || 3001;
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

let emitInterval = null;
// on connection of socket emiting message per 10 second
io.on("connection", (socket) => {
  if (!emitInterval) {
    emitInterval = setInterval(() => {
      socket.emit("message", createAndsendEncryptedMessage());
    }, 10000); // 10 seconds in milliseconds
  }

  socket.on("disconnect", () => {
    if (io.engine.clientsCount === 0) {
      clearInterval(emitInterval);
      emitInterval = null;
    }
  });
});

// listen to port 3001
server.listen(Port, () => {
  try {
    console.log(`emitter service started ${Port}`);
  } catch (error) {
    console.log(error);
  }
});
