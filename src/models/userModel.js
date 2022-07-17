const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: "user"
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
    deleteAt: {
        type: Date,
    },
    deletedById: {
        type: Types.ObjectId,
    }
})

module.exports = {
    UserModel: model('Users', schema)
}