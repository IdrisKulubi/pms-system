"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  readonly?: boolean;
  onValueChange?: (value: number) => void;
}

export function Rating({
  value,
  max = 5,
  readonly = true,
  onValueChange,
  className,
  ...props
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  return (
    <div 
      className={cn("flex gap-1", className)} 
      {...props}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = (hoverValue ?? value) >= starValue;

        return (
          <button
            key={i}
            type="button"
            className={cn(
              "p-0 h-4 w-4",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform",
            )}
            onClick={() => {
              if (!readonly && onValueChange) {
                onValueChange(starValue);
              }
            }}
            onMouseEnter={() => {
              if (!readonly) {
                setHoverValue(starValue);
              }
            }}
            onMouseLeave={() => {
              if (!readonly) {
                setHoverValue(null);
              }
            }}
            disabled={readonly}
          >
            <Star
              className={cn(
                "h-4 w-4",
                filled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "fill-none text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
} 