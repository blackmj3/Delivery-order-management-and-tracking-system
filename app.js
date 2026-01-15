// app.js
const express = require("express");
const authRoutes = require("./src/routes/authRoutes");
const logger = require("./src/utils/logger");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

//
app.use("/api/auth", authRoutes);
app.use("/api/v1/orders", require("./src/routes/ordersRoutes"));
app.use("/api/v1/locations", require("./src/routes/locationRoutes"));
app.use("/api/v1/notifications", require("./src/routes/notificationRoute"));

//

// app.post("/api/auth/register", (req, res) => {
//   res.json({ ok: true, body: req.body });
// });

app.get("/", (req, res) => res.send("Hello world"));

module.exports = app;
