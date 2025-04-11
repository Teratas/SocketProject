import { CircleUserRound, SquareUserRound, User, Users } from "lucide-react";
import { chatInterface } from "../mainPage/page";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Socket } from "socket.io-client";
export default function ShowChatCommand({
  myUserId,
  chats,
  chatState,
  handleClickChat,
  socket,
}: {
  handleClickChat: Function;
  chatState: number;
  chats: chatInterface[];
  myUserId: string;
  socket: Socket | null
}) {
  return (
    <Command className="bg-gray-700 text-white h-[90%]">
      <CommandInput className="" placeholder="Type to search Chat" />
      <CommandList className="h-full">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup className="h-full text-white" heading="All Chats">
          {chats.map((data, index) => {
            const chatName = data.isGroup
              ? data.name
              : data.participants[0]._id === myUserId
              ? data.participants[1].username
              : data.participants[0].username;

            if(data.isGroup){
              socket?.emit('join-room', data._id)
                // socket?.emit("join-room", {participantID : participant._id, roomID : data._id});
              
            }
            return (
              <CommandItem
                value={chatName}
                key={index}
                className={`h-[80px] flex flex-col justify-around bg-gray-600 rounded-xl mx-5 my-2 hover:bg-sky-500 ${
                  chatState === index ? "bg-sky-500" : ""
                } `}
              >
                <div
                  onClick={() => handleClickChat(index)}
                  className="flex w-full h-full  justify-between items-center"
                >
                  <div className="flex items-center justify-center w-[20%] h-16">
                    {data && data.isGroup ? (
                      <Users size={30} className="text-white size-10 " />
                    ) : (
                      <CircleUserRound
                        size={30}
                        className="text-white size-10 "
                      />
                    )}
                  </div>
                  <div className="w-[80%]">
                    <span className="font-bold text-2xl flex items-center">
                      {`${chatName}${
                        data.isGroup ? `(${data.participants.length})` : ""
                      }`}
                    </span>
                    <div className="flex w-full justify-between">
                      <span className=''>
                        {
                          (data.lastMessage && data.lastMessage.length > 15) ?"Long Messages..."  : data.lastMessage ?? "No Message"}
                      </span>
                      <span>
                        <span>
                          {(data.lastMessageAt) ? new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                              }).format(new Date(data.lastMessageAt)) : ""}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
    // <div className="h-[90%] overflow-y-scroll flex flex-col">
    //   {chats.map((data, index) => {
    //     return (
    //       <div
    //         key={index}
    //         className={`w-full flex flex-col items-center justify-center hover:bg-sky-500 ${
    //           chatState === index ? "bg-slate-100" : ""
    //         } `}
    //         onClick={() => handleClickChat(index)}
    //       >
    //         <span className="font-bold text-2xl h-[100px] flex items-center">
    //           {data.isGroup
    //             ? data.name
    //             : data.participants[0]._id === myUserId
    //             ? data.participants[1].username
    //             : data.participants[0].username}
    //         </span>
    //       </div>
    //     );
    //   })}
    // </div>
  );
}
