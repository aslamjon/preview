const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { isNull, isString } = require("lodash");

const { UserModel } = require("../models/userModel");
const logger = require("../utils/logger");
const { errors } = require("../utils/constants");
const { hideFields } = require("../utils/utiles");

const fileName = require("path").basename(__filename);

const login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  const secret = process.env.SALT;

  if (!phoneNumber?.startsWith("+998"))
    return res.status(400).send({ message: "phoneNumber error. Please send phoneNumber like +998" });

  try {
    const user = await UserModel.findOne({ phoneNumber });
    if (!phoneNumber || !password) res.status(400).send({ message: `Send phoneNumber and password` });
    else if (!user) res.status(400).send({ message: "Login is incorrect" });
    else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) res.status(400).send({ message: "Password is incorrect" });
      else {
        const token = jwt.sign({ userId: user.id, rule: user.rule }, secret, {
          expiresIn: "5d",
        });
        const refreshToken = jwt.sign({ userId: user.id, rule: user.rule }, secret, {
          expiresIn: "10d",
        });
        res.status(200).send({
          accessToken: token,
          refreshToken,
          refreshToken,
          tokenType: "Bearer",
        });
      }
    }
  } catch (e) {
    logger.error(`${e.message} -> ${fileName} -> ${login.name} -> ${e}`);
    errors.SERVER_ERROR(res);
  }
};

const createUser = async (req, res) => {
  const { phoneNumber, password, prePassword } = req.body;
  const secret = process.env.SALT;

  if (!phoneNumber.startsWith("+998")) return res.status(400).send({ message: "phoneNumber error" });
  if (password !== prePassword) return res.status(400).send({ message: "check password and prePassword then try again" });

  const phoneNumberExists = await UserModel.findOne({ phoneNumber });
  if (phoneNumberExists) {
    res.status(400).send({
      message: "phoneNumber is already exists",
    });
  } else {
    try {
      const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT));
      const newUser = new UserModel({
        phoneNumber,
        password: hashedPassword,
      });
      await newUser.save();
      const id = newUser._id.valueOf();
      const role = newUser.role;

      const token = jwt.sign({ userId: id, role }, secret, {
        expiresIn: "5d",
      });
      const refreshToken = jwt.sign({ userId: id, role }, secret, {
        expiresIn: "10d",
      });
      /*
                jwt.sign -> create token
                secret -> secret for virify
                expiresIn: "1d"  -> token live 1 day.
            */
      res.status(200).send({
        accessToken: token,
        refreshToken,
        tokenType: "Bearer",
      });
    } catch (e) {
      logger.error(`${e.message} -> ${fileName} -> ${createUser.name} -> ${e}`);
      errors.SERVER_ERROR(res);
    }
  }
};

const me = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId, hideFields());
    res.send({
      data: { ...user._doc },
    });
  } catch (e) {
    logger.error(`${e.message} -> ${fileName} -> ${me.name} -> ${e}`);
    errors.SERVER_ERROR(res);
  }
};

const checkPhoneNumber = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber.startsWith("+998")) return res.status(400).send({ message: "phoneNumber error" });

  try {
    const user = await UserModel.findOne({ phoneNumber });
    res.send({ registered: !isNull(user) });
  } catch (e) {
    logger.error(`${e.message} -> ${fileName} -> ${me.name} -> ${e}`);
    errors.SERVER_ERROR(res);
  }
};

module.exports = {
  login,
  me,
  createUser,
  checkPhoneNumber,
};
