import { ReactNode } from "react";
import Link from "next/link";

interface GlowButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  icon?: ReactNode;
  disabled?: boolean;
}

export function GlowButton({ children, href, onClick, type = "button", className = "", variant = "primary", icon, disabled }: GlowButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center gap-2 px-6 py-3 font-heading font-semibold rounded-lg transition-all duration-300 overflow-hidden group";
  
  let variantClasses = "";
  if (variant === "primary") {
    variantClasses = "bg-[#00F0FF] text-[#030712] hover:bg-[#2CEFFF] shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] hover:-translate-y-0.5";
  } else if (variant === "outline") {
    // Animated gradient border
    variantClasses = `
      text-[#F0F6FF] bg-[#0A0F1C] 
      before:absolute before:-inset-[1px] before:-z-10 before:rounded-lg
      before:bg-gradient-to-r before:from-[#00F0FF] before:via-[#8B5CF6] before:to-[#00FF88] before:bg-[length:200%_auto]
      before:animate-[shimmer_3s_linear_infinite]
      hover:text-[#00F0FF] hover:-translate-y-0.5
    `;
  } else if (variant === "ghost") {
    variantClasses = "text-[#94A3B8] hover:text-[#00F0FF] hover:bg-[rgba(0,240,255,0.05)]";
  }

  const content = (
    <>
      {variant === "primary" && (
        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && <span className="group-hover:translate-x-1 transition-transform">{icon}</span>}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${variantClasses} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}>
      {content}
    </button>
  );
}
