"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UploadCloud } from "lucide-react";

interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  verification: string;
  weight: number;
  className?: string;
  goalId: string;
}

export function ProgressCard({
  title,
  current,
  target,
  verification,
  weight,
  className,
  goalId,
}: ProgressCardProps) {
  const progress = (current / target) * 100;

  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium">{title}</h3>
        <span className="text-sm bg-accent px-2 py-1 rounded-full">
          {weight}% Weight
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress: {current}/{target}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground">
          Verification: {verification}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          asChild
        >
          <Link to={`/dashboard/evidence/${goalId}`}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Submit Evidence
          </Link>
        </Button>
      </div>
    </div>
  );
} 