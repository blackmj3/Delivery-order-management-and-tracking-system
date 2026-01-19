const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const logger = require("./utils/logger");

// Middlewares
const xssSanitize = require("./middlewares/xssSanitize");
const { apiLimiter } = require("./middlewares/rateLimiter");
const responseHandler = require("./middlewares/responseHandler");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

// Routes
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const locationRoutes = require("./routes/location.routes");
const ratingRoutes = require("./routes/rating.routes");
const userRoutes = require("./routes/user.routes");

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

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/users", userRoutes);

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