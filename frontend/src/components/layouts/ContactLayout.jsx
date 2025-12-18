import React, { useEffect } from "react";
import Logo from "../ui/logo";
import Title from "../elements/Title";
import ProfileInfo from "../fragments/ProfileInfo";
import NewDm from "../fragments/NewDm";
import { HOST } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import {
  selectedChannels,
  selectedDirectMessageContacts,
  selectedTrigger,
  setChannel,
  setDirectMessagerContact,
} from "@/store/slices/chat-slices";
import ContactList from "../fragments/ContactList";
import Channel from "../fragments/Channel";
import { toast } from "sonner";
import { selectedUserData,setUserData } from "@/store/slices/auth-slices";

const ContactLayout = () => {
  const directMessageContaacts = useSelector(selectedDirectMessageContacts);
  const dispatch = useDispatch();
  const channel = useSelector(selectedChannels);
  const trigger = useSelector(selectedTrigger);
  const userData = useSelector(selectedUserData);

  useEffect(() => {
    const getContact = async () => {
      const contactLS = JSON.parse(localStorage.getItem("contact"));

      if (contactLS) {
        dispatch(setDirectMessagerContact(contactLS));
      }
      try {
        const res = await fetch(HOST + "/api/contacts/get-contact-for-dm", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.errors);
        }

        if (data.contacts) {
          dispatch(setDirectMessagerContact(data.contacts));
          localStorage.setItem("contact", JSON.stringify(data.contacts));
        }
      } catch (error) {
        dispatch(setUserData(undefined))
        toast.error(error.message);
      }
    };

    const getChannel = async () => {
      const channelLS = JSON.parse(localStorage.getItem("channel"));

      if (channelLS) {
        dispatch(setChannel(channelLS));
      }
      try {
        const res = await fetch(HOST + "/api/channel/get-channel", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.errors);
        }

        if (data.channel) {
          dispatch(setChannel(data.channel));

          localStorage.setItem("channel", JSON.stringify(data.channel));
        }
      } catch (error) {
        dispatch(setUserData(undefined))
        toast.error(error.message);
      }
    };

    getContact();
    getChannel();
  }, [userData, selectedChannels, selectedDirectMessageContacts, trigger]);

  return (
    <div className="relative w-full h-screen md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1a1a2e] md:border-r md:border-white/5">
      {/* Simplified background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/2 to-transparent pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full">
        <div className="border-b border-white/5">
          <Logo />
        </div>
        
        <div className="my-4 px-2">
          <div className="flex-between pr-6 mb-3">
            <Title text="Direct Messages" />
            <NewDm />
          </div>
          <div className="max-h-[30vh] xs:max-h-[38vh] overflow-y-auto scroll-h">
            <ContactList contacts={directMessageContaacts} />
          </div>
        </div>
        
        <div className="my-4 px-2">
          <div className="flex-between pr-6 mb-3">
            <Title text="Channels" />
            <Channel />
          </div>
          <div className="max-h-[25vh] xs:max-h-[38vh] overflow-y-auto scrollbar-hidden">
            <ContactList contacts={channel} isChannel={true} />
          </div>
        </div>
        
        <ProfileInfo />
      </div>
    </div>
  );
};

export default ContactLayout;
