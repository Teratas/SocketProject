"use client"

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
  } from "@/components/ui/dialog";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { getCookie } from "cookies-next/client";
import { messageInterface } from "../mainPage/page";



export default function UnsendMessageDialog({open, setOpen, message, refreshKey, setRefreshKey}
  :
  { open: boolean, setOpen : Dispatch<SetStateAction<boolean>>, message: messageInterface, refreshKey: boolean;
    setRefreshKey: Dispatch<SetStateAction<boolean>>}) {
  const [isChanging, setIsChanging] = useState(false);
  const token = getCookie("token");
  const userId = getCookie("id");
  const handleUnsendMessage = async () => {
    if (isChanging) return;
    setIsChanging(true);
    console.log(message)
    try {
      const unsendMessagedata = {
        userID: userId,
        messageID: message._id
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/messages/unsend-message`,
        unsendMessagedata,
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

      setOpen(false);
      setRefreshKey(!refreshKey)
    } catch (error) {
      console.error("Error unsending message:", error);
    } finally {
      setIsChanging(false);
    }
  };
  return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unsend Message?</DialogTitle>
            </DialogHeader>
            <div>
                {message.message}
            </div>
            <Button className="bg-gray-500 border-gray-500"
            onClick={()=>{ 
                console.log(message.sender._id, typeof(message.sender._id))
                handleUnsendMessage()
                }
            }>Confirm</Button>
          </DialogContent>
        </Dialog>
      );
}