import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "cyan" | "green" | "purple" | "amber" | "red";
  animateIn?: boolean;
  delayIndex?: number;
}

export function GlassCard({ children, className = "", glowColor, animateIn = false, delayIndex = 0 }: GlassCardProps) {
  let glowClass = "";
  if (glowColor === "cyan") glowClass = "hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-[#00F0FF]/30";
  if (glowColor === "green") glowClass = "hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00FF88]/30";
  if (glowColor === "purple") glowClass = "hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:border-[#8B5CF6]/30";
  if (glowColor === "amber") glowClass = "hover:shadow-[0_0_20px_rgba(255,184,0,0.15)] hover:border-[#FFB800]/30";
  if (glowColor === "red") glowClass = "hover:shadow-[0_0_20px_rgba(255,51,102,0.15)] hover:border-[#FF3366]/30";

  const delayClass = delayIndex > 0 ? `delay-${delayIndex * 100}` : "";
  const animClass = animateIn ? `animate-in ${delayClass}` : "";

  return (
    <div className={`
      relative overflow-hidden
      bg-[#111827]/60 backdrop-blur-md 
      border border-white/5 
      rounded-xl 
      transition-all duration-300 ease-out hover:-translate-y-1
      ${glowClass}
      ${animClass}
      ${className}
    `}>
      {/* Subtle top glare effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {/* Subtle corner bracket styling */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 rounded-tl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10 rounded-br-xl pointer-events-none" />
      
      {children}
    </div>
  );
}
