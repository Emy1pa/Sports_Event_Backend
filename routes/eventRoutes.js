const express = require("express");
const router = express.Router();

const { createEvent } = require("../controllers/eventController");
const {
  verifyOrganizerToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/auth");
const multer = require("multer");
const upload = require("../middlewares/photoUpload");
router.post(
  "/",
  verifyOrganizerToken,
  upload.fields([{ name: "image", maxCount: 1 }]),
  createEvent
);

module.exports = router;
