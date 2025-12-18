import multer from "multer";
import cloudinary from "./cloudinary.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else if (file.mimetype === 'application/pdf' || 
             file.mimetype.startsWith('text/') ||
             file.mimetype.startsWith('application/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed.'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Function to upload file to Cloudinary
export const uploadToCloudinary = async (file, folder = 'chat/messages') => {
  try {
    console.log('Starting upload to Cloudinary...');
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? 'Buffer exists' : 'No buffer'
    });

    // Convert buffer to base64 string for Cloudinary
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = "data:" + file.mimetype + ";base64," + b64;
    
    const uploadOptions = {
      folder: folder,
      resource_type: "auto", // auto-detect file type
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      overwrite: true,
      filename_override: file.originalname,
      use_filename: true
    };

    // For images, add transformation options
    if (file.mimetype.startsWith('image/')) {
      uploadOptions.transformation = [
        { quality: "auto", fetch_format: "auto" }
      ];
    }

    console.log('Upload options:', uploadOptions);
    console.log('Uploading to Cloudinary...');

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
    
    console.log('Upload successful:', result.secure_url);

    return {
      url: result.secure_url,
      public_id: result.public_id,
      fileName: file.originalname,
      fileSize: file.size,
      contentType: file.mimetype,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Upload to Cloudinary failed:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

// Function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};
