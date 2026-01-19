const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const logger = require("./src/utils/logger");

// Middlewares
const xssSanitize = require("./src/middlewares/xssMiddleware");
const { apiLimiter } = require("./src/middlewares/limiter");
const responseHandler = require("./src/middlewares/responseHandler");
const errorHandler = require("./src/middlewares/errorMiddleware");
const notFound = require("./src/middlewares/notFoundMiddleware");

const app = express();

/* ======================
   GLOBAL MIDDLEWARES
====================== */

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Sanitize input
app.use(xssSanitize);

// Rate limiting
app.use("/api", apiLimiter);

// HTTP logger (dev only)
if (process.env.NODE_ENV === "development") {
  app.use(
    morgan("dev", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

/* ======================
   ROUTES
====================== */

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/orders", require("./src/routes/ordersRoutes"));
app.use("/api/locations", require("./src/routes/locationRoutes"));
app.use("/api/ratings", require("./src/routes/rateRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));

/* ======================
   RESPONSE HANDLER
====================== */

// handles asyncHandler responses
app.use(responseHandler);

/* ======================
   NOT FOUND
====================== */
app.use(notFound);

/* ======================
   ERROR HANDLER
====================== */
app.use(errorHandler);

module.exports = app;