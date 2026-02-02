'use client'
import { useSocket } from "@/context/socketContext";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("")
  const { socket } = useSocket()

  const handleSendMessage = (e: any, message: string) => {
    e.preventDefault();
    if (input.trim()) {
      socket?.emit("send_message", {
        text: input,
      });
    }
    setInput("");
  };
  return (
    <main className="flex flex-col items-center w-screen min-h-screen">
      <h1 className="text-2xl font-semibold">
        Chat app
      </h1>

      <input type="text" className="w-full h-8 p-2 transition-all bg-gray-100 rounded-full focus:outline-none"
        placeholder="Aa" value={input} onChange={(e) => {
          setInput(e.target.value)
        }} />

      <button className="cursor-pointer " onClick={(e) => {
        handleSendMessage(e, input)
      }}>
        Send Message
      </button>

    </main>
  );
}
