import Peer from 'peerjs';
let peer: Peer | null = null;

export const getPeer = (peerId: string) => {
    if (!peer || peer.destroyed) {
        peer = new Peer(peerId, {
            host: "localhost",
            port: 9000,
            path: "/peerjs"
        });
    }
    return peer;
};

export const destroyPeer = () => {
    if (peer && !peer.destroyed) {
        peer.destroy();
    }
    peer = null;
};