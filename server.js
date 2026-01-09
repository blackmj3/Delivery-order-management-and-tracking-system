require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");
const path = require("path");
const express = require("express");

const {apiLimiter} = require("./src/middlewares/apiLimiter");
const helmet = require("helmet");
const xssSanitize = require("./src/middlewares/xssMiddleware");

const http = require("http");
const { Server } = require("socket.io");
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

// xss verify
app.use(xssSanitize);

// helmet verify
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.yourdomain.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            frameAncestors: ["'none'"], // Prevent clickjacking
            formAction: ["'self'"] // Restrict form submissions
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));


app.use(express.urlencoded({extended : true}));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// limit for Apis using
app.use(apiLimiter);

// users Apis
app.use("/users" , require("./src/routes/userRoute"));

// rating Apis
app.use("/Rating" , require("./src/routes/rateRoute"));


// Error Middleware
app.use(require("./src/middlewares/errorMidlleware"));

// Not Found
app.use(require("./src/middlewares/notFoundMiddleware"));

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
