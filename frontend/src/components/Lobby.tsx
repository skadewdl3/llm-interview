import useMediaDevices from "@/hooks/useMediaDevices";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardTitle, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useLocalAudio, useLocalVideo, useRoom } from "@huddle01/react/hooks";
import { LuCameraOff as CameraOff } from "react-icons/lu";
import { CiMicrophoneOff as MicOff } from "react-icons/ci";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { useDisplayNameStore } from "@/store/displayNameStore";

type Props = {
  continueToRoom: () => void,
  className: string
}

export default function MediaPicker({ continueToRoom, className }: Props) {
  const [devices, refreshDevices] = useMediaDevices()
  const setDisplayName = useDisplayNameStore((state: any) => state.setDisplayName)
  const audioDevices = useMemo(() => {
    return devices.filter(({ kind }) => kind == 'audioinput')
  }, [devices])

  const videoDevices = useMemo(() => {
    return devices.filter(({ kind }) => kind == 'videoinput')
  }, [devices])

  const [audioDevice, _setAudioDevice] = useState<MediaDeviceInfo | null>(null)
  const [videoDevice, _setVideoDevice] = useState<MediaDeviceInfo | null>(null)
  const videoPreview = useRef<HTMLVideoElement>(null)


  const { state } = useRoom()

  const {
    stream: videoStream,
    isVideoOn,
    enableVideo,
    disableVideo,
    changeVideoSource,
  } = useLocalVideo({
  });


  const {
    isAudioOn,
    enableAudio,
    disableAudio,
    changeAudioSource,
  } = useLocalAudio()


  const toggleAudio = () => isAudioOn ? disableAudio() : enableAudio()
  const toggleVideo = () => isVideoOn ? disableVideo() : enableVideo()


  useEffect(() => {
    if (!audioDevice || !audioDevice.label) return

    // Set Huddle01 to use this device as microphone
    changeAudioSource(audioDevice.deviceId)

  }, [audioDevice])

  useEffect(() => {
    if (!videoDevice || !videoDevice.label) return

    console.log(videoDevice, videoStream, isVideoOn)
    // Set Huddle01 to use this device as camera

    if (videoStream && videoPreview.current) {
      videoPreview.current.srcObject = videoStream;
    }
  }, [videoStream])

  const setVideoDevice = (device: MediaDeviceInfo) => {
    if (!device || !device.label) return
    _setVideoDevice(device)
    changeVideoSource(device.deviceId)
  }


  const setAudioDevice = (device: MediaDeviceInfo) => {
    if (!device || !device.label) return
    _setAudioDevice(device)
    changeAudioSource(device.deviceId)
  }

  useEffect(() => {
    // Check for audio and video permissions
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        enableVideo()
        enableAudio()

        setVideoDevice(videoDevices[0])
        setAudioDevice(audioDevices[0])

        // @ts-ignore
        window.localStream = stream;
        // @ts-ignore
        window.localAudio.srcObject = stream;
        // @ts-ignore
        window.localAudio.autoplay = true;

        refreshDevices()
      })
      .catch((err) => {
        console.log(`User did not give permissions - ${err}`)
      });
  }, [])


  return (
    <div className={`grid-cols-2 place-items-center w-[80%] ${className}`}>
      <div className="flex flex-col min-h-[200px] justify-between">
        <p className="text-2xl mb-4">Audio and Video Settings</p>
        <div className="grid grid-cols-2 gap-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">Select Microphone</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{audioDevice && audioDevice.label ? audioDevice.label : 'Select Microphone'}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {
                    audioDevices.map((device, index) => (
                      device.label ? (
                        <DropdownMenuItem onClick={() => setAudioDevice(device)} key={index}>{device.label}</DropdownMenuItem>
                      ) : (
                        <Skeleton key={index} className="h-8 w-full" />
                      )
                    ))
                  }
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>


          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">Select Camera</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{videoDevice && videoDevice.label ? videoDevice.label : 'Select Camera'}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {
                    videoDevices.map((device, index) => (
                      device.label ? (
                        <DropdownMenuItem onClick={() => setVideoDevice(device)} key={index}>{device.label}</DropdownMenuItem>
                      ) : (
                        <Skeleton key={index} className="h-8 w-full" />
                      )
                    ))
                  }
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>


        <Separator className="my-4" />
        <p className="text-2xl mb-4">Display Name</p>
        <Input placeholder="Enter your name" onInput={(e: any) => setDisplayName(e.target.value)} id="display-name" />


        <Separator className="my-4" />
        <p className="text-2xl mb-4">Before joining...</p>

        <div className="flex gap-4">
          <Button {...(isVideoOn ? { variant: 'outline' } : {})} onClick={toggleVideo}> <CameraOff className="h-4 w-4 mr-2" /> Turn off video</Button>
          <Button {...(isAudioOn ? { variant: 'outline' } : {})} onClick={toggleAudio}> <MicOff className="h-4 w-4 mr-2" /> Turn off audio</Button>
        </div>
        <Button className="mt-8 self-start" onClick={continueToRoom}>Continue</Button>
      </div>

      <div>
        {
          !isVideoOn ? (
            <Skeleton className="w-[400px] aspect-video flex items-center justify-center">
              <p className="">
                Video has been turned off
              </p>
            </Skeleton>
          ) :
            (videoDevice && videoDevice.label) ? (
              <video ref={videoPreview}
                className="aspect-video rounded-xl w-full"
                autoPlay
                muted
              />

            ) : (
              <Skeleton className="w-[400px] aspect-video flex items-center justify-center">
                <p className="">
                  Select a camera to turn on video
                </p>
              </Skeleton>
            )
        }
      </div>


    </div >
  )
}
