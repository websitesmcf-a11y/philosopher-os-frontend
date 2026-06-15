"use client"
import * as React from "react"
import { motion } from "motion/react";

export function ShiningText({ text, className }: { text: string; className?: string }) {
  return (
    <motion.h1
      className={className}
      style={{
        backgroundImage: "linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)",
        backgroundSize: "200% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        fontWeight: "regular",
      }}
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
    >
      {text}
    </motion.h1>
  );
}
