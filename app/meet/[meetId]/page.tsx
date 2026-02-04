'use client'
import { useSocket } from '@/context/socketContext'
import { use, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Peer from 'peerjs'
import { getPeer } from '@/lib/peer'

const Page = () => {
  const { socket } = useSocket()
  const [isConnected, setIsConnected] = useState(false)
  const [myUniqueId, setMyUniqueId] = useState<string>(crypto.randomUUID().split("-").at(-1) || crypto.randomUUID())
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
      video: true,
      audio: true
    }).then((stream) => {
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }).catch((error) => {
      console.error("Error accessing media devices:", error);
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!idToConnect || !peerRef.current || !localStreamRef.current) return;

    console.log("Making call to:", idToConnect);
    const call = peerRef.current.call(idToConnect, localStreamRef.current);
    callRef.current = call;

    call.on("stream", (remoteStream) => {
      console.log("Received remote stream from call");
      remoteStreamRef.current = remoteStream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setIsConnected(true);
    });

    call.on("close", () => {
      console.log("Call closed");
      setIsConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });
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
    <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
    <div className='flex gap-4'>
      <div>
        <p className='text-sm'>You</p>
        <video className='w-72' playsInline ref={localVideoRef} autoPlay muted />
      </div>
      <div>
        <p className='text-sm'>Remote</p>
        <video className='w-72' playsInline ref={remoteVideoRef} autoPlay />
      </div>
    </div>
  </div>
}

export default Page
