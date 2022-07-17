const { Router } = require("express");

const { login, me, createUser, checkPhoneNumber } = require("../controllers/authController");
const { checkUser } = require("../middlewares/authMiddleware");

const router = Router();

router.post("/v1/auth/sign-in", login);
router.get("/v1/user/me", checkUser, me);
router.post("/v1/auth/sign-up", createUser);
router.post("/v1/auth/check-phone", checkPhoneNumber);

module.exports = {
  authRouter: router,
};
