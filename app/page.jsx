"use client"
import { Button } from "@/components/ui/button";
import './App.css'
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  
  const router = useRouter();
  
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center main">
      <div className="card flex flex-col justify-center items-center z-20 p-8 md:p-32">
        <div className="my-5 font-medium font-serif z-10 text-3xl md:text-5xl lg:text-7xl my-12 text-nowrap"><span className="ai text-4xl md:text-6xl lg:text-8xl">AI </span><span className="text-slate-700">MOCK INTERVIEW</span></div>
          <Button className="md:w-52 py-6 rounded-full" onClick={()=>router.push('/dashboard')}>Let's Begin</Button>
      </div>
    </div>
  );
}
