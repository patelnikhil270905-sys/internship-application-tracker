import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function GlassCard({ children, className = "", id, onClick, hoverable = true }: GlassCardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-neutral-950/40 backdrop-blur-xl border border-white/10 p-6 transition-all duration-500 shadow-2xl ${
        hoverable ? "hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:-translate-y-0.5 cursor-pointer" : ""
      } ${className}`}
    >
      {/* Soft overlay gradient flare */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none select-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none select-none" />
      
      {/* Real inner content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
