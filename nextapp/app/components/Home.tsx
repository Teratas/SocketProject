'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSocket } from "./SocketProvider";
import { signIn } from "next-auth/react";
import {getCookie} from 'cookies-next/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function HomeComponent() {
  const [username, setUsername] = useState<string>("");
  const router = useRouter()
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const { socketInstance: socket } = useSocket()
  const [isLogin, setIsLogin] = useState<boolean>(true)
  const handleJoin = async () => {
    const loginRes = await signIn("credentials", {
      username,
      password: "123",
      redirect: false, 
    });

    if (loginRes?.ok) {
      const id = getCookie('id')

      const data = {
        socketID: socket?.id,
        username,
        id
      };

      socket?.emit("register-user", data);
      router.push(`/mainPage?username=${username}`);
    } else {
      alert("Login failed");
      console.log("Login error:", loginRes?.error);
    }
  }

  return (
    <>
    {
      isLogin ? 
      <Card className='w-[500px] h-[350px] bg-gray-100'>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div>
          <label>Username</label>
          <Input
          
            type="text"
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <Input
          
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
                />
        </div>
        <Button className="hover:bg-gray-700 cursor-pointer" onClick={handleJoin}>Join Chat</Button>
      </CardContent>
      <CardFooter className=' flex justify-center w-full'>
        <span className='text-gray-400'>Don't have an account?<span className='ml-1 underline cursor-pointer' onClick={() => {setIsLogin(false); setUsername(""); setPassword(""); setConfirmPassword("")}}>Sign up</span></span>
      </CardFooter>
    </Card> :
    <Card className='w-[500px] h-[420px] bg-gray-100'>
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div>
          <label>Username</label>
          <Input
          
            type="text"
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <Input
          
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
                />
        </div>
        <div>
          <label>Confirm Password</label>
          <Input
          
          type="password"
          value={confirmPassword}
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
                />
        </div>
        <Button className="hover:bg-gray-700 cursor-pointer" onClick={handleJoin}>Register</Button>
      </CardContent>
      <CardFooter className=' flex justify-center w-full'>
        <span className='text-gray-400'>Already have an account?<span className='ml-1 underline cursor-pointer' onClick={() => {setIsLogin(true); setUsername(""); setPassword(""); setConfirmPassword("")}}>Sign in</span></span>
      </CardFooter>
    </Card>
    }
    
    </>
    
  );
}
