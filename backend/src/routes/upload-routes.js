import express from "express";
import { upload, uploadToCloudinary } from "../util/multer.js";
import { verifyToken } from "../middlewares/auth-middleware.js";
import ResponseError from "../error/response-error.js";

const router = express.Router();

// Upload image route
router.post("/upload-image", verifyToken, upload.single("image"), async (req, res, next) => {
  try {
    console.log('Upload image route called');
    console.log('Request file:', req.file ? 'File exists' : 'No file');

    if (!req.file) {
      throw new ResponseError(400, "No image file provided");
    }

    // Check if file is an image
    if (!req.file.mimetype.startsWith('image/')) {
      throw new ResponseError(400, "File must be an image");
    }

    console.log('Starting Cloudinary upload...');
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'chat/images');

    console.log('Upload successful, returning response...');
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        contentType: uploadResult.contentType,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format
      }
    });

  } catch (error) {
    console.error('Upload image route error:', error);
    next(error);
  }
});

// Upload file route (for documents, etc.)
router.post("/upload-file", verifyToken, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ResponseError(400, "No file provided");
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'chat/files');

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        contentType: uploadResult.contentType
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;