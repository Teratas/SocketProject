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
import { Dispatch, SetStateAction, useState } from "react";
import { getCookie } from "cookies-next/client";
import { chatInterface } from "../mainPage/page";



export default function ChangeGroupChatNameDialog({open, setOpen, currentName, chat, refreshKey, setRefreshKey, handleStatusMessage}
  :
  { open: boolean, setOpen : Dispatch<SetStateAction<boolean>>, currentName: string, chat: chatInterface, refreshKey: boolean;
    setRefreshKey: Dispatch<SetStateAction<boolean>>; handleStatusMessage: (message: string,
      sender: string,
      receiver: string,
      chatId: string,
      isGroup: boolean,
      type: string)=>(void)}) {
  const [name, setName] = useState<string>(currentName);
  const [isChanging, setIsChanging] = useState(false);
  const token = getCookie("token");
  const userId = getCookie("id");
  const handleChangeGroupName = async (name: string) => {
    if (isChanging) return;
    setIsChanging(true);
    try {
      const changeGroupNamedata = {
        chatID: chat._id,
        userID: userId!.toString(),
        newName: name
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/chats/change-name`,
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
      handleStatusMessage(`${currentName} has been changed to ${name}`, userId!.toString(), chat.participants[0]._id === userId
        ? chat.participants[1]._id
        : chat._id,
      chat._id,
      chat.isGroup, "status")
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
                onKeyDown={(e) => {
                  if (e.key === "Enter"){
                    e.preventDefault()
                    if (name !== currentName) {
                      handleChangeGroupName(name)
                    }
                  }
                }
              }
                value={name}
              />
            <Button className="bg-gray-500 border-gray-500"
            onClick={()=> handleChangeGroupName(name) } disabled={name === currentName}>Confirm</Button>
            </div>
          </DialogContent>
        </Dialog>
      );
}