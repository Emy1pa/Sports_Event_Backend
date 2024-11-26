const path = require("path");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

const {
  Event,
  validateEvent,
  validateUpdateEvent,
} = require("../models/Event");
const mongoose = require("mongoose");
const { User } = require("../models/User");
const createEvent = async (req, res) => {
  try {
    const { error } = validateEvent(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (req.body.participants) {
      const participantErrors = [];
      for (const participantId of req.body.participants) {
        const user = await User.findById(participantId);
        if (!user || user.role !== "Participant") {
          participantErrors.push(participantId);
        }
      }
      if (participantErrors.length > 0) {
        return res.status(400).json({
          message: `Invalid participants: ${participantErrors.join(
            ", "
          )}. Only users with participant role can be added.`,
        });
      }
    }
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      date: req.body.date,
      participants: req.body.participants || [],
      maxParticipants: req.body.maxParticipants,
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
    const events = await Event.find().populate("participants", "name email");
    if (events.length === 0) {
      return res.status(404).json({ message: "No events found." });
    }
    return res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
async function getEventById(req, res) {
  try {
    const event = await Event.findById(req.params.id).populate(
      "participants",
      "name email"
    );
    if (event) res.status(200).json(event);
    else res.status(404).json({ message: "Event not Found " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
async function updateEvent(req, res) {
  try {
    const { error } = validateUpdateEvent(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    let updateEvent = { ...req.body };
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (req.body.participants) {
      const participantErrors = [];
      for (const participantId of req.body.participants) {
        const user = await User.findById(participantId);
        if (!user || user.role !== "Participant") {
          participantErrors.push(participantId);
        }
      }
      if (participantErrors.length > 0) {
        return res.status(400).json({
          message: `Invalid participants: ${participantErrors.join(
            ", "
          )}. Only users with participant role can be added.`,
        });
      }
    }
    if (req.file) {
      const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
      const result = await cloudinaryUploadImage(imagePath);
      updateEvent.image = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      fs.unlinkSync(imagePath);
      if (existingEvent.image && existingEvent.image.publicId) {
        await cloudinaryRemoveImage(existingEvent);
      }
    }
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateEvent,
      },
      { new: true }
    ).populate("participants", "name email");
    if (updatedEvent) {
      res.status(200).json(updatedEvent);
    } else {
      res.status(404).json({ message: "Event not found or failed to update" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.image && event.image.publicId) {
      await cloudinaryRemoveImage(event.image.publicId);
    }
    await event.deleteOne();
    res.status(200).json({ message: "Event has been deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
