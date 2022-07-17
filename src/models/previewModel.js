const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  imagePath: {
    type: String,
  },
  imageId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdById: {
    type: Types.ObjectId,
    required: true,
  },
  updated: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
  },
  updatedById: {
    type: Types.ObjectId,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deleteAt: {
    type: Date,
  },
  deletedById: {
    type: Types.ObjectId,
  },
});

module.exports = {
  PreviewModel: model("Preview", schema),
};
