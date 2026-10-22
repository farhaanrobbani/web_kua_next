import type { Metadata } from "next";

import { TrackForm } from "@/components/public/track-form";

export const metadata: Metadata = {
  title: "Cek Status Permohonan",
};

export default function CekPermohonanPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <TrackForm />
    </div>
  );
}
