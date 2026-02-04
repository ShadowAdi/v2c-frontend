'use client'
import { useSocket } from '@/context/socketContext'
import React, { useEffect } from 'react'

const page = () => {
    const { socket } = useSocket()

    useEffect(() => {
        socket?.emit("join-room", {
            meetId: "123",
            roomId: "abc"
        })
    }, [socket])

    return (
        <div>meet page</div>
    )
}

export default page