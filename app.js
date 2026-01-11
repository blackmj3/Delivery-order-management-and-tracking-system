// app.js
const express = require("express") ;
const app = express() ;
app.use(express.json())
const path = require("path");

const xssSanitize = require("./src/middlewares/xssMiddleware");

// protect from xss
app.use(xssSanitize);

app.use(express.urlencoded({extended : true}));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// User Apis
app.use("/users" , require("./src/routes/userRoute"));

// Rate Apis 
app.use("/Rating" , require("./src/routes/rateRoute")) ;

module.exports = app;
