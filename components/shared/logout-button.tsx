'use client';

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function LogoutButton({ variant = "outline", className }: LogoutButtonProps) {
  return (
    <Button 
      variant={variant} 
      onClick={() => logout()} 
      className={className}
    >
      Logout
    </Button>
  );
} 