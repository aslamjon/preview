// Requiring module
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const compression = require("compression");
require("dotenv").config();

const app = express();

function shouldCompress(req, res) {
  // don't compress responses with this request header
  if (req.headers["x-no-compression"]) return false;

  // fallback to standard filter function
  return compression.filter(req, res);
}

app.use(compression({ filter: shouldCompress }));

const createDefaultFolder = (dirName) => {
  if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true });
};

createDefaultFolder(path.join(__dirname, `./data/cache`));
createDefaultFolder(path.join(__dirname, `./data/images`));

const { connectDb } = require("./src/services/db/db");

const { checkUser } = require("./src/middlewares/authMiddleware");

// ROUTERS
const { authRouter } = require("./src/routers/authRouter");
const { previewRouter } = require("./src/routers/previewRouter");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true })); // if json come backend then it convert to obj in req.body

app.use("/api/auth", authRouter);
app.use("/api/preview", previewRouter);
app.use("/api/images", express.static(path.join(__dirname, "./data/images")));

app.use("/", express.static(path.join(__dirname, "./public")));

app.use(express.static("routes"));

app.post("/", (req, res) => {
  res.send({ status: "success" });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error("API Not Found. Please check it and try again.");
  err.status = 404;
  next(err);
});

// Error handle
app.use((err, req, res, next) => {
  console.log("[Global error middleware]", err.message, err.status, req.method, req.url);
  res.status(500).send({
    message: err.message,
  });
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectDb();
});
