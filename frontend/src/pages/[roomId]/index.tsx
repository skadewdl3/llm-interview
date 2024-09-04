'use client';
import ChatBox from "@/components/ChatBox/ChatBox";
import RemotePeer from "@/components/RemotePeer";
import { TPeerMetadata } from "@/utils/types";
import {
  useLocalAudio,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from "@huddle01/react/hooks";
import { AccessToken, Role } from "@huddle01/server-sdk/auth";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import 'regenerator-runtime/runtime'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GetServerSidePropsContext } from "next";
import { useParams } from "next/navigation";
import MediaPicker from "@/components/MediaPicker";
import { Button } from "@/components/ui/button";
import VideoGrid from "@/components/VideoGrid";
import MeetingControls from "@/components/MeetingControls";
import LocalPeer from "@/components/LocalPeer";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  token: string;
};

type Params = {
  roomId: string
}

export default function Home({ token }: Props) {


  const {
    transcript,
    interimTranscript, isMicrophoneAvailable,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();


  const [displayName, setDisplayName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { roomId }: Params = useParams();
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(true)

  const { joinRoom, state } = useRoom({
    onJoin: (room) => {
      console.log("onJoin", room);
      updateMetadata({ displayName });
    },
    onPeerJoin: (peer) => {
      console.log("onPeerJoin", peer);
    },
  });
  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();
  const { updateMetadata } = useLocalPeer<TPeerMetadata>();
  const { peerIds } = usePeerIds();

  const continueToRoom = () => {
    setShowMediaPicker(false)
    joinRoom({ roomId, token })
  }


  useEffect(() => {
    console.log(stream, videoRef.current)
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (shareStream && screenRef.current) {
      screenRef.current.srcObject = shareStream;
    }
  }, [shareStream]);


  useEffect(() => {

    // Check for speech recognition support
    if (!browserSupportsSpeechRecognition) {
      console.log('Browser does not support speech recognition.')
    }
  })



  return (
    <main
      className={`flex min-h-screen flex-col justify-center items-center p-4`}
    >
      <MediaPicker className={`${showMediaPicker ? 'grid' : 'hidden'}`} continueToRoom={continueToRoom} />

      <div className={`${showMediaPicker ? 'hidden' : 'block'}`}>

        {/* <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"> */}
        {/*   <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"> */}
        {/*     <code className="font-mono font-bold">{state}</code> */}
        {/*   </p> */}
        {/* </div> */}

        <div className="w-full mt-8 flex gap-4 justify-between items-stretch">
          <div className="flex-1 justify-between items-center flex flex-col">

            <VideoGrid>
              <LocalPeer />
              {
                peerIds.map((peerId, index) => (
                  <RemotePeer peerId={peerId} key={index} />
                ))
              }
            </VideoGrid>
            {state == 'connected' && <MeetingControls className="absolute bottom-2 left-1/2 -translate-x-1/2" />}
          </div>
          {/* {state === "connected" && <ChatBox />} */}
        </div>
        <div>

        </div>
        <p>Microphone: {listening ? 'on' : 'off'}</p>

        <Button className="mt-40" onClick={() => SpeechRecognition.startListening({ continuous: true })}>Start</Button><br />
        <Button onClick={SpeechRecognition.stopListening}>Stop</Button> <br />
        <Button onClick={resetTranscript}>Reset</Button><br />
        <p>{transcript}</p>
      </div>


    </main>
  );
}


export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const accessToken = new AccessToken({
    apiKey: process.env.API_KEY || "",
    roomId: ctx.params?.roomId?.toString() || "",
    role: Role.HOST,
    permissions: {
      admin: true,
      canConsume: true,
      canProduce: true,
      canProduceSources: {
        cam: true,
        mic: true,
        screen: true,
      },
      canRecvData: true,
      canSendData: true,
      canUpdateMetadata: true,
    },
  });

  const token = await accessToken.toJwt();

  return {
    props: { token },
  };
};
