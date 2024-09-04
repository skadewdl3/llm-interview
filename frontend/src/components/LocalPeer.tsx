
import {
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
} from '@huddle01/react/hooks';
import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

const LocalPeer = () => {

  const { metadata }: any = useLocalPeer()
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

  useEffect(() => {
    console.log(metadata)
  }, [metadata])

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <p className="absolute bottom-4 left-4">{metadata.displayName}</p>
        <video
          ref={vidRef}
          autoPlay
          muted
          className="border-2 rounded-xl border-white-400 aspect-video w-full"
        />
      </motion.div>

      {shareStream && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <video
            ref={screenVideoRef}
            autoPlay
            muted
            className="border-2 rounded-xl border-white-400 aspect-video"
          />
        </motion.div>
      )}
    </>
  );
};

export default React.memo(LocalPeer);
