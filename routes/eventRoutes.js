const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  generateEventsPDF,
  generatePdf,
} = require("../controllers/eventController");
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
router.get("/", verifyTokenAndAuthorization, getAllEvents);
router.get("/:id", verifyTokenAndAuthorization, getEventById);
router.put("/:id", verifyOrganizerToken, updateEvent);
router.delete("/:id", verifyOrganizerToken, deleteEvent);
router.get("/pdf", verifyOrganizerToken, generateEventsPDF);
module.exports = router;
