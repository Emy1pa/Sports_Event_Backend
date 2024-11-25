const path = require("path");

const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

const { Event, validateEvent } = require("../models/Event");

const createEvent = async (req, res) => {
  try {
    const { error } = validateEvent(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      date: req.body.date,
    };
    const event = new Event(eventData);
    if (req.files && req.files.image) {
      const imagePath = path.join(
        __dirname,
        `../images/${req.files.image[0].filename}`
      );
      try {
        const result = await cloudinaryUploadImage(imagePath);
        event.image = {
          url: result.secure_url,
          publicId: result.public_id,
        };
        // Clean up temporary file
        fs.unlinkSync(imagePath);
      } catch (uploadError) {
        console.error("Cloudinary upload error", uploadError);
        await fs.unlink(imagePath).catch(() => {
          console.error("failed to clean up the image file");
          return res.status(500).json({
            message: "Image upload failed",
            error: uploadError.message,
          });
        });
      }
    }
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Event creation error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

async function getAllEvents(req, res) {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
async function getEventById(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (event) res.status(200).json(event);
    else res.status(404).json({ message: "Event notFound " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { createEvent, getAllEvents, getEventById };
