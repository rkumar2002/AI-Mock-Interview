"use client"
import { Button } from "@/components/ui/button";
import './App.css'
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  
  const router = useRouter();
  
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center main">
      <div className="card flex flex-col justify-center items-center z-20 p-32">
        <div className="my-12 font-medium font-serif  text-7xl z-10"><span className="ai text-8xl">AI </span><span className="text-slate-700">MOCK INTERVIEW</span></div>
          <Button className="w-52 py-6 rounded-full" onClick={()=>router.push('/dashboard')}>Let's Begin</Button>
      </div>
    </div>
  );
}
