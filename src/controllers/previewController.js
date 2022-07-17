const { isEmpty, get } = require("lodash");
const path = require("path");
const { PreviewModel } = require("../models/previewModel");
const logger = require("../utils/logger");
const { errors } = require("../utils/constants");
const { saveImgs, isLink, unlink } = require("../utils/utiles");
const config = require("../../config");

const fileName = path.basename(__filename);

const errorHandling = (e, functionName, res) => {
  logger.error(`${e.message} -> ${fileName} -> ${functionName} -> ${e.stack}`);
  errors.SERVER_ERROR(res);
};

const createPreview = async (req, res) => {
  const { title, description, link } = req.body;
  if (!title || !description || !link) return res.status(400).send({ message: "Send title, description and link" });
  else if (!isLink(link)) return res.status(400).send({ message: "Link is not valid" });
  try {
    const result = await saveImgs(req, res, ["file"]);
    if (!isEmpty(get(result, "file"))) {
      const newPreview = new PreviewModel({
        title,
        description,
        link,
        image: `${config.API_ROOT}/api/images/${get(result, "file")}`,
        imagePath: path.join(__dirname, `./../../data/images/`) + get(result, "file"),
        imageId: get(result, "file"),
        createdById: req.user.userId,
      });
      await newPreview.save();
      res.status(200).send({ message: "Preview created", data: newPreview });
    }
  } catch (e) {
    errorHandling(e, createPreview.name, res);
  }
};

const getPreview = async (req, res) => {
  try {
    const { id } = req.params;
    const previews = await PreviewModel.find({ _id: id, deleted: false });
    res.status(200).send({ data: previews });
  } catch (e) {
    errorHandling(e, getPreview.name, res);
  }
};

const getAllPreviews = async (req, res) => {
  try {
    const previews = await PreviewModel.find({ deleted: false });
    res.status(200).send({ data: previews });
  } catch (e) {
    errorHandling(e, getAllPreviews.name, res);
  }
};

const getPreviewByUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const previews = await PreviewModel.find({ createdById: userId, deleted: false });
    res.status(200).send({ data: previews });
  } catch (e) {
    errorHandling(e, getPreviewByUser.name, res);
  }
};

const getPreviewInHtml = async (req, res) => {
  try {
    const { id } = req.params;
    const previews = await PreviewModel.find({ _id: id, deleted: false });
    if (isEmpty(previews)) return res.status(404).send({ message: "Preview not found" });
    else
      res.status(200).send(
        templateHtml({
          title: get(previews, "[0].title"),
          description: get(previews, "[0].description"),
          link: get(previews, "[0].link"),
          imageLink: get(previews, "[0].image"),
        })
      );
  } catch (e) {
    errorHandling(e, getPreviewInHtml.name, res);
  }
};

const deletePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const previews = await PreviewModel.find({ _id: id, deleted: false });
    if (isEmpty(previews)) return res.status(404).send({ message: "Preview not found" });
    else {
      await PreviewModel.findOneAndUpdate({ _id: id }, { deleted: true });
      res.status(200).send({ message: "Preview deleted" });
    }
  } catch (e) {
    errorHandling(e, deletePreview.name, res);
  }
};

const updatePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link } = req.body;

    if (!title || !description || !link) return res.status(400).send({ message: "Send title, description and link" });
    else if (!isLink(link)) return res.status(400).send({ message: "Link is not valid" });
    const previews = await PreviewModel.find({ _id: id, deleted: false });
    if (isEmpty(previews)) return res.status(404).send({ message: "Preview not found" });
    else {
      let imageTemp = {};
      if (!isEmpty(req.files)) {
        const result = await saveImgs(req, res, ["file"]);
        if (!isEmpty(get(result, "file"))) {
          imageTemp = {
            image: `${config.API_ROOT}/api/images/${get(result, "file")}`,
            imagePath: path.join(__dirname, `./../../data/images/`) + get(result, "file"),
            imageId: get(result, "file"),
          };
        }
      }
      const newPreview = await PreviewModel.findOneAndUpdate(
        { _id: id },
        { title, description, link, ...imageTemp, updatedById: req.user.userId, updatedAt: Date.now(), updated: true }
      );
      if (!isEmpty(req.files)) {
        get(newPreview, "imagePath") && unlink(get(newPreview, "imagePath"));
      }
      res.status(200).send({ message: "Preview updated" });
    }
  } catch (e) {
    errorHandling(e, updatePreview.name, res);
  }
};

const templateHtml = ({ title, description, link, imageLink }) => `
<!DOCTYPE html>
<html lang="en" prefix="og:http://ogp.me/ns#">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="shortcut icon" href="/assets/icons/logo.ico" />
    <meta name="description" content="${description}" />
    <meta itemprop="name" content="${title}" />
    <meta itemprop="description" content="${description}" />
    <meta itemprop="image" size="1024x512" content="${imageLink}" />
    <meta property="og:url" content="${link}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta
      property="og:description"
      content="${description}"
    />
    <meta property="og:image" size="1024x512" content="${imageLink}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta
      name="twitter:description"
      content="${description}"
    />
    <meta name="twitter:image" size="1024x512" content="${imageLink}" />

    <title>Preview</title>
    <script>
      window.location.href = "${link}";
    </script>
  </head>
  <body></body>
</html>
`;
module.exports = {
  createPreview,
  getPreview,
  getAllPreviews,
  getPreviewByUser,
  getPreviewInHtml,
  deletePreview,
  updatePreview,
};
