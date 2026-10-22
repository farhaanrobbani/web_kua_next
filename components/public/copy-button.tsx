"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded bg-teal-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-teal-700"
    >
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}
