// app.js
const express = require("express");
//const authRoutes = require("./src/routes/authRoutes");
const logger = require("./src/utils/logger");
const cookieParser = require("cookie-parser");

const app = express();
const cookies = require("cookie-parser");
const { apiLimiter } = require("./src/middlewares/limiter");

const helmet = require("helmet");
//const xssSanitize = require("./middlewares/xss");

app.use(express.json());
app.use(express.static("public"));
app.use(cookies());

// protect from xss
//app.use(xssSanitize);

// Enhanced security headers specifically for auth
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        /* styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], */
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        /* connectSrc: ["'self'", "https://api.yourdomain.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"], */
        frameAncestors: ["'none'"], // Prevent clickjacking
        formAction: ["'self'"], // Restrict form submissions
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
// Rate Limiter
app.use(apiLimiter);

//app.use("/api/v1/orders", require("./src/routes/orders.routes"));
app.use("/api/v1/locations", require("./src/routes/locationRoutes"));
app.use("/api/v1/notifications", require("./src/routes/notificationRoute"));
// Error Middleware
app.use(require("./src/middlewares/errorMiddleware"));

// Not Found
//app.use(require("./middlewares/notFound"));
module.exports = app;
