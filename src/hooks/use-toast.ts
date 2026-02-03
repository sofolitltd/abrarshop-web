"use client";

import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
};

export function toast({ title, description, variant, action }: ToastProps) {
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      action,
    });
  }

  return sonnerToast(title, {
    description,
    action,
  });
}

export function useToast() {
  return {
    toast,
  };
}
