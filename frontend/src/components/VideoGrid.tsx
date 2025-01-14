// @ts-nocheck
import { motion, AnimatePresence } from "framer-motion";
import React from 'react'
import RemotePeer from "./RemotePeer/RemotePeer";

type Props = {
  children: React.ReactNode[]
}

const VideoGrid: React.FC<Props> = ({ children: _children }) => {
  // Calculate the number of columns based on the number of items
  const children = React.Children.toArray(_children).flat();
  console.log(children)
  const columns = Math.ceil(Math.sqrt(children.length));

  return (
    <div
      className={`grid grid-cols-${columns} gap-4 s-screen max-h-screen`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      <AnimatePresence>
        {
          children.map((child, index) => child)
        }
      </AnimatePresence>
    </div>
  );
};

export default VideoGrid;
