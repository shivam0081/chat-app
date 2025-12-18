import MessageHeader from "../fragments/MessageHeader";
import MessageFragment from "../fragments/MessageFragment";
import MessageBar from "../fragments/MessageBar";

const ChatLayout = () => {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex flex-col md:border-l md:border-white/5 shadow-lg">
      <MessageHeader />
      <MessageFragment />
      <MessageBar />
    </div>
  );
};

export default ChatLayout;
