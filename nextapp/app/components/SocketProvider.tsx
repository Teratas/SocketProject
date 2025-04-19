// socketContext.tsx
"use client";
import { getCookie, setCookie} from 'cookies-next/client'
import { createContext, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { stateInterface } from "@/app/mainPage/page";

interface SocketContextType {
  socketInstance: Socket | null;
  connectedPeer: Record<string, {username : string, socketID : string}>;
}

const SocketContext = createContext<SocketContextType>({
  socketInstance: null,
  connectedPeer: {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [connectedPeer, setConnectedPeer] = useState<Record<string, {username : string, socketID : string}>>(
    {}
  );

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}`, {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    setSocketInstance(socket);

    socket.on("connect", () => {
      console.log("Connected to Socket " + socket.id);
      const username = getCookie("username");
      const id = getCookie("id")
      if (username && id) {
        console.log(socket?.id);
        const data = {
          socketID: socket?.id,
          username,
          id : id
        };
        socket.emit("register-user", data);
      }
    });
    
    socket.on("state", (state: stateInterface) => {
      console.log("state", state);
      if (state.success && state.type === "login") {
        setCookie("username", state.data as string);
      } else if (!state.success) {
        alert("Something goes wrong...");
      }
      if (state.success && state.type === "update-peer") {
        setConnectedPeer(state.data as Record<string, {username : string, socketID : string}>);
      } else {
        console.log(state?.msg ?? "Failed to update peer");
      }
    });

    socket.on("disconnect", () => {
      console.log("peer disconnected");
      setCookie('username', "")
      setCookie('id', "")
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socketInstance, connectedPeer }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
