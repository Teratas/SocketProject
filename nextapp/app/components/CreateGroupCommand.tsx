"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getCookie } from "cookies-next/client";
import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";

export default function CreateGroupCommand({
  clickUserToCreateChat,
  refreshKey,
  setRefreshKey,
  open,
  setOpen
}: {
  clickUserToCreateChat: (username:string)=>(Promise<void>);
  refreshKey: boolean;
  setRefreshKey: Dispatch<SetStateAction<boolean>>;
  open : boolean;
  setOpen : Dispatch<SetStateAction<boolean>>;
}) {
  const [users, setUsers] = useState<Array<{ _id: string; username: string }>>(
    []
  );
  const [name, setName] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [groupMember, setGroupMember] = useState<
    { _id: string; username: string }[]
  >([]);
  const [isCreateGroup, setIsCreateGroup] = useState<boolean>(false);
  const myUserId = getCookie("id");
  const token = getCookie("token");
  useEffect(() => {
    const handleFetchAllUser = async () => {
      const allUser = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/api/user/allUser`,
        {
          headers: {
            bearer: token,
          },
        }
      );
      const allUserData: { username: string; _id: string }[] =
        allUser?.data?.data.filter(
          (user: { _id: string; username: string }) => user._id !== myUserId
        ) ?? [];

      setUsers(allUserData);
    };
    handleFetchAllUser();
  }, []);

  const handleAddUserToGroup = (user: { _id: string; username: string }) => {
    setGroupMember((prevMembers) => {
      if (prevMembers.some((member) => member._id === user._id)) {
        return prevMembers.filter((member) => member._id !== user._id);
      }
      return [...prevMembers, user];
    });
  };
  

  const handleCreateGroup = async (name: string) => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const data = {
        isGroup: true,
        participants: [...groupMember.map((member) => member._id), myUserId],
        name,
        userID: myUserId,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/chats/create-chat`,
        data,
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
      setIsCreateGroup(false);
      setOpen(false);
      setRefreshKey(!refreshKey);
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-500 border-gray-500">New Chat</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Chat</DialogTitle>
        </DialogHeader>
        <Command className="bg-gray-700 text-white">
          <CommandInput placeholder="Type to search user" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup
              className="text-5xl text-white h-[300px] overflow-y-scroll"
              heading="All Users"
            >
              {users.map((user) => (
                <CommandItem value={user.username} key={user._id}>
                  <div className="flex w-full justify-between items-center">
                    <span className="text-white">{user.username}</span>
                    <div>
                      {isCreateGroup ? (
                        <Button
                          className={`h-[30px] ${
                            groupMember.some(
                              (member) => member._id === user._id
                            )
                              ? "bg-red-400"
                              : "bg-sky-800"
                          }`}
                          onClick={() => handleAddUserToGroup(user)}
                        >
                          {groupMember.some((member) => member._id === user._id)
                            ? "Remove"
                            : "Add"}
                        </Button>
                      ) : (
                        <Button
                          className="h-[30px]"
                          onClick={() => clickUserToCreateChat(user.username)}
                        >
                          <MessagesSquare/>
                        </Button>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div>
          {!isCreateGroup ? (
            <Button
              className="w-full bg-white text-black"
              onClick={() => {
                setIsCreateGroup(true);
                setName("");
                setGroupMember([]);
              }}
            >
              Create Group
            </Button>
          ) : (
            <div>
              <Button
                className="w-full bg-red-400 text-white "
                onClick={() => setIsCreateGroup(false)}
              >
                Cancel
              </Button>
              <Input
                type="text"
                className="mt-5"
                placeholder="Group Name"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />

              <Button
                onClick={() => handleCreateGroup(name)}
                disabled={!name}
                className="w-full bg-lime-400 mt-5 text-white"
              >
                Confirm
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
  {
    /* <div className="mt-5 w-full flex flex-col items-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {setIsCreateGroup(true); setName("")}} className="w-full">
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Group</DialogTitle>
            </DialogHeader>
            <div className="h-[700px]">
              <div className="h-[500px] overflow-y-scroll w-full ">
                {users.map((user, index) => (
                  <div
                    key={user._id}
                    className="mt-5 flex w-full justify-between"
                  >
                    <span>{user.username}</span>
                    <div>
                      <Button
                        className="h-[30px]"
                        onClick={() => handleAddUserToGroup(user)}
                      >
                        {groupMember.some(
                          (member) => member._id === user._id
                        )
                          ? "Remove"
                          : "Add"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className='h-[100px] mt-10'>
                <Input type="text" placeholder="Group Name" onChange={(e) => setName(e.target.value)} value={name}/>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                className="w-full"
                onClick={() => handleCreateGroup(name)}
                disabled={groupMember.length === 0 || !name}
              >
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div> */
  }
}
