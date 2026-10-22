import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CheckCircle2 } from "lucide-react";

import { TrackLink } from "@/components/public/track-link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Permohonan Terkirim",
};

export default async function SuksesPermohonanPage() {
  const token = (await cookies()).get("permohonan_unduh")?.value ?? "";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-lg border border-teal-100 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">
          Permohonan Terkirim
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Terima kasih. Permohonan Anda telah kami terima dan akan diproses oleh
          petugas KUA. Silakan datang ke kantor KUA dengan membawa dokumen
          persyaratan atau menunggu konfirmasi dari petugas melalui kontak yang
          Anda berikan.
        </p>

        {token ? (
          <div className="mt-6 space-y-3">
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-left text-sm">
              <div className="mb-1 font-medium text-teal-800">
                Link Tracking Permohonan
              </div>
              <p className="mb-2 text-teal-700">
                Simpan link ini untuk mengecek status permohonan Anda kapan
                saja:
              </p>
              <TrackLink token={token} />
            </div>
            <Link
              href={`/permohonan/unduh/${token}`}
              className="inline-block rounded-md bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              Download Surat Permohonan (PDF)
            </Link>
          </div>
        ) : null}

        <Link
          href="/permohonan"
          className="mt-6 inline-block text-sm text-teal-700 hover:underline"
        >
          Ajukan permohonan lain
        </Link>
      </div>
    </div>
  );
}
