// import Image from "next/image";
import { auth } from "@/auth";
import HomeComponent from "./components/Home";
import { redirect } from "next/navigation";

export default async function Home() {
  const session : any = await auth()
  if(session?.id){
    redirect('/mainPage')
  }
  return (
    <div className="bg-black min-h-screen h-screen w-screen flex justify-center items-center">
      <HomeComponent />
    </div>
  );
}
