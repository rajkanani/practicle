"use strict";

/**
 * import required files and define static constants
 *
 * @author Raj Kanani
 **/

// definition
const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const https = require("https");
const fileUpload = require("express-fileupload");
const config = require("./config");
const app = express();

// import main routes
const indexRouter = require("./routes/index");

/**
 * define utility variables
 *
 * @author Raj Kanani
 **/
const PORT = config.server.port;

/**
 * Adding middleware to the APIs
 *
 * @author Raj Kanani
 **/
app.use(cors()); // enable cross-origin functionalities
app.use(fileUpload()); // enable file access
app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" })); // enable request with body-parser and serve as json
app.use(morgan("dev")); // enable logging for the dev apps
app.use("/", indexRouter); // enables routes for following paths

/**
 *  Create Server and set default message
 *
 * @author Raj Kanani
 **/
if (config.mode.production) {
  const privateKey = fs.readFileSync(config.ssl.privateKey);
  const certificate = fs.readFileSync(config.ssl.certificate);

  https.createServer({ key: privateKey, cert: certificate }, app).listen(PORT);
} else {
  app.listen(PORT, () => console.log("server starting on port:", PORT));
}
