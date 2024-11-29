const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "image") {
      cb(null, path.join(__dirname, "../images"));
    }
  },
  filename: function (req, file, cb) {
    const timeStamp = new Date().toISOString().replace(/:/g, "-");
    cb(null, `${timeStamp}-${file.originalname}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    if (!file.mimetype.startsWith("image")) {
      return cb(new Error("Only image files are allowed"), false);
    }
  }
  cb(null, true);
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
