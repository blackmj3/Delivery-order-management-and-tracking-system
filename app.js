// app.js
const express = require("express");
const authRoutes = require("./src/routes/authRoutes");
const logger = require("./src/utils/logger");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

const helmet = require("helmet");
const xssSanitize = require("./src/middlewares/xssMiddleware");
//
app.use("/api/auth", authRoutes);
app.use("/api/v1/orders", require("./src/routes/ordersRoutes"));
app.use("/api/v1/locations", require("./src/routes/locationRoutes"));
app.use("/api/v1/notifications", require("./src/routes/notificationRoute"));

//

// protect from xss
app.use(xssSanitize);
// app.post("/api/auth/register", (req, res) => {
//   res.json({ ok: true, body: req.body });
// });

app.get("/", (req, res) => res.send("Hello world"));

// User APIS
app.use("/users" , require("./src/routes/userRoutes"));

// Rating APIS
app.use("/Rating" , require("./src/routes/rateRoutes"));

app.use("/api/v1/orders", require("./src/routes/ordersRoutes"));
// Error Middleware
app.use(require("./src/middlewares/errorMiddleware"));

// Not Found
app.use(require("./src/middlewares/notFoundMiddleware"));
module.exports = app;
