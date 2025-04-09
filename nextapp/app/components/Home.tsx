'use client'
import useSocket from "@/libs/useSocket";
// import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomeComponent() {
  const [username, setUsername] = useState<string>("");
  const socket = useSocket();
  useEffect(() => {
    if(socket){
      socket.emit('homepage-onDisconnect', socket.id)
      socket.disconnect()
    } 
  }, [])
  const onJoined = () => {
    
    if (!username) {alert('Username is null'); return;}
    if (!socket) {
      alert('Socket still not joined');
      return;
    }

    const data = {
      username,
      socketID: socket.id,
    };

    socket.emit("register", data);
    console.log("Sent Join Socket");
  };

  return (
    <div>
      <input
        type="text"
        value={username}
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={onJoined}>Join</button>
    </div>
  );
}