require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");
const trackSocket = require("./src/sockets/trackSocket");
const locationController = require("./src/controllers/locationController");
const http = require("http");
const { Server } = require("socket.io");
const notificationController = require("./src/controllers/notificationController");

//http server
const server = http.createServer(app);
//socket server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// init socket logic
const connectedUsers = new Map();
trackSocket(io, connectedUsers);
notificationController.setIo(io, connectedUsers);

const PORT = process.env.PORT || 3000;
const MONGOURL = process.env.MONGO_URL;

mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("Connect with database done");

    server.listen(PORT, () => {
      console.log("Server + Socket running on port ", PORT);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });

