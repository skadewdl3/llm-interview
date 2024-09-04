import { Toggle } from "@radix-ui/react-toggle";
import { useEffect, useState } from "react";
import { CiMicrophoneOn as MicOn, CiMicrophoneOff as MicOff } from "react-icons/ci";
import { LuCamera as CameraOn, LuCameraOff as CameraOff } from "react-icons/lu";
import { LuScreenShare as ScreenShareOn, LuScreenShareOff as ScreenShareOff } from "react-icons/lu";
import { ImPhoneHangUp as LeaveMeeting } from "react-icons/im";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Button } from "./ui/button";
import { useLocalAudio, useLocalScreenShare, useLocalVideo } from "@huddle01/react/hooks";

type Props = {
  className?: string
}

export default function MeetingControls({ className = '' }: Props) {


  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();
  const [screenShareVariant, setScreenShareVariant] = useState<any>({ variant: 'outline' })
  const [micOn, setMicOn] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [isScreenShareOn, setScreenShareOn] = useState(false)

  const toggleAudio = () => isAudioOn ? disableAudio() : enableAudio()
  const toggleVideo = () => isVideoOn ? disableVideo() : enableVideo()

  const toggleScreenShare = () => {
    if (isScreenShareOn) {
      setScreenShareOn(false)
      setScreenShareVariant({ variant: 'outline' })
      stopScreenShare()
    }
    else {
      setScreenShareOn(true)
      startScreenShare()
      setScreenShareVariant({})
    }
  }

  const leaveMeeting = () => {
    // exit room code
  }

  return (
    <div className={`flex items-center justify-center gap-2 [&>button]:h-12 [&>button]:w-12 ${className}`}>


      <Button size="icon" variant={isAudioOn ? "outline" : "destructive"} className="h-12 w-12" onClick={toggleAudio}>
        {isAudioOn ? <MicOn className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </Button>


      <Button size="icon" variant={isVideoOn ? "outline" : "destructive"} onClick={toggleVideo}>
        {isVideoOn ? <CameraOn className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
      </Button>


      <Button size="icon" {...screenShareVariant} onClick={toggleScreenShare}>
        {!isScreenShareOn ? <ScreenShareOn className="w-6 h-6" /> : <ScreenShareOff className="w-6 h-6" />}
      </Button>


      <Button size="icon" variant="destructive" onClick={leaveMeeting}> <LeaveMeeting className="w-6 h-6" /> </Button>
    </div >
  )
}
