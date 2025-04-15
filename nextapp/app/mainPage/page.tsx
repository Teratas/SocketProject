"use client";
import { getCookie, setCookie } from "cookies-next/client";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../components/SocketProvider";
import axios from "axios";
import { signOut } from "next-auth/react";
import CreateGroupCommand from "../components/CreateGroupCommand";
import ShowChatCommand from "../components/ShowChatCommand";
import { LogOut, SendHorizontal, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ChangeGroupChatNameDialog from "../components/ChangeGroupChatNameDialog";
export interface stateInterface {
  success: boolean;
  msg: string;
  data: Record<string, { username: string; socketID: string }> | string;
  type: string;
}
interface participantsInterface {
  _id: string;
  username: string;
}
export interface chatInterface {
  createdAt: string;
  isGroup: boolean;
  name: string;
  participants: Array<participantsInterface>;
  updatedAt: string;
  _id: string;
  lastMessage: string;
  lastMessageAt: string;
}
export interface messageInterface {
  chatId: string;
  sender: { username: string; _id: string };
  receiver: { username: string; _id: string };
  message: string;
  isGroup: boolean;
  timestamp: string;
}
export default function MainPage() {
  const { socketInstance: socket, connectedPeer } = useSocket();
  const [myUserId, setMyUserId] = useState<string>("");
  const [chats, setChats] = useState<chatInterface[]>([]);
  const [chatState, setChatState] = useState<number>(-1);
  const yourUsername = getCookie("username");
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const currentMessageRef = useRef<HTMLDivElement | null>(null);
  const [currentChatMessages, setCurrentChatMessages] = useState<
    Array<messageInterface>
  >([]);
  const [refreshKey, setRefreshKey] = useState<boolean>(false);

  const [allChatState, setAllChatState] = useState<number>(-1);
  const [allGroupChat, setAllGroupChat] = useState<chatInterface[]>([]);

  useEffect(() => {
    const handleFetchAllGroupChat = async () => {
      const userID = getCookie("id");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chats/getGroupMessageChat`,
        {
          userID: userID,
        },
        {
          headers: {
            bearer: token,
          },
        }
      );
      // console.log('res all group chat', res)
      setAllGroupChat(res.data);
    };
    handleFetchAllGroupChat();
  }, []);
  const handleClickChat = async (index: number) => {
    const chat = chats[index];
    const messages = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/messages/get-messages?chatId=` +
        chat._id,
      {
        headers: {
          bearer: token,
        },
      }
    );
    setCurrentChatMessages(messages.data.data);

    setCurrentMessage("");
    setChatState(index);
    setAllChatState(-1);
  };
  useEffect(() => {
    const handleUpdateChat = (chat: chatInterface) => {
      console.log(0);
      if (chat) {
        const userID = getCookie("id") as string;
        const username = getCookie("username") as string;
        console.log(1);
        console.log('received update-chat', chat)
        console.log('user' , {username, _id: userID})
        if (chat.participants.some((p) => p.username === username && p._id === userID)) {
          console.log("2");
          setChats((prevChats) => {
            const index = prevChats.findIndex(
              (oldChat) => oldChat._id === chat._id
            );
            if (index > -1) {
              return [
                ...prevChats.slice(0, index),
                chat,
                ...prevChats.slice(index + 1),
              ];
            } else {
              return [...prevChats, chat];
            }
          });
        }else{
          console.log(3)
          setAllGroupChat(prevGroupChats => {
            const index = prevGroupChats.findIndex((oldGroup) => oldGroup._id === chat._id)
            if(index > -1){
              return [
                ...prevGroupChats.slice(0, index),
                chat,
                ...prevGroupChats.slice(index + 1)
              ]
            }else{
              return [...prevGroupChats, chat]
            }
          })
        }
      } else setRefreshKey((prevKey) => !prevKey);
    };

    socket?.on("update-chat", handleUpdateChat);

    return () => {
      socket?.off("update-chat", handleUpdateChat);
    };
  }, [socket]);
  useEffect(() => {
    if (currentMessageRef.current) {
      currentMessageRef.current.scrollIntoView({
        behavior: "instant",
        block: "start",
        inline: "nearest",
      });
    }
  }, [currentChatMessages]);
  useEffect(() => {
    const handleFetchDirectChat = async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chats/getDirectMessageChat`,
        {
          userID: id,
        },
        {
          headers: {
            bearer: token,
          },
        }
      );
      setChats(res?.data?.chats);
    };
    const id = getCookie("id");
    if (id) {
      console.log("refresh");
      if (!myUserId) setMyUserId(id);
      handleFetchDirectChat();
    }
  }, [refreshKey]);
  useEffect(() => {
    const handleUserJoined = ({
      participants,
      chatID,
    }: {
      participants: { _id: string; username: string }[];
      chatID: string;
    }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === chatID) {
            return {
              ...chat,
              participants: participants,
            };
          }
          return chat;
        })
      );
    };

    socket?.on("user-joined", handleUserJoined);

    return () => {
      socket?.off("user-joined", handleUserJoined);
    };
  }, [socket]);
  useEffect(() => {
    const handleReceiveMessage = (message: messageInterface) => {
      if (
        chatState > -1 &&
        chats[chatState] &&
        message.chatId === chats[chatState]._id
      ) {
        setCurrentChatMessages((prevState) => [...prevState, message]);
      }

      const indexChat = chats.findIndex((chat) => chat._id === message.chatId);

      if (indexChat === -1) return;

      const chatsCopy = [...chats];
      const [updatedChat] = chatsCopy.splice(indexChat, 1);
      console.log("message group check", message);
      updatedChat.lastMessage = message.message;
      updatedChat.lastMessageAt = message.timestamp;
      chatsCopy.unshift(updatedChat);
      setChats(chatsCopy);
      // if (indexChat < chatState) {
      //   return;
      // } else if (
      //   indexChat !== -1 &&
      //   indexChat === chatState &&
      //   message.sender._id === myUserId
      // ) {
      //   setChatState(0);
      // } else if (
      //   chatState > -1 &&
      //   indexChat > 0 &&
      //   chatsCopy.length > 1 &&
      //   message.sender._id !== myUserId &&
      //   indexChat !== chatState
      // ) {
      //   setChatState((prev) => prev + 1);
      // }
      if (chatState > -1) {
        const newChatState = chatsCopy.findIndex(
          (chat) => chat._id === chats[chatState]._id
        );
        setChatState(newChatState);
      }
    };

    socket?.on("receive-message", handleReceiveMessage);
    return () => {
      socket?.off("receive-message", handleReceiveMessage);
    };
  }, [chatState, chats, socket]);
  const token = getCookie("token") as string;
  const [open, setOpen] = useState<boolean>(false);
  const [changeChatNameOpen, setChangeChatNameOpen] = useState<boolean>(false);
  const clickUserToCreateChat = async (username: string) => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/user` + "?username=" + username,
      {
        headers: {
          bearer: token,
        },
      }
    );
    const userId = res.data._id;

    const confirm = window.confirm(
      "Do you want to create chat with this user?"
    );
    if (confirm) {
      const data = {
        isGroup: false,
        participants: [myUserId, userId],
        name: "",
        participantsUsername: [username, yourUsername],
        userID: myUserId,
      };
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chats/create-chat`,
        data,
        {
          headers: {
            bearer: token,
          },
        }
      );
      console.log("res create chat", res);
      if (!res.data.success) {
        alert(res.data.message);
      } else setOpen(false);
    }
  };
  const handleSendMessage = (
    message: string,
    sender: string,
    receiver: string,
    chatId: string,
    isGroup: boolean
  ) => {
    const messageData = {
      message,
      sender,
      receiver,
      chatId,
      isGroup: isGroup,
    };
    socket?.emit("direct-message", messageData);
    setCurrentMessage("");
  };
  const handleJoinGroup = async () => {
    const apiURL = `${process.env.NEXT_PUBLIC_BASE_URL}/chats/join-group-chat`;
    const chatID = allGroupChat[allChatState]._id;
    const userID = myUserId;
    const joinGroupData = {
      chatID,
      userID,
    };
    const newGroupChatResponse = await axios.post(apiURL, joinGroupData, {
      headers: {
        bearer: token,
      },
    });
    console.log("newGroupChatResponse", newGroupChatResponse);
    if (newGroupChatResponse.data.success) {
      const joinedChat =
        newGroupChatResponse.data && newGroupChatResponse.data.chat;
      setChats((prevState) => [joinedChat, ...prevState]);

      const updatedAllGroupsChat = allGroupChat.filter(
        (chat) => chat._id !== chatID
      );
      setAllGroupChat(updatedAllGroupsChat);
      setAllChatState(-1);
      socket?.emit("update-chat-member", {
        participants: joinedChat.participants,
        chatID: joinedChat._id,
      });
    }
  };
  return (
    <main className="text-white min-h-screen bg-black h-screen w-screen flex">
      <div className="border  m-5 bg-gray-700 border-gray-700 w-[20%] z-10 rounded-l-2xl ">
        <div
          className="w-full h-[10%]  rounded-2xl text-2xl flex justify-around items-center"
          onClick={() => setChatState(-1)}
        >
          <span>Message</span>
          <div className="w-[20%] ">
            <CreateGroupCommand
              open={open}
              setOpen={setOpen}
              refreshKey={refreshKey}
              setRefreshKey={setRefreshKey}
              clickUserToCreateChat={clickUserToCreateChat}
            />
          </div>
        </div>

        <ShowChatCommand
          allChatState={allChatState}
          setAllChatState={setAllChatState}
          allGroupChat={allGroupChat}
          setChatState={setChatState}
          socket={socket}
          myUserId={myUserId}
          handleClickChat={handleClickChat}
          chatState={chatState}
          chats={chats}
        />
      </div>
      <div className="w-[55%] bg-gray-700 rounded-r-2xl h-[96%] mt-5 flex flex-col">
        {chatState === -1 &&
          allChatState > -1 &&
          allGroupChat[allChatState] && (
            <div className="flex flex-col h-full w-full">
              <div className="flex-1 flex mt-50 flex-col items-center justify-end gap-5 overflow-auto">
                <Users size={200} />
                <span className="text-4xl">
                  Group : {allGroupChat[allChatState].name}
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="text-blue-300 underline cursor-pointer">
                      Members
                    </span>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Members</DialogTitle>
                    </DialogHeader>
                    <div
                      className="flex flex-col max-h-[200px] overflow-y-scroll"
                      style={{
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                      }}
                    >
                      {allGroupChat[allChatState].participants.map(
                        (participant) => (
                          <span key={participant._id}>
                            {participant.username}
                          </span>
                        )
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex justify-center items-start py-6">
                <Button
                  onClick={handleJoinGroup}
                  className="bg-gray-500 w-[50%] h-[50px] hover:bg-gray-300 hover:text-black"
                >
                  Join Group
                </Button>
              </div>
            </div>
          )}

        {chatState > -1 ? (
          <div className="flex flex-col h-full w-full ">
            <div className="flex flex-row border-b-2 bg-gray-700  border-gray-600">
              <span className="w-full h-[10vh] text-4xl flex justify-center items-center">
                {chatState > -1 &&
                  chats[chatState] &&
                  (chats[chatState].isGroup
                    ? `${chats[chatState].name}(${chats[chatState].participants.length})`
                    : chats[chatState].participants[0]._id === myUserId
                    ? chats[chatState].participants[1].username
                    : chats[chatState].participants[0].username)}
              </span>
              {chats[chatState].isGroup && (
                <ChangeGroupChatNameDialog
                  open={changeChatNameOpen}
                  setOpen={setChangeChatNameOpen}
                  defaultName={chats[chatState].name}
                  chatID={chats[chatState]._id}
                  refreshKey={refreshKey}
                  setRefreshKey={setRefreshKey}
                />
              )}
            </div>
            <div
              className="h-[80%] overflow-y-scroll p-5 bg-gray-700 flex flex-col"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {currentChatMessages.map((message, index) => {
                const isISent = message.sender._id === myUserId;
                return (
                  <div
                    className={`flex flex-col mt-5 mb-3 ${
                      isISent ? "self-end mr-5" : "self-start ml-5"
                    }`}
                    key={index}
                    ref={
                      index === currentChatMessages.length - 1
                        ? currentMessageRef
                        : null
                    }
                  >
                    <span
                      className={`text-xl ${
                        isISent ? "self-end" : "self-start"
                      }`}
                    >
                      {isISent ? yourUsername : message.sender.username}
                    </span>
                    <div className="flex">
                      <div
                        className={`${
                          isISent ? "order-2" : ""
                        } px-5 text-2xl bg-blue-500 rounded-2xl  break-words whitespace-normal max-w-[500px] max-h-[400px]`}
                      >
                        {message.message}
                      </div>
                      <span
                        className={`text-xs flex items-end ${
                          isISent ? "order-1 mr-2" : "ml-2"
                        }`}
                      >
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        }).format(new Date(message.timestamp))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {chats[chatState] && chats[chatState].isGroup && (
              <div className="w-full justify-center flex text-gray-300 ">
                <span>Members :</span>
                {chats[chatState].participants.map((participant, index) => (
                  <span key={index}>{`${participant.username} ${
                    index == chats[chatState].participants.length - 1
                      ? ""
                      : ", "
                  }`}</span>
                ))}
              </div>
            )}
            <div className="h-[10vh] flex items-center justify-between bg-black m-10 rounded-4xl">
              <input
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    chats[chatState] &&
                      handleSendMessage(
                        currentMessage,
                        myUserId,
                        chats[chatState].participants.length === 1
                          ? myUserId
                          : chats[chatState].participants[0]._id === myUserId
                          ? chats[chatState].participants[1]._id
                          : chats[chatState].participants[0]._id,
                        chats[chatState]._id,
                        chats[chatState].isGroup
                      );
                  }
                }}
                value={currentMessage}
                type="text"
                placeholder="Send a message"
                className="w-[80%] h-[80%] text-2xl px-5 focus-visible:outline-0"
              />
              <button
                type="button"
                tabIndex={0}
                onClick={() =>
                  handleSendMessage(
                    currentMessage,
                    myUserId,
                    chats[chatState].participants.length === 1
                      ? myUserId
                      : chats[chatState].participants[0]._id === myUserId
                      ? chats[chatState].participants[1]._id
                      : chats[chatState].participants[0]._id,
                    chats[chatState]._id,
                    chats[chatState].isGroup
                  )
                }
                className="bg-blue-500 flex justify-center items-center w-[10%] h-[100%] rounded-2xl"
              >
                <SendHorizontal size={40} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full ">
            {/* <CreateGroupCommand
              socket={socket}
              refreshKey={refreshKey}
              setRefreshKey={setRefreshKey}
              clickUserToCreateChat={clickUserToCreateChat}
            /> */}
          </div>
        )}
      </div>
      <div className="w-[20%] bg-gray-700 mt-5 ml-5 rounded-r-2xl flex flex-col h-[96%]">
        <div className="w-full h-[90%]">
          <div className="flex flex-col items-center text-2xl text-white">
            {Object.values(connectedPeer).map((data) => (
              <div
                onClick={
                  yourUsername == data.username
                    ? () => {}
                    : () => clickUserToCreateChat(data.username)
                }
                className="w-[95%] bg-black h-[50px] mt-2 rounded-2xl flex justify-center items-center"
                key={data.username}
              >
                <div className="size-6 rounded-full bg-green-500"></div>
                <span className="w-[80%] flex justify-center">{`${
                  data.username
                }${yourUsername == data.username ? "(You)" : ""}`}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={async () => {
            setCookie("username", "");
            setCookie("id", "");
            await signOut();
          }}
          className="h-[8%]  rounded-2xl gap-4 text-2xl flex px-10 items-center w-full hover:bg-gray-400"
        >
          <LogOut />
          <span>Log out</span>
        </button>
      </div>
    </main>
  );
}
