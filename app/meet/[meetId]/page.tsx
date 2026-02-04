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
    navigator.mediaDevices.getUserMedia({
      video:true,
      audio:true
    }).then((stream)=>{
      const call=peerRef.current?.call(idToConnect,stream)
      if (call) {
        call.on("stream",(userVideoStream)=>{
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject=userVideoStream
          }
        })
      }
    })
  }, [idToConnect])
  


  useEffect(() => {
    if (!socket || !roomId) return

    socket.emit("join-room", {
      userId: myUniqueId, 
      meetId: roomId      
    })

    socket.on("user-joined", ({ otherPersonId }) => {
      setIdToConnect(otherPersonId)
      console.log(`Someone joined with socket id: ${otherPersonId}`)
    })

    return () => {
      socket.off("user-joined")
    }
  }, [socket, roomId])

  return <div className='flex flex-col justify-center items-center p-12'>
    <p>your id : {myUniqueId}</p>
    <video className='w-72' playsInline ref={localVideoRef} autoPlay />
    <video className='w-72' playsInline ref={remoteVideoRef} autoPlay />
  </div>
}

export default Page
