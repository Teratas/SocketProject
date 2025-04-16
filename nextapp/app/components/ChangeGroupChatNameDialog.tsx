"use client"

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";
import { getCookie } from "cookies-next/client";
import { MessageType } from "../mainPage/page";



export default function ChangeGroupChatNameDialog({open, setOpen, currentName, chat, refreshKey, setRefreshKey, handleStatusMessage}
  :
  { open: boolean, setOpen : any, currentName: string, chat: any, refreshKey: boolean;
    setRefreshKey: Function; handleStatusMessage: Function}) {
  const [name, setName] = useState<string>(currentName);
  const [isChanging, setIsChanging] = useState(false);
  const token = getCookie("token");
  const userId = getCookie("id");
  const handleChangeGroupName = async (name: string) => {
    if (isChanging) return;
    setIsChanging(true);
    console.log(chat.participantsUsername)
    try {
      const changeGroupNamedata = {
        chatID: chat._id,
        userID: userId,
        newName: name
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chats/change-name`,
        changeGroupNamedata,
        {
          headers : {
            bearer : token
          }
        }
      );

      if (response.data.success === false) {
        alert(response.data.message);
        return;
      }

      console.log("chat res", response);
      handleStatusMessage(`${currentName} has been changed to ${name}`, userId, chat.participants[0]._id === userId
        ? chat.participants[1]._id
        : chat._id,
      chat._id,
      chat.isGroup, MessageType.STATUS)
      setOpen(false);
      setRefreshKey(!refreshKey)
      setName(name)
    } catch (error) {
      console.error("Error changing name:", error);
    } finally {
      setIsChanging(false);
    }
  };
  return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-500 border-gray-500" onClick={()=>{
              currentName = chat.name
              setName(chat.name)
              console.log(chat.name, currentName)
              }}>Change Group Name</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Group Name</DialogTitle>
            </DialogHeader>
            <div className="">
            <Input
                type="text"
                className="my-5"
                placeholder={currentName}
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            <Button className="bg-gray-500 border-gray-500"
            onClick={()=> handleChangeGroupName(name) } disabled={name === currentName}>Confirm</Button>
            </div>
          </DialogContent>
        </Dialog>
      );
}