'use client'
import { useSocket } from '@/context/socketContext'
import { use, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Peer from 'peerjs'

const Page = () => {
  const { socket } = useSocket()
  const [isConnected, setIsConnected] = useState(false)
  const [myUniqueId, setMyUniqueId] = useState<string>("")
  const [idToConnect, setIdToConnect] = useState<string>("")
  const { meetId: roomId }: { meetId: string } = useParams()


  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const remoeteStreamRef = useRef<MediaStream | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<any>(null);

  useEffect(() => {
    if (!socket || !roomId) return

    socket.emit("join-room", {
      meetId: myUniqueId,   // identity of this user
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
