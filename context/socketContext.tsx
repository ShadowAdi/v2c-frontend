'use client'
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { connect, Socket } from "socket.io-client";

interface SocketContextInterface {
    socket: Socket | null
}

const SocketContext = createContext<SocketContextInterface>({
    socket: null
})

export function useSocket() {
    return useContext(SocketContext);
}


export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        let socket = connect("http://localhost:5000")
        setSocket(socket);
    }, [])

    return (
        <SocketContext.Provider value={{ socket }}>{children} </SocketContext.Provider>
    )
}
