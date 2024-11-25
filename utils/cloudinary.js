const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Missing cloudinary configuration in environment variables");
}
const cloudinaryUploadImage = async (fileToUpload) => {
  try {
    if (!fileToUpload) throw new Error("No file provided for upload");
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "auto",
    });
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Image upload failed",
    };
  }
};
const cloudinaryRemoveImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error("No publicId provided for removal.");
    }
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Image removal failed.",
    };
  }
};

module.exports = {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
};
