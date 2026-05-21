import React from "react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "cyan";
  size?: "sm" | "md" | "lg" | "icon";
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  id,
  className = "",
  ...props
}: AnimatedButtonProps) {
  const baseStyle =
    "relative inline-flex items-center justify-center font-display font-medium rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:pointer-events-none tracking-wide cursor-pointer overflow-hidden group";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    icon: "p-3 rounded-lg"
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_4px_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-purple-400/20",
    cyan:
      "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_4px_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] border border-cyan-400/20",
    secondary:
      "bg-white/5 hover:bg-white/10 text-slate-100 border border-white/10 hover:border-white/20",
    danger:
      "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-400",
    ghost:
      "bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200"
  };

  return (
    <button
      id={id}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Dynamic beam background shine for primary variants */}
      {(variant === "primary" || variant === "cyan") && (
        <span className="absolute inset-0 w-full h-full bg-white/10 transform -scale-x-100 translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out z-0" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
