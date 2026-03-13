"use client";

import { useEffect, useState } from "react";

interface ScanLineProps {
  vertical?: boolean;
  color?: string;
  duration?: number;
  opacity?: number;
}

export function ScanLine({ 
  vertical = false, 
  color = "rgba(0, 240, 255, 0.3)", 
  duration = 8,
  opacity = 1
}: ScanLineProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const animName = vertical ? "scanVertical" : "scanHorizontal";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanHorizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes scanVertical {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
      `}} />
      <div 
        className="pointer-events-none absolute z-50 mix-blend-screen"
        style={{
          opacity,
          top: 0,
          left: 0,
          right: vertical ? 0 : "auto",
          bottom: vertical ? "auto" : 0,
          width: vertical ? "100%" : "2px",
          height: vertical ? "2px" : "100%",
          background: vertical 
            ? `linear-gradient(to bottom, transparent, ${color}, transparent)`
            : `linear-gradient(to right, transparent, ${color}, transparent)`,
          boxShadow: `0 0 10px ${color}`,
          animation: `${animName} ${duration}s linear infinite`,
        }}
      />
    </>
  );
}
