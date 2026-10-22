"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function ConfirmSubmit({
  children,
  confirmMessage,
  pendingLabel = "Memproses…",
  variant = "destructive",
  size = "sm",
}: {
  children: React.ReactNode;
  confirmMessage: string;
  pendingLabel?: string;
  variant?: "default" | "outline" | "destructive" | "ghost" | "secondary";
  size?: "default" | "sm" | "xs" | "lg";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
