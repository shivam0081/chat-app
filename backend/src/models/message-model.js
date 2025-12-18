import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Corrected `Ref` to `ref`
    required: true, // Corrected `requreid` to `required`
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  messageType: {
    type: String,
    enum: ["text", "file", "image"],
    required: true,
  },
  content: {
    type: String,
    required: function () {
      return this.messageType === "text";
    },
  },
  fileUrl: {
    type: String,
    required: function () {
      return this.messageType === "file" || this.messageType === "image";
    },
  },
  fileName: {
    type: String,
    required: function () {
      return this.messageType === "file" || this.messageType === "image";
    },
  },
  fileSize: {
    type: Number,
    required: function () {
      return this.messageType === "file" || this.messageType === "image";
    },
  },
  contentType: {
    type: String,
    required: function () {
      return this.messageType === "file" || this.messageType === "image";
    },
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Messages", messageSchema);

export default Message;
