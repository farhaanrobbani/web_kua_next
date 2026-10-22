"use client";

import { useSyncExternalStore } from "react";

import { CopyButton } from "@/components/public/copy-button";

const subscribe = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export function TrackLink({ token }: { token: string }) {
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const url = `${origin}/permohonan/track/${token}`;

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 break-all rounded border border-teal-200 bg-white px-3 py-2 text-xs text-teal-800">
        {url}
      </code>
      <CopyButton value={url} />
    </div>
  );
}
