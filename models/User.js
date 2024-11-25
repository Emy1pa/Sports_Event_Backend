const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 100,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
    },
    role: {
      type: String,
      enum: ["Organisateur", "Participant"],
      default: "Participant",
    },
  },
  {
    timestamps: true,
  }
);
function validateRegisterUser(obj) {
  const schema = Joi.object({
    fullName: Joi.string().trim().min(5).max(100).required(),
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
}
function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
}
function validateUpdateUser(obj) {
  const schema = Joi.object({
    fullName: Joi.string().trim().min(5).max(100),
    email: Joi.string().trim().min(5).max(100).email(),
    password: passwordComplexity(),
  });
  return schema.validate(obj);
}

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY
  );
  return token;
};
const User = mongoose.model("User", UserSchema);
module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
