const { Schema, model, Types } = require('mongoose');

const updateSchema = new Schema({
    oldValue: {
        type: String,
    },
    newValue: {
        type: String,
    },
    fieldName: {
        type: String,
    },
    valueId: {
        type: Types.ObjectId
    },
    createdById: {
        type: Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
    },
    updatedById: {
        type: Types.ObjectId,
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
    },
    deletedById: {
        type: Types.ObjectId,
    }
})

module.exports = {
    UpdateModel: model('Update', updateSchema),
}