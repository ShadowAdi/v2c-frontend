'use client'
import { useSocket } from '@/context/socketContext'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'

const Page = () => {
  const { socket } = useSocket()
  const params = useParams()
  const roomId = params.meetId  

  useEffect(() => {
    if (!socket || !roomId) return

    socket.emit("join-room", {
      meetId: socket.id,   // identity of this user
      roomId: roomId       // shared room
    })

    socket.on("user-joined", ({ meetId }) => {
      console.log(`Someone joined with socket id: ${meetId}`)
    })

    return () => {
      socket.off("user-joined")
    }
  }, [socket, roomId])

  return <div>meet page</div>
}

export default Page
