import { motion } from "framer-motion";
import React from "react";

export default function MotionDiv({
  children,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      transition={{ duration: 0.25, type: "spring" }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      layout
    >
      <div {...{ ...props }}>{children}</div>
    </motion.div>
  );
}
