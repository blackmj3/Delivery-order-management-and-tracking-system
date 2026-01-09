require("dotenv").config();

const express = require("express");
const logger = require("./src/utils/logger");
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use((req, res, next) => {
  req.log = logger.child({
    requestId: req.headers["x-request-id"] || Date.now(),
    ip: req.ip,
  });
  next();
});
app.use("/api/locations", require("./src/routes/locationRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoute"));
module.exports = app;
