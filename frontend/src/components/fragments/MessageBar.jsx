import { useSocket } from "@/contexts/SocketContext";
import { selectedUserData } from "@/store/slices/auth-slices";
import {
  addMessage,
  selectedChatData,
  selectedChatMessage,
  selectedChatType,
  setFileUploadingProgress,
  setIsUploading,
} from "@/store/slices/chat-slices";
import { HOST } from "@/utils/constant";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { Paperclip, SendHorizonal, Sticker, Image, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

const MessageBar = () => {
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const chatData = useSelector(selectedChatData);
  const chatType = useSelector(selectedChatType);
  const userData = useSelector(selectedUserData);
  const socket = useSocket();
  const [isEmojiPicker, setIsEmojiPicker] = useState(false);
  const dispatch = useDispatch();

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    if (message.length !== 0) {
      if (chatType === "contact") {
        socket.emit("sendMessage", {
          sender: userData._id,
          recipient: chatData._id,
          messageType: "text",
          content: message,
          fileUrl: undefined,
        });
      } else if (chatType === "channel") {
        socket.emit("sendMessage-channel", {
          sender: userData._id,
          content: message,
          messageType: "text",
          fileUrl: undefined,
          channelId: chatData._id,
        });
      }
    }

    setMessage("");
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleAttachmentChange = async (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5 MB dalam bytes

    if (file && file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    if (file) {
      dispatch(setIsUploading(true));
      dispatch(setFileUploadingProgress(0));
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          HOST + "/api/messages/upload-file",
          formData,
          {
            withCredentials: true,
            onUploadProgress: (event) => {
              const progress = Math.round((event.loaded * 100) / event.total);

              dispatch(setFileUploadingProgress(progress));
            },
          }
        );

        if (res.status === 200) {
          if (chatType === "contact") {
            socket.emit("sendMessage", {
              sender: userData._id,
              recipient: chatData._id,
              messageType: "file",
              content: undefined,
              fileUrl: res.data.filePath,
              fileName: res.data.data?.fileName,
              fileSize: res.data.data?.fileSize,
              contentType: res.data.data?.contentType,
            });
          } else if (chatType === "channel") {
            socket.emit("sendMessage-channel", {
              sender: userData._id,
              content: undefined,
              messageType: "file",
              fileUrl: res.data.filePath,
              fileName: res.data.data?.fileName,
              fileSize: res.data.data?.fileSize,
              contentType: res.data.data?.contentType,
              channelId: chatData._id,
            });
          }
        }
      } catch (error) {
        toast.error("Upload failed.");
      } finally {
        dispatch(setIsUploading(false));
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageUpload = async (imageData) => {
    try {
      // Send image message using socket
      if (chatType === "contact") {
        socket.emit("sendMessage", {
          sender: userData._id,
          recipient: chatData._id,
          messageType: "image",
          content: undefined,
          fileUrl: imageData.url,
          fileName: imageData.fileName,
          fileSize: imageData.fileSize,
          contentType: imageData.contentType,
        });
      } else if (chatType === "channel") {
        socket.emit("sendMessage-channel", {
          sender: userData._id,
          content: undefined,
          messageType: "image",
          fileUrl: imageData.url,
          fileName: imageData.fileName,
          fileSize: imageData.fileSize,
          contentType: imageData.contentType,
          channelId: chatData._id,
        });
      }
      
      setShowImageUpload(false);
      toast.success("Image sent successfully!");
    } catch (error) {
      toast.error("Failed to send image.");
    }
  };

  useEffect(() => {
    const handleClickOutSide = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setIsEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutSide);

    return () => document.removeEventListener("mousedown", handleClickOutSide);
  }, [isEmojiPicker]);

  return (
    <div className="h-[6vh] sm:h-[7vh] z-30 bg-[#1c1d25] flex-center px-3 sm:px-6 md:px-8 mb-2 gap-3 sm:gap-4 border-t border-white/5">
      <div className="flex-1 flex bg-[#2a2b33] rounded-lg items-center gap-2 sm:gap-3 pr-3 sm:pr-4 shadow-sm">
        <input
          type="text"
          className="w-full p-2 sm:p-2.5 text-sm bg-transparent rounded-md focus:border-none focus:outline-none text-white caret-[#8417ff] placeholder:text-white/40"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleAttachmentClick}
          className="text-neutral-400 hover:text-white rounded p-1.5 sm:p-2 focus:border-none focus:outline-none hover:bg-white/10 duration-200 transition-all"
          title="Attach File"
        >
          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <button
          onClick={() => setShowImageUpload(true)}
          className="text-neutral-400 hover:text-white rounded p-1.5 sm:p-2 focus:border-none focus:outline-none hover:bg-white/10 duration-200 transition-all"
          title="Upload Image"
        >
          <Image className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <input
          type="file"
          id="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            onClick={() => setIsEmojiPicker(true)}
            aria-label="emoji picker"
            className="text-neutral-400 hover:text-white rounded p-1.5 sm:p-2 focus:border-none focus:outline-none hover:bg-white/10 duration-200 transition-all"
          >
            <Sticker className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div
            className="absolute bottom-12 -right-20 sm:right-0"
            ref={emojiRef}
          >
            <EmojiPicker
              theme="dark"
              open={isEmojiPicker}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
              searchDisabled={true}
            />
          </div>
        </div>
      </div>
      <button
        onClick={handleSendMessage}
        aria-label="send message"
        className="bg-[#8417ff] rounded-lg flex-center p-2 sm:p-2.5 hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duration-200 transition-all shadow-md min-w-[40px] sm:min-w-[44px]"
      >
        <SendHorizonal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
      
      {/* Enhanced Image Upload Modal */}
      {showImageUpload && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={() => setShowImageUpload(false)}
        >
          <div 
            className="bg-[#1e1f25] border border-gray-700 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl transform animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#8417ff]/10 rounded-lg">
                  <Image className="w-5 h-5 text-[#8417ff]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Share an Image</h3>
                  <p className="text-sm text-gray-400">Upload and send an image to the chat</p>
                </div>
              </div>
              <button
                onClick={() => setShowImageUpload(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <ImageUpload 
              onImageUpload={handleImageUpload}
              disabled={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBar;
