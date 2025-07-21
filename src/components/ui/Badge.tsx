import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "secondary",
  className,
}) => {
  const variantClasses = {
    primary: "bg-yellow-500 text-black font-semibold",
    secondary: "bg-gray-600 text-white",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-black font-semibold",
    error: "bg-red-500 text-white",
  };

  const badgeClasses = cn(
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
    variantClasses[variant], 
    className
  );

  return <span className={badgeClasses}>{children}</span>;
}; 