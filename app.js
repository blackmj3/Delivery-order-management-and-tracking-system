// app.js
const express = require("express");
const authRoutes = require("./src/routes/authRoutes");


const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

const helmet = require("helmet");
const xssSanitize = require("./src/middlewares/xssMiddleware");
//
app.use("/api/auth", authRoutes);

//

// protect from xss
app.use(xssSanitize);
// app.post("/api/auth/register", (req, res) => {
//   res.json({ ok: true, body: req.body });
// });

app.get("/", (req, res) => res.send("Hello world"));

// User APIS
app.use("/users" , require("./src/routes/userRoute"));

// Rating APIS
app.use("/Rating" , require("./src/routes/rateRoute"));

app.use("/api/v1/orders", require("./src/routes/orders.routes"));
// Error Middleware
app.use(require("./src/middlewares/errorMiddleware"));

// Not Found
app.use(require("./middlewares/notFound"));
module.exports = app;
