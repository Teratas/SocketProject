"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";

export default function useSocket(): Socket | null {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const router = useRouter()
  useEffect(() => {
    if(socketInstance){
      return;
    }
    const socket = io("http://localhost:5000", {
      reconnection : true,
      reconnectionAttempts : 3,
      reconnectionDelay : 1000
    });
    setSocketInstance(socket);

    socket.on("connect", () => {
      console.log("Connected to Socket " + socket.id);
    });
    socket.on("disconnect", () => {
      console.log("peer disconnected");
    });

    
  }, []);

  return socketInstance;
}
