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
  verifyToken,
} = require("../middlewares/auth");
const multer = require("multer");
const upload = require("../middlewares/photoUpload");
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message:
          err.field === "image"
            ? "Image size should be less than 2MB"
            : "Video size should be less than 50MB",
      });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
};
router.post(
  "/",
  verifyOrganizerToken,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handleMulterError,
  createEvent
);
router.get("/", verifyTokenAndAuthorization, getAllEvents);
router.get("/participant", verifyToken, getEventById);
router.put(
  "/:id",
  verifyOrganizerToken,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handleMulterError,
  updateEvent
);
router.get("/pdf", verifyOrganizerToken, generateEventsPDF);
router.delete("/:id", verifyOrganizerToken, deleteEvent);
module.exports = router;
