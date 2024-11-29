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
const PDFDocument = require("pdfkit");
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
      console.log("Image path:", imagePath);

      try {
        const result = await cloudinaryUploadImage(imagePath);
        event["image"] = {
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
    const events = await Event.find().populate(
      "participants",
      "fullName email"
    );
    // if (!events || events.length === 0) {
    //   return res.status(404).json({ message: "No events found." });
    // }
    return res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
async function getEventById(req, res) {
  try {
    const { eventId } = req.params;
    console.log("Event ID received in backend:", eventId);
    const event = await Event.findById(req.params.id).populate(
      "participants",
      "fullName email"
    );
    if (event) res.status(200).json(event);
    else res.status(404).json({ message: "Event not Found " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
const updateEvent = async (req, res) => {
  try {
    let participants = Array.isArray(req.body.participants)
      ? req.body.participants
      : req.body.participants?.split(",").map((p) => p.trim());

    participants =
      participants?.filter((p) => /^[0-9a-fA-F]{24}$/.test(p)) || [];

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (req.files && req.files.image) {
      const imagePath = path.join(
        __dirname,
        `../images/${req.files.image[0].filename}`
      );
      const result = await cloudinaryUploadImage(imagePath);

      req.body.image = {
        url: result.secure_url,
        publicId: result.public_id,
      };

      fs.unlinkSync(imagePath);

      if (event.image?.publicId) {
        await cloudinaryRemoveImage(event.image.publicId);
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, participants } },
      { new: true }
    ).populate("participants", "name email");

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (req.user.role !== "Organisateur") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this event" });
    }
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
async function generateEventsPDF(req, res) {
  try {
    const events = await Event.find()
      .populate("participants", "fullname email")
      .exec();

    if (!events || events.length === 0) {
      return res.status(404).json({ message: "No events found." });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=events.pdf");

    doc.pipe(res);

    doc
      .fontSize(18)
      .text("Liste des événements et participants", { align: "center" });
    doc.moveDown();

    events.forEach((event, index) => {
      doc.fontSize(14).text(`Événement ${index + 1}: ${event.title}`);
      doc.fontSize(12).text(`Description: ${event.description}`);
      doc.text(`Lieu: ${event.location}`);
      doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`);
      doc.text(
        `Participants (${event.participants.length}/${event.maxParticipants}):`
      );
      doc.moveDown(0.5);

      if (event.participants.length > 0) {
        event.participants.forEach((participant, pIndex) => {
          doc.text(
            `${pIndex + 1}. ${participant.fullname} (${participant.email})`,
            { indent: 20 }
          );
        });
      } else {
        doc.text("Aucun participant", { indent: 20 });
      }

      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  generateEventsPDF,
};
