import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ClipboardList, XCircle } from "lucide-react";

import { datetimeNumericId } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { submissionStatus } from "@/lib/submission-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tracking Permohonan",
};

const STATUS_ORDER = ["baru", "diproses", "selesai"] as const;

export default async function TrackingPermohonanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const submission = await prisma.submissions.findUnique({
    where: { token },
    include: { letter_types: { select: { name: true } } },
  });

  if (!submission) notFound();

  const rejected = submission.status === "ditolak";
  const currentKey = rejected ? "ditolak" : submission.status;
  const currentIndex = STATUS_ORDER.indexOf(
    currentKey as (typeof STATUS_ORDER)[number],
  );
  const currentInfo = submissionStatus(currentKey);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-lg border border-teal-100 bg-white p-8 shadow-sm">
        <h1 className="mb-6 flex items-center justify-center gap-2 text-center text-xl font-bold text-gray-800">
          <ClipboardList className="h-5 w-5 text-teal-700" />
          Status Permohonan
        </h1>

        <div className="mb-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Jenis Surat</span>
            <span className="text-right font-medium text-gray-800">
              {submission.letter_types.name}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Pemohon</span>
            <span className="text-right font-medium text-gray-800">
              {submission.nama_pemohon}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Tanggal</span>
            <span className="text-right font-medium text-gray-800">
              {submission.created_at
                ? datetimeNumericId(submission.created_at)
                : "—"}
            </span>
          </div>
        </div>

        <hr className="mb-6 border-gray-100" />

        {rejected ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <XCircle className="mx-auto mb-1 h-7 w-7 text-red-600" />
            <div className="font-semibold text-red-700">
              Permohonan Ditolak
            </div>
            {submission.catatan ? (
              <p className="mt-2 text-sm text-red-600">
                Catatan: {submission.catatan}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-0">
            {STATUS_ORDER.map((key, index) => {
              const isPassed = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    {isPassed ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 ring-4 ring-teal-100">
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                      </div>
                    )}
                    {index < STATUS_ORDER.length - 1 ? (
                      <div
                        className={`h-6 w-0.5 ${
                          isPassed ? "bg-green-200" : "bg-gray-200"
                        }`}
                      />
                    ) : null}
                  </div>
                  <div className="pb-4 pt-1">
                    <span
                      className={`text-sm font-medium ${
                        isCurrent
                          ? "text-teal-700"
                          : isPassed
                            ? "text-green-700"
                            : "text-gray-400"
                      }`}
                    >
                      {submissionStatus(key).label}
                    </span>
                    {isCurrent ? (
                      <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-700">
                        Saat Ini
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {submission.catatan && !rejected ? (
          <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <span className="font-medium text-gray-700">Catatan:</span>{" "}
            <span className="text-gray-600">{submission.catatan}</span>
          </div>
        ) : null}

        <div className="mt-6 text-center">
          <Link
            href="/permohonan"
            className="text-sm text-teal-700 hover:underline"
          >
            Ajukan permohonan lain
          </Link>
        </div>

        <p className="sr-only">Status: {currentInfo.label}</p>
      </div>
    </div>
  );
}
