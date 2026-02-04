'use client'
import { useSocket } from '@/context/socketContext'
import { useEffect } from 'react'

const page = () => {
    const { socket } = useSocket()

    useEffect(() => {
        socket?.emit("join-room", {
            meetId: "123",
            roomId: "abc"
        })
    }, [socket])
    
    useEffect(() => {
      socket?.on("user-joined",({meetId})=>{
        console.log(`Someone joined `,meetId)
      })
    }, [])
    

    return (
        <div>meet page</div>
    )
}

export default page