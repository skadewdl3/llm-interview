
import {
  useLocalScreenShare,
  useLocalVideo,
} from '@huddle01/react/hooks';
import React, { useEffect, useRef } from 'react';

const LocalPeer = () => {
  const { stream } = useLocalVideo()
  const { shareStream } =
    useLocalScreenShare();

  const vidRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('stream', stream);
    if (stream && vidRef.current) {
      vidRef.current.srcObject = stream;

      vidRef.current.onloadedmetadata = async () => {
        try {
          vidRef.current?.play();
        } catch (error) {
          console.error(error);
        }
      };

      vidRef.current.onerror = () => {
        console.error('videoCard() | Error is hapenning...');
      };
    }
  }, [stream]);

  useEffect(() => {
    if (shareStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = shareStream;

      screenVideoRef.current.onloadedmetadata = async () => {
        try {
          screenVideoRef.current?.play();
        } catch (error) {
          console.error(error);
        }
      };

      screenVideoRef.current.onerror = () => {
        console.error('videoCard() | Error is hapenning...');
      };
    }
  }, [shareStream]);


  return (
    <div className="flex flex-col gap-2">
      <video
        ref={vidRef}
        autoPlay
        muted
        className="border-2 rounded-xl border-white-400 aspect-video"
      />
      {shareStream && (
        <video
          ref={screenVideoRef}
          autoPlay
          muted
          className="border-2 rounded-xl border-white-400 aspect-video"
        />
      )}
    </div>
  );
};

export default React.memo(LocalPeer);
