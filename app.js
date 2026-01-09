// app.js
const express = require("express");
const authRoutes = require("./src/routes/authRoutes");


const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

//
app.use("/api/auth", authRoutes);

//

// app.post("/api/auth/register", (req, res) => {
//   res.json({ ok: true, body: req.body });
// });

app.get("/", (req, res) => res.send("Hello world"));

module.exports = app;
