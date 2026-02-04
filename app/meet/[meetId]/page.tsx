'use client'
import { useSocket } from '@/context/socketContext'
import { use, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Peer from 'peerjs'
import { getPeer } from '@/lib/peer'

const Page = () => {
  const { socket } = useSocket()
  const [isConnected, setIsConnected] = useState(false)
  const [myUniqueId, setMyUniqueId] = useState<string>(crypto.randomUUID().split("-")[-1])
  const [idToConnect, setIdToConnect] = useState<string>("")
  const { meetId: roomId }: { meetId: string } = useParams()


  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const remoteStreamRef = useRef<MediaStream | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<any>(null);

  useEffect(() => {
    if (myUniqueId) {
      const peerInstance = getPeer(myUniqueId)
      peerRef.current = peerInstance

      peerInstance.on("open", (id) => {
        console.log("Connected to PeerJS server with ID:", id);
      });

      peerInstance.on("call", (incomingCall) => {
        console.log("Receiving call...");

        if (localStreamRef.current) {
          incomingCall.answer(localStreamRef.current)
          callRef.current = incomingCall
          incomingCall.on("stream", (remoteStream) => {
            console.log("Received remote stream");
            remoteStreamRef.current = remoteStream;

            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setIsConnected(true);
          });
          incomingCall.on("close", () => {
            console.log("Call ended by remote peer");
            setIsConnected(false);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          });
        }
      })

      peerInstance.on("error", (error) => {
        console.error("PeerJS error:", error);
      });

      return () => {
        if (peerInstance) {
          peerInstance.destroy();
        }
      };
    }
  }, [myUniqueId])


  useEffect(() => {
    if (!socket || !roomId) return

    socket.emit("join-room", {
      userId: myUniqueId,   // identity of this user
      meetId: roomId       // shared room
    })

    socket.on("user-joined", ({ otherPersonId }) => {
      setIdToConnect(otherPersonId)
      console.log(`Someone joined with socket id: ${otherPersonId}`)
    })

    return () => {
      socket.off("user-joined")
    }
  }, [socket, roomId])

  return <div>meet page</div>
}

export default Page
