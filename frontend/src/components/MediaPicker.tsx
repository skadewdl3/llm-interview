import useMediaDevices from "@/hooks/useMediaDevices";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { SlCamera as Camera } from "react-icons/sl";
import { SlMicrophone as Microphone } from "react-icons/sl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { huddleClient } from '@/pages/_app'
import { useLocalAudio, useLocalVideo } from "@huddle01/react/hooks";

type Props = {
  showMediaPicker: (show: boolean) => void
}

export default function MediaPicker({ showMediaPicker }: Props) {
  const [devices, refreshDevices] = useMediaDevices()
  const audioDevices = useMemo(() => {
    return devices.filter(({ kind }) => kind == 'audioinput')
  }, [devices])

  const videoDevices = useMemo(() => {
    return devices.filter(({ kind }) => kind == 'videoinput')
  }, [devices])

  const [audioDevice, _setAudioDevice] = useState<MediaDeviceInfo | null>(null)
  const [videoDevice, _setVideoDevice] = useState<MediaDeviceInfo | null>(null)
  const videoPreview = useRef<HTMLVideoElement>(null)


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
      .then(() => {
        enableVideo()
        enableAudio()
        refreshDevices()
      })
      .catch((err) => {
        console.log(`User did not give permissions - ${err}`)
      });
  }, [])


  return (
    <div className="grid grid-cols-2 place-items-center w-[80%]">
      <div className="flex flex-col items-center justify-evenly h-full">
        <div className="grid grid-cols-2 gap-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Select Microphone</CardTitle>
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
              <CardTitle className="text-2xl text-center">Select Camera</CardTitle>
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

        <Button className="self-center" onClick={() => showMediaPicker(false)}>Continue</Button>
      </div>

      <div>
        {
          videoDevice && videoDevice.label ? (
            <video ref={videoPreview}
              className="aspect-video rounded-xl w-full"
              autoPlay
              muted
            />

          ) : (
            <Skeleton className="w-full h-full" />
          )
        }
      </div>


    </div >
  )
}
