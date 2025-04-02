const Media = require("../models/Media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const uploadMedia = async (req, res) => {
  logger.info("Starting media upload");

  try {
    if (!req.file) {
      logger.error("No file found. Please add a file and try again!");
      return res.status(400).json({
        success: false,
        message: "No file found. Please add a file and try again!",
      });
    }

    console.log(req.file, "req file is here")
    const { originalname, mimetype, buffer } = req.file;

    const userId = req.user.userId;
    logger.info(`File details: name=${originalname},type=${mimetype}`);
    logger.info(`Uploading to cloudinary starting...`);

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successsfully. Public Id: - ${cloudinaryUploadResult.public_id}`
    );

    const newelyCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName:originalname,
      mimeType:mimetype,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newelyCreatedMedia.save();

    res.status(201).json({
      success: true,
      mediaId: newelyCreatedMedia._id,
      url: newelyCreatedMedia.url,
      message: "Media uploaded successfully",
    });
  } catch (error) {
    logger.error("Error creating media", error);
    res.status(500).json({
      success: false,
      message: "Error creating media",
    });
  }
};

const getAllMedias = async(req,res)=>{
  try {
    const results = await Media.find({})
    res.json({results})
  } catch (error) {
    logger.error("Error getting creating media", error);
    res.status(500).json({
      success: false,
      message: "Error getting creating media",
    });
  }
}

module.exports = {uploadMedia,getAllMedias}
