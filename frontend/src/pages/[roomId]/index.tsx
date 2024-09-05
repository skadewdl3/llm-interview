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
import Lobby from "@/components/Lobby";
import { Button } from "@/components/ui/button";
import VideoGrid from "@/components/VideoGrid";
import MeetingControls from "@/components/MeetingControls";
import LocalPeer from "@/components/LocalPeer";
import { useDisplayNameStore } from "@/store/displayNameStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  token: string;
};

type Params = {
  roomId: string
}

export default function Home({ token }: Props) {


  const [summary, setSummary] = useState('')
  const { roomId }: Params = useParams();
  const [showLobby, setShowLobby] = useState(true)
  // @ts-ignore
  const displayName = useDisplayNameStore((state: any) => state.displayName)

  const { joinRoom, state } = useRoom({
    onJoin: (room) => {
      console.log(displayName)
      updateMetadata({
        displayName
      })
      console.log("onJoin", room);
    },
  });

  const getSummary = async () => {
    try {
      let response = await fetch(`/api/room/summary`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          roomId
        })
      })

      let { summary } = await response.json()
      setSummary(summary)
    } catch (err) {
      console.log(err)
    }
  }

  const { updateMetadata } = useLocalPeer<TPeerMetadata>();
  const { peerIds } = usePeerIds();

  const continueToRoom = () => {
    setShowLobby(false)
    joinRoom({ roomId, token })
  }

  return (
    <main
      className={`flex min-h-screen flex-col justify-center items-center p-4`}
    >
      <Lobby className={`${showLobby ? 'grid' : 'hidden'}`} continueToRoom={continueToRoom} />

      <div className={`${showLobby ? 'hidden' : 'block'}`}>

        {/* <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"> */}
        {/*   <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"> */}
        {/*     <code className="font-mono font-bold">{state}</code> */}
        {/*   </p> */}
        {/* </div> */}

        <div className="w-full mt-8 flex gap-4 justify-between items-stretch">
          <div className="flex-1 justify-between items-center flex flex-col">

            {
              state == 'connected' && (
                <div className="absolute top-4 right-4 flex flex-col gap-2">

                  <div>
                    <Card className="max-w-80">
                      <CardHeader>
                        <CardTitle>Summary</CardTitle>
                        <CardDescription>A summary of the conversation so far.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>{summary}</p>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={getSummary}>Get Summary</Button>
                      </CardFooter>
                    </Card>
                  </div>

                  <div>
                    <Card className="max-w-80">
                      <CardHeader>
                        <CardTitle>Rate Candidate</CardTitle>
                        <CardDescription>View a detailed rating of the candidates experience based on DRDO specifications.</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Link href={`/dashboard/rate_candidate/${roomId}`} target="_blank"><Button>Rate Candidate</Button></Link>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              )
            }
            <VideoGrid>
              <LocalPeer />
              {
                peerIds.map((peerId, index) => (
                  <RemotePeer peerId={peerId} key={index} />
                ))
              }
            </VideoGrid>
            {state == 'connected' && <MeetingControls className="absolute bottom-2 left-1/2 -translate-x-1/2" />}
            {state == 'connecting' && <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl">Connecting...</p>}
            {state == 'idle' && <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl">Joining room...</p>}
          </div>
          {/* {state === "connected" && <ChatBox />} */}
        </div>
        <div>


        </div>
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
