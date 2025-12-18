import { selectedUserData } from "@/store/slices/auth-slices";
import {
  selectedChatData,
  selectedChatMessage,
  selectedChatType,
  setChatMessages,
  setFileDownloadingProgress,
  setIsDownloading,
} from "@/store/slices/chat-slices";
import { HOST } from "@/utils/constant";
import { Download, FileArchive, FileText, Music2, Play, X } from "lucide-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ImageModal from "./media/ImageModal";
import VideoModal from "./media/VideoModal";
import MusicModal from "./media/MusicModal";
import axios from "axios";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { splitName } from "./NewDm";
import { getColor } from "@/lib/utils";

const MessageFragment = () => {
  const fragmentRef = useRef();
  const dispatch = useDispatch();
  const chatType = useSelector(selectedChatType);
  const chatData = useSelector(selectedChatData);
  const userData = useSelector(selectedUserData);
  const chatMessages = useSelector(selectedChatMessage);
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showMusic, setShowMusic] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");

  useEffect(() => {
    if (fragmentRef.current) {
      fragmentRef.current.scrollTop = fragmentRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await fetch(HOST + "/api/messages/get-messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: chatData._id }),
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.errors);
        }

        if (data.messages) {
          dispatch(setChatMessages(data.messages));
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    const getChannelMessage = async () => {
      try {
        const res = await fetch(
          HOST + "/api/channel/get-channel-messages/" + chatData._id,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();

        if (res.ok) {
          dispatch(setChatMessages(data.messages));
        }else{
          throw new Error(data.errors)
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (chatData._id) {
      if (chatType === "contact") {
        getMessages();
      } else if (chatType === "channel") {
        getChannelMessage();
      }
    }
  }, [chatType, chatData]);

  ////////////////////

  const checkIfImage = (message) => {
    // Check by contentType first, fallback to URL extension
    if (message.contentType || message.fileType) {
      return (message.contentType || message.fileType).startsWith('image/');
    }
    // Fallback to URL check for backward compatibility
    const imageRegex =
      /\.(jpg|jpeg|png|gif|svg|tif|ico|heif|heic|bmp|webp|tiff)$/i;
    return imageRegex.test(message.fileUrl);
  };

  const checkIfVideo = (message) => {
    // Check by contentType first, fallback to URL extension
    if (message.contentType || message.fileType) {
      return (message.contentType || message.fileType).startsWith('video/');
    }
    // Fallback to URL check for backward compatibility
    const videoRegex = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv|mpeg|mpg|3gp)$/i;
    return videoRegex.test(message.fileUrl);
  };

  const checkIfMusic = (message) => {
    // Check by contentType first, fallback to URL extension
    if (message.contentType || message.fileType) {
      return (message.contentType || message.fileType).startsWith('audio/');
    }
    // Fallback to URL check for backward compatibility
    const musicRegex = /\.(mp3|wav|ogg|flac|aac|wma|m4a|aiff|alac)$/i;
    return musicRegex.test(message.fileUrl);
  };

  const checkIfDocument = (message) => {
    // Check by contentType first, fallback to URL extension
    if (message.contentType || message.fileType) {
      const contentType = message.contentType || message.fileType;
      return contentType.includes('pdf') || 
             contentType.includes('document') || 
             contentType.includes('text') ||
             contentType.includes('spreadsheet') ||
             contentType.includes('presentation');
    }
    // Fallback to URL check for backward compatibility
    const documentRegex = /\.(pdf|docx?|xlsx?|pptx?|txt|csv)$/i;
    return documentRegex.test(message.fileUrl);
  };

  const checkIfArchive = (message) => {
    // Check by contentType first, fallback to URL extension
    if (message.contentType || message.fileType) {
      const contentType = message.contentType || message.fileType;
      return contentType.includes('zip') || 
             contentType.includes('archive') ||
             contentType.includes('compressed');
    }
    // Fallback to URL check for backward compatibility
    const archiveRegex = /\.(rar|zip|7z|tar|gz|bz2)$/i;
    return archiveRegex.test(message.fileUrl);
  };

  // Helper function to get filename from message
  const getFileName = (message) => {
    // Use fileName property if available, otherwise extract from URL
    if (message.fileName) {
      return message.fileName;
    }
    // Fallback for older messages - extract from URL
    return message.fileUrl.split('/').pop().split('?')[0];
  };

  ////////////////

  const handleDownloadFile = async (fileUrl) => {
    dispatch(setFileDownloadingProgress(0));
    try {
      dispatch(setIsDownloading(true));
      const res = await axios.get(fileUrl, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;

          const percentComplated = Math.round((loaded * 100) / total);

          dispatch(setFileDownloadingProgress(percentComplated));
        },
      });

      const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileUrl.split("-").pop();
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("There was an error downloading the file:", error);
    } finally {
      dispatch(setIsDownloading(false));
    }
  };

  const renderMessages = () => {
    let lastDate = null;

    return chatMessages.map((message, index) => {
      const messageDate = moment(message.timeStamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-sm text-gray-500 my-2">
              {moment(message.timeStamp).format("LL")}
            </div>
          )}
          {chatType === "contact" && renderDmMessages(message)}
          {chatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const renderDmMessages = (message) => (
    <div
      className={`${
        message.sender === chatData._id ? "text-left" : "text-right"
      } mt-1`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender !== chatData._id
              ? "bg-[#8417ff] text-white"
              : "bg-[#2e2b33]/80 text-white"
          } inline-block px-4 py-2.5 text-sm rounded-2xl my-1 max-w-[70%] sm:max-w-[60%] md:max-w-[50%] break-words transition-all duration-200 shadow-sm backdrop-blur-sm`}
        >
          {message.content}
        </div>
      )}
      {(message.messageType === "file" || message.messageType === "image") && (
        <div
          className={`${
            message.sender !== chatData._id
              ? "bg-[#8417ff]/15 text-[#8417ff]/95 shadow-md shadow-[#8417ff]/10"
              : "bg-[#2e2b33]/30 text-white/90 shadow-md shadow-black/10"
          } inline-block p-4 rounded-xl my-1 max-w-[70%] md:max-w-[100%] lg:max-w-[50%] break-wordss backdrop-blur-sm transition-all duration-200 hover:shadow-lg`}
        >
          {(checkIfImage(message) || message.messageType === "image") && (
            <div
              className="group cursor-pointer relative overflow-hidden rounded-xl max-w-[280px]"
              onClick={() => {
                setShowImage(true);
                setImageUrl(message.fileUrl);
              }}
            >
              <img 
                src={message.fileUrl} 
                alt={message.fileName || "image"} 
                className="w-full h-auto max-h-[300px] object-cover rounded-xl transition-all duration-300 group-hover:scale-105"
              />
              
              {/* Overlay with zoom indicator */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-xl">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
              
              {/* Image info */}
              {message.fileName && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                  <p className="text-xs text-white/90 truncate font-medium">
                    {message.fileName}
                  </p>
                  {message.fileSize && (
                    <p className="text-xs text-white/60">
                      {(message.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          {checkIfVideo(message) && (
            <div
              className="relative cursor-pointer group overflow-hidden rounded-xl max-w-[280px]"
              onClick={() => {
                setShowVideo(true);
                setVideoUrl(message.fileUrl);
              }}
            >
              <video width={280} height={200} className="rounded-xl">
                <source src={message.fileUrl} type="video/mp4" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all duration-300 rounded-xl">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <Play className="text-white w-8 h-8" />
                </div>
              </div>
            </div>
          )}
          {checkIfMusic(message) && (
            <div
              className="relative bg-gradient-to-br from-[#8417ff]/20 to-purple-600/20 border border-[#8417ff]/30 rounded-xl p-6 cursor-pointer group hover:from-[#8417ff]/30 hover:to-purple-600/30 transition-all duration-300 min-w-[200px]"
              onClick={() => {
                setShowMusic(true);
                setMusicUrl(message.fileUrl);
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="bg-[#8417ff]/20 rounded-full p-3 group-hover:bg-[#8417ff]/30 transition-colors">
                    <Music2 className="text-[#8417ff] w-8 h-8" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="text-white w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {getFileName(message)}
                  </p>
                  <p className="text-xs text-gray-400">Audio file</p>
                </div>
              </div>
            </div>
          )}

          {checkIfDocument(message) && (
            <div className="flex items-center gap-4 bg-gray-800/50 border border-gray-600 rounded-xl p-4 max-w-[280px] group hover:bg-gray-700/50 transition-all duration-300">
              <div className="flex-shrink-0 bg-blue-500/20 rounded-lg p-3">
                <FileText className="text-blue-400 w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {getFileName(message)}
                </p>
                <p className="text-xs text-gray-400">Document</p>
              </div>
              <button
                onClick={() => handleDownloadFile(message.fileUrl)}
                className="flex-shrink-0 bg-gray-700 hover:bg-[#8417ff] p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
              >
                <Download className="text-white w-4 h-4" />
              </button>
            </div>
          )}

          {checkIfArchive(message) && (
            <div className="flex items-center gap-4 bg-gray-800/50 border border-gray-600 rounded-xl p-4 max-w-[280px] group hover:bg-gray-700/50 transition-all duration-300">
              <div className="flex-shrink-0 bg-yellow-500/20 rounded-lg p-3">
                <FileArchive className="text-yellow-400 w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {getFileName(message)}
                </p>
                <p className="text-xs text-gray-400">Archive</p>
              </div>
              <button
                onClick={() => handleDownloadFile(message.fileUrl)}
                className="flex-shrink-0 bg-gray-700 hover:bg-[#8417ff] p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
              >
                <Download className="text-white w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-600">
        {moment(message.timeStamp).format("LT")}
      </div>
    </div>
  );

  const renderChannelMessages = (message) => {
    return (
      <div
        className={`mt-5 ${
          message.sender._id !== userData._id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender !== chatData._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2e2b33]/5 text-white/80 border-[#ffffff]/20"
            } border wore inline-block p-2.5 text-sm rounded my-1 max-w-[50%] break-wordss `}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id !== userData._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2e2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[70%] md:max-w-[100%] lg:max-w-[50%] break-wordss`}
          >
            {checkIfImage(message) && (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(message.fileUrl);
                }}
              >
                <img
                  src={message.fileUrl}
                  height={200}
                  width={200}
                  alt="image"
                />
              </div>
            )}
            {checkIfVideo(message) && (
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  setShowVideo(true);
                  setVideoUrl(message.fileUrl);
                }}
              >
                <video width={220} height={220}>
                  <source src={message.fileUrl} type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <Play className="text-white w-5 h-5" />
                </div>
              </div>
            )}
            {checkIfMusic(message) && (
              <div
                className="relative bg-none flex-center flex-col cursor-pointer"
                onClick={() => {
                  setShowMusic(true);
                  setMusicUrl(message.fileUrl);
                }}
              >
                <div>
                  <Music2
                    className="bg-none text-[#8417ff]"
                    width={50}
                    height={50}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center  bg-opacity-50">
                  <Play className="text-white w-5 h-5" />
                </div>
                <span className="text-sm mt-5">
                  {getFileName(message)}
                </span>
              </div>
            )}

            {checkIfDocument(message) && (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/8- text-3xl bg-black/20 rounded-full p-3">
                  <FileText height={16} width={16} />
                </span>
                <span className="text-sm">
                  {getFileName(message)}
                </span>
                <span
                  onClick={() => handleDownloadFile(message.fileUrl)}
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                >
                  <Download height={16} width={16} />
                </span>
              </div>
            )}

            {checkIfArchive(message) && (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/8- text-3xl bg-black/20 rounded-full p-3">
                  <FileArchive height={16} width={16} />
                </span>
                <span className="text-sm">
                  {getFileName(message)}
                </span>
                <span
                  onClick={() => handleDownloadFile(message.fileUrl)}
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                >
                  <Download height={16} width={16} />
                </span>
              </div>
            )}
          </div>
        )}
        {message.sender._id !== userData._id ? (
          <div className="flex items-center mt-1 justify-start gap-3">
            <Avatar className="w-8 h-8 ">
              {message.sender.image && (
                <AvatarImage
                  src={message.sender.image}
                  alt="profile"
                  className="object-cover w-full rounded-full h-full bg-black"
                  loading="lazy"
                />
              )}
              <AvatarFallback
                className={`uppercase h-8 w-8 flex-center text-xs  flex-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName && message.sender.lastName
                  && splitName(message.sender.firstName, message.sender.lastName)}
                
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
            <span className="text-xs text-white/60">
              {moment(message.timeStamp).format("LT")}
            </span>
          </div>
        ) : (
          <span className="text-xs block text-white/60 mt-1">
            {moment(message.timeStamp).format("LT")}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={fragmentRef}
      className="flex-1 overflow-y-auto p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full"
    >
      {renderMessages()}

      {showImage && (
        <ImageModal
          setShowImage={setShowImage}
          setImageUrl={setImageUrl}
          imageUrl={imageUrl}
          handleDownloadFile={handleDownloadFile}
        />
      )}
      {showVideo && (
        <VideoModal
          setShowVideo={setShowVideo}
          videoUrl={videoUrl}
          handleDownloadFile={handleDownloadFile}
          setVideoUrl={setVideoUrl}
        />
      )}
      {showMusic && (
        <MusicModal
          setShowMusic={setShowMusic}
          musicURl={musicUrl}
          handleDownloadFile={handleDownloadFile}
          setMusicUrl={setMusicUrl}
        />
      )}
    </div>
  );
};

export default MessageFragment;
