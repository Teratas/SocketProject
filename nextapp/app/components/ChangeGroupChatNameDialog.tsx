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



export default function ChangeGroupChatNameDialog({open, setOpen, defaultName, chatID, refreshKey, setRefreshKey}
  :
  { open: boolean, setOpen : any, defaultName: string, chatID: string, refreshKey: boolean;
    setRefreshKey: Function;}) {
  const [name, setName] = useState<string>(defaultName);
  const [isChanging, setIsChanging] = useState(false);
  const token = getCookie("token");
  const userId = getCookie("id");
  const handleChangeGroupName = async (name: string) => {
    if (isChanging) return;
    setIsChanging(true);

    try {
      const changeGroupNamedata = {
        chatID: chatID,
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
      setOpen(false);
      setRefreshKey(!refreshKey)
    } catch (error) {
      console.error("Error changing name:", error);
    } finally {
      setIsChanging(false);
    }
  };
  return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-500 border-gray-500">Change Group Name</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Group Name</DialogTitle>
            </DialogHeader>
            <div className="">
            <Input
                type="text"
                className="my-5"
                placeholder={defaultName}
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            <Button className="bg-gray-500 border-gray-500"
            onClick={()=> handleChangeGroupName(name) } disabled={name === defaultName}>Confirm</Button>
            </div>
          </DialogContent>
        </Dialog>
      );
}