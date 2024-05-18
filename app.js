const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const ErrorMiddleware = require("./middleware/error");
const fileUpload = require("express-fileupload");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

const corsOptions = {
  origin: "*", // Allow requests from all origin
  methods: "*", // Allow specific HTTP methods
  // allowedHeaders: 'Authorization, Content-Type', // Allow specific headers
  credentials: true,
};

// for middleware
app.use(cors(corsOptions));

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = ["http://localhost:3000"];
//       const isAllowedOrigin = allowedOrigins.includes(origin) || !origin;

//       if (isAllowedOrigin) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const cart = require("./routes/cartRoutes");
const home = require("./routes/homeRoute");

//using routess
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", cart);
app.use("/", home);

// MiddleWare for error
app.use(ErrorMiddleware);
module.exports = app;
