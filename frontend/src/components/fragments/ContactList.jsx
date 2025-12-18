import {
  selectedChatData,
  setChatData,
  setChatMessages,
  setChatType,
} from "@/store/slices/chat-slices";

import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarImage } from "../ui/avatar";
import { splitName } from "./NewDm";
import { getColor } from "@/lib/utils";
import { selectedOnlineUser } from "@/store/slices/users-slices";

const ContactList = ({ contacts, isChannel = false }) => {
  const dispatch = useDispatch();
  const chatData = useSelector(selectedChatData);
  const onlineUser = useSelector(selectedOnlineUser);

  const handleClick = (contact) => {
    if (isChannel) {
      dispatch(setChatType("channel"));
    } else {
      dispatch(setChatType("contact"));
    }
    dispatch(setChatData(contact));
    if (chatData && chatData._id !== contact._id) {
      dispatch(setChatMessages([]));
    }
  };

  return (
    <div className="mt-5">
      {contacts?.map((contact) => (
        <div
          key={contact._id}
          className={`mx-2 my-1 px-2 sm:px-3 py-2 transition-all duration-200 cursor-pointer rounded-lg ${
            chatData && chatData._id === contact._id
              ? "bg-[#8417ff]/15 border-l-2 border-[#8417ff]"
              : "hover:bg-white/5"
          }`}
          onClick={() => handleClick(contact)}
        >
          <div className="flex items-center gap-2 sm:gap-3 text-white">
            {!isChannel && (
              <>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full relative flex-shrink-0">
                  <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
                    {contact.image ? (
                      <AvatarImage
                        src={contact.image}
                        alt="profile"
                        className="object-cover w-full h-full rounded-full"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`uppercase h-8 w-8 sm:h-9 sm:w-9 text-xs flex-center rounded-full ${getColor(
                          contact.color
                        )}`}
                      >
                        {contact.firstName && contact.lastName
                          ? splitName(contact.firstName, contact.lastName)
                          : contact.email.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  
                  {/* Online indicator */}
                  {onlineUser[contact._id] && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 border-2 border-[#1a1a2e] rounded-full"></div>
                  )}
                </div>
              </>
            )}
            {isChannel && (
              <div className="bg-[#8417ff]/20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-[#8417ff]/30 flex-shrink-0">
                <span className="text-xs sm:text-sm font-bold text-[#8417ff]">#</span>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {isChannel ? (
                <div className="flex flex-col">
                  <span className="truncate text-sm font-medium text-white">
                    {contact.name}
                  </span>
                  <span className="text-xs text-white/60">Channel</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-white truncate">
                    {contact.firstName
                      ? `${contact.firstName} ${contact.lastName}`
                      : contact.email}
                  </span>
                  <span className={`text-xs ${
                    onlineUser[contact._id] ? "text-green-400" : "text-gray-400"
                  }`}>
                    {onlineUser[contact._id] ? "Online" : "Offline"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
