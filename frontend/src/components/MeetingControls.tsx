import { useEffect, useState } from "react";
import { CiMicrophoneOn as MicOn, CiMicrophoneOff as MicOff } from "react-icons/ci";
import { LuCamera as CameraOn, LuCameraOff as CameraOff } from "react-icons/lu";
import { LuScreenShare as ScreenShareOn, LuScreenShareOff as ScreenShareOff } from "react-icons/lu";
import { ImPhoneHangUp as LeaveMeeting } from "react-icons/im";
import { Button } from "./ui/button";
import { useLocalAudio, useLocalScreenShare, useLocalVideo, useRoom } from "@huddle01/react/hooks";
import { useRouter } from "next/router";

type Props = {
  className?: string
}

export default function MeetingControls({ className = '' }: Props) {


  // Following maintain state of audio, video and screen sharing
  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();
  const [isScreenShareOn, setScreenShareOn] = useState(false)


  // Functions to turn audio, video, screen share on an off
  const toggleAudio = () => isAudioOn ? disableAudio() : enableAudio()
  const toggleVideo = () => isVideoOn ? disableVideo() : enableVideo()
  const toggleScreenShare = () => {
    if (isScreenShareOn) {
      setScreenShareOn(false)
      stopScreenShare()
    }
    else {
      setScreenShareOn(true)
      startScreenShare()
    }
  }


  // Functions to leave the room
  const { leaveRoom } = useRoom()
  const router = useRouter()
  const leaveMeeting = () => {
    leaveRoom()
    router.push('/')
  }

  return (
    <div className={`flex items-center justify-center gap-2 [&>button]:h-12 [&>button]:w-12 ${className}`}>


      <Button size="icon" variant={isAudioOn ? "outline" : "destructive"} className="h-12 w-12" onClick={toggleAudio}>
        {isAudioOn ? <MicOn className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </Button>


      <Button size="icon" variant={isVideoOn ? "outline" : "destructive"} onClick={toggleVideo}>
        {isVideoOn ? <CameraOn className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
      </Button>


      <Button size="icon" {...(isScreenShareOn ? {} : { variant: 'outline' })} onClick={toggleScreenShare}>
        {!isScreenShareOn ? <ScreenShareOn className="w-6 h-6" /> : <ScreenShareOff className="w-6 h-6" />}
      </Button>


      <Button size="icon" variant="destructive" onClick={leaveMeeting}> <LeaveMeeting className="w-6 h-6" /> </Button>
    </div >
  )
}
