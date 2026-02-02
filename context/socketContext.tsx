'use client'
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { connect, Socket } from "socket.io-client";

interface SocketContextInterface {
    socket: Socket | null;
    messages: string[]
}

const SocketContext = createContext<SocketContextInterface>({
    socket: null,
    messages: []
})

export function useSocket() {
    return useContext(SocketContext);
}


export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<string[]>([])

    useEffect(() => {
        let socket = connect("http://localhost:5000")
        socket?.on("get-messages", (data: string) => {
            console.log("m ", data)
            setMessages((prev) => [...prev, data])
        })
        setSocket(socket);
    }, [])

    return (
        <SocketContext.Provider value={{ socket, messages }}>{children} </SocketContext.Provider>
    )
}
