import React from "react";
import { cn } from "@/lib/utils";
import { CardProps } from "@/types";

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className,
  header,
  footer,
  contentClassName,
}) => {
  const cardClasses = cn("bg-gray-800 border border-gray-700 rounded-xl shadow-xl", className);
  
  return (
    <div className={cardClasses}>
      {(title || subtitle || header) && (
        <div className="p-6 border-b border-gray-700">
          {header || (
            <div className="space-y-1">
              {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
          )}
        </div>
      )}
      <div className={cn(contentClassName || "p-6")}>{children}</div>
      {footer && <div className="p-6 border-t border-gray-700">{footer}</div>}
    </div>
  );
}; 