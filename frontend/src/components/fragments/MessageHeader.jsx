import { useDispatch, useSelector } from "react-redux";
import { Avatar } from "@radix-ui/react-avatar";
import { X, ArrowLeft } from "lucide-react";
import { closeChat, setChatData } from "@/store/slices/chat-slices";
import { AvatarImage } from "../ui/avatar";
import { splitName } from "./NewDm";
import { getColor } from "@/lib/utils";

const MessageHeader = () => {
  const dispatch = useDispatch();
  const chatData = useSelector((state) => state.chat.chatData);
  const chatType = useSelector((state) => state.chat.chatType);
  const onlineUsers = useSelector((state) => state.users.onlineUsers);

  return (
    <div className="h-[8vh] sm:h-[10vh] border-b border-white/5 flex items-center py-2 px-3 sm:px-6 md:px-8 bg-[#1c1d25]/80 backdrop-blur-sm">
      <div className="flex gap-3 sm:gap-4 items-center w-full justify-between">
        <div className="flex gap-2 sm:gap-3 items-center justify-center">
          {/* Mobile back button */}
          <button
            onClick={() => {
              dispatch(setChatData(undefined));
              dispatch(closeChat());
            }}
            className="md:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full relative">
            {chatType === "contact" ? (
              <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                {chatData.image ? (
                  <AvatarImage
                    src={chatData.image}
                    alt="profile"
                    className="object-cover w-full rounded-full h-full bg-black"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`uppercase h-9 w-9 sm:h-10 sm:w-10 text-xs flex-center rounded-full ${getColor(
                      chatData.color
                    )}`}
                  >
                    {chatData.firstName && chatData.lastName
                      ? splitName(chatData.firstName, chatData.lastName)
                      : chatData.email.charAt(0)}
                  </div>
                )}
              </Avatar>
            ) : (
              <div className="bg-[#8417ff]/20 h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg border border-[#8417ff]/30">
                <span className="text-sm font-bold text-[#8417ff]">#</span>
              </div>
            )}
          </div>
          {chatType === "contact" ? (
            <div className="flex items-start justify-center flex-col">
              <span className="font-medium text-sm text-white">
                {chatData.firstName && chatData.lastName
                  ? `${chatData.firstName} ${chatData.lastName}`
                  : chatData.email}
              </span>
              <span className={`text-xs ${onlineUsers[chatData._id] ? "text-green-400" : "text-gray-400"}`}>
                {onlineUsers[chatData._id] ? (
                  <span className="tracking-wide flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Online
                  </span>
                ) : (
                  <span className="tracking-wide flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    Offline
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="font-medium text-sm text-white">{chatData.name}</span>
              <span className="text-xs text-white/60">Channel</span>
            </div>
          )}
        </div>
        <div className="flex-center gap-3 sm:gap-5">
          <button
            onClick={() => {
              dispatch(setChatData(undefined));
              dispatch(closeChat());
            }}
            className="text-neutral-500 hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-white/10 focus:border-none focus:outline-none duration-200 transition-all"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;
