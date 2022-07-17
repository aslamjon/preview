const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const fileName = require("path").basename(__filename);

function checkUser(req, res, next) {
  const { authorization } = req.headers;

  try {
    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];
      if (!token) {
        res.status(401).send({
          message: "Auth error",
        });
      }
      let decoded = jwt.verify(token, process.env.SALT); // {userId: 1}
      req.user = decoded;
      res.setHeader("Last-Modified", new Date().toUTCString());
      next();
    } else {
      res.status(401).send({
        message: "Unauthorized",
      });
    }
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      res.status(401).send({
        message: "Token expired",
      });
    } else {
      logger.error(`${e.message} -> ${fileName} -> ${e} -> ${e.stack}`);
      res.status(401).send({ message: "Auth error" });
    }
  }
}

module.exports = {
  checkUser,
};
