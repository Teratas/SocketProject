// import Image from "next/image";
import { auth } from "@/auth";
import HomeComponent from "./components/Home";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

export default async function Home() {

  const session : Session | null = await auth()
  if(session && session.user! && session.user.id!){
    redirect('/mainPage')
  }
  return (
    <div className="bg-black min-h-screen h-screen w-screen flex justify-center items-center">
      <HomeComponent />
    </div>
  );
}
