
import { motion, AnimatePresence } from "framer-motion";
import RemotePeer from "./RemotePeer/RemotePeer";

type Props = {
  peers: string[]
}

const DynamicGrid = ({ peers }: Props) => {
  // Calculate the number of columns based on the number of items
  const columns = Math.ceil(Math.sqrt(peers.length));

  return (
    <div
      className={`grid grid-cols-${columns} gap-4`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      <AnimatePresence>
        {peers.map((peerId) => (
          <motion.div
            key={peerId}
            layout
            layoutId={peerId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <RemotePeer peerId={peerId} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DynamicGrid;
