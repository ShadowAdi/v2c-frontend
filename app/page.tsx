'use client'
import { useSocket } from "@/context/socketContext";
import { useEffect, useState } from "react";

export default function Home() {
  const [input, setInput] = useState("")
  const { socket,messages } = useSocket()

  const handleSendMessage = (e: any, message: string) => {
    e.preventDefault();
    if (message.trim()) {
      socket?.emit("chat-message",
        message);
    }
    setInput("");
  };

  return (
    <main className="flex flex-col items-center w-screen min-h-screen">
      <h1 className="text-2xl font-semibold">
        Chat app
      </h1>

      {messages.map((m,i) => {
        return (
          <p key={i}>
            {m}
          </p>
        )
      })}

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
