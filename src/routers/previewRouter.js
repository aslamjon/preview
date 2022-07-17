const { Router } = require("express");
const path = require("path");
const multer = require("multer");

const { checkUser } = require("./../middlewares/authMiddleware");

const {
  createPreview,
  getPreview,
  getAllPreviews,
  getPreviewByUser,
  getPreviewInHtml,
  deletePreview,
  updatePreview,
} = require("../controllers/previewController");
const router = Router();

// you might also want to set some limits: https://github.com/expressjs/multer#limits
const upload = multer({
  dest: path.join(__dirname, `./../../data/cache`),
});
/* name attribute of <file> element in your form */
const nameOfFileFromFrontend = upload.any();

router.post("/v1/create", checkUser, nameOfFileFromFrontend, createPreview);
router.get("/v1/get/:id", checkUser, getPreview);
router.get("/v1/all", checkUser, getAllPreviews);
router.get("/v1/by-user", checkUser, getPreviewByUser);
router.get("/v1/template/:id", getPreviewInHtml);
router.delete("/v1/delete/:id", checkUser, deletePreview);
router.put("/v1/update/:id", checkUser, nameOfFileFromFrontend, updatePreview);

module.exports = {
  previewRouter: router,
};
