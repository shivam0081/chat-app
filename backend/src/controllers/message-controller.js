import ResponseError from "../error/response-error.js";
import Message from "../models/message-model.js";
import { uploadToCloudinary } from "../util/multer.js";

export const getMessage = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;

    if (!user1 || !user2) {
      throw new ResponseError(400).json("Both user Id's are required");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timeStamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ResponseError(400, "File is required");
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'chat/messages');

    res.status(200).json({
      success: true,
      message: "Successfully uploaded file.",
      filePath: uploadResult.url,
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
};

// Send text message
export const sendMessage = async (req, res, next) => {
  try {
    const { content, recipient, messageType = "text" } = req.body;
    const sender = req.userId;

    if (!sender || !recipient) {
      throw new ResponseError(400, "Sender and recipient are required");
    }

    if (messageType === "text" && !content) {
      throw new ResponseError(400, "Content is required for text messages");
    }

    const message = new Message({
      sender,
      recipient,
      content,
      messageType
    });

    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    res.status(201).json({
      success: true,
      message: populatedMessage
    });

  } catch (error) {
    next(error);
  }
};

// Send image message
export const sendImageMessage = async (req, res, next) => {
  try {
    const { recipient, fileUrl, fileName, fileSize, contentType } = req.body;
    const sender = req.userId;

    if (!sender || !recipient) {
      throw new ResponseError(400, "Sender and recipient are required");
    }

    if (!fileUrl) {
      throw new ResponseError(400, "File URL is required for image messages");
    }

    const message = new Message({
      sender,
      recipient,
      messageType: "image",
      fileUrl,
      fileName,
      fileSize,
      contentType
    });

    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    res.status(201).json({
      success: true,
      message: populatedMessage
    });

  } catch (error) {
    next(error);
  }
};

// Send file message
export const sendFileMessage = async (req, res, next) => {
  try {
    const { recipient, fileUrl, fileName, fileSize, contentType } = req.body;
    const sender = req.userId;

    if (!sender || !recipient) {
      throw new ResponseError(400, "Sender and recipient are required");
    }

    if (!fileUrl) {
      throw new ResponseError(400, "File URL is required for file messages");
    }

    const message = new Message({
      sender,
      recipient,
      messageType: "file",
      fileUrl,
      fileName,
      fileSize,
      contentType
    });

    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    res.status(201).json({
      success: true,
      message: populatedMessage
    });

  } catch (error) {
    next(error);
  }
};
