const mongoose = require("mongoose");
const Joi = require("joi");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
      maxLength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
      maxLength: 1000,
    },
    image: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        publicId: null,
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
      maxLength: 200,
    },
    date: {
      type: Date,
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
      },
    ],
    maxParticipants: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

function validateEvent(event) {
  const schema = Joi.object({
    title: Joi.string().trim().min(6).max(200).required().messages({
      "string.base": "Title must be a string.",
      "string.empty": "Title is required.",
      "string.min": "Title must be at least 6 characters.",
      "string.max": "Title cannot exceed 200 characters.",
    }),
    description: Joi.string().trim().min(6).max(1000).required().messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description is required.",
      "string.min": "Description must be at least 6 characters.",
      "string.max": "Description cannot exceed 1000 characters.",
    }),
    image: Joi.object({
      url: Joi.string().uri().messages({
        "string.uri": "Image URL must be a valid URI.",
      }),
      publicId: Joi.string().allow(null).optional(),
    }),
    location: Joi.string().trim().min(6).max(200).required().messages({
      "string.base": "Location must be a string.",
      "string.empty": "Location is required.",
      "string.min": "Location must be at least 6 characters.",
      "string.max": "Location cannot exceed 200 characters.",
    }),
    date: Joi.date().greater("now").required().messages({
      "date.base": "Date must be a valid date.",
      "date.greater": "Date must be in the future.",
      "any.required": "Date is required.",
    }),
    participants: Joi.array().items(Joi.string()).optional(),
    maxParticipants: Joi.number().min(1).optional(),
  });
  return schema.validate(event);
}
function validateUpdateEvent(event) {
  const schema = Joi.object({
    title: Joi.string().trim().min(6).max(200).optional().messages({
      "string.base": "Title must be a string.",
      "string.empty": "Title cannot be empty.",
      "string.min": "Title must be at least 6 characters.",
      "string.max": "Title cannot exceed 200 characters.",
    }),
    description: Joi.string().trim().min(6).max(1000).optional().messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description cannot be empty.",
      "string.min": "Description must be at least 6 characters.",
      "string.max": "Description cannot exceed 1000 characters.",
    }),
    image: Joi.object({
      url: Joi.string().uri().optional().messages({
        "string.uri": "Image URL must be a valid URI.",
      }),
      publicId: Joi.string().allow(null).optional(),
    }).optional(),
    location: Joi.string().trim().min(6).max(200).optional().messages({
      "string.base": "Location must be a string.",
      "string.empty": "Location cannot be empty.",
      "string.min": "Location must be at least 6 characters.",
      "string.max": "Location cannot exceed 200 characters.",
    }),
    date: Joi.date().greater("now").optional().messages({
      "date.base": "Date must be a valid date.",
      "date.greater": "Date must be in the future.",
    }),
    participants: Joi.array().items(Joi.string()).optional(),
    maxParticipants: Joi.number().min(1).optional(),
  });
  return schema.validate(event);
}

const Event = mongoose.model("Event", EventSchema);
module.exports = {
  Event,
  validateEvent,
  validateUpdateEvent,
};
