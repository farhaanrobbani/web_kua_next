import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";

import { PublicSubmissionForm } from "@/components/public/public-submission-form";
import { parseLetterFields } from "@/lib/letters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Permohonan Surat",
};

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function PermohonanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const code = single((await searchParams).jenis).trim();

  const [letterTypes, service] = await Promise.all([
    prisma.letter_types.findMany({
      where: { active: true, publik: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        fields: true,
        permohonan_informasi: true,
      },
    }),
    prisma.pages
      .findFirst({ where: { key: "layanan-permohonan", active: true } })
      .catch(() => null),
  ]);

  const selectedType = code
    ? (letterTypes.find((item) => item.code === code) ?? null)
    : null;

  if (code !== "" && !selectedType) notFound();

  const fields = selectedType
    ? parseLetterFields(selectedType.fields).filter((field) => !field.internal)
    : [];

  const title = service?.title?.trim() || "Form Permohonan Surat";
  const description =
    service?.description?.trim() ||
    "Isi form berikut, kemudian petugas KUA akan memproses permohonan Anda.";

  return (
    <div className="py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          <Link
            href="/permohonan/cek"
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-teal-400 hover:text-teal-700"
          >
            <Search className="h-4 w-4" />
            Cek Status Permohonan
          </Link>
        </div>

        {!selectedType ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-800">
              Pilih Jenis Surat
            </h2>
            {letterTypes.length === 0 ? (
              <p className="text-sm text-gray-500">
                Belum ada jenis surat yang dapat diajukan secara online.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {letterTypes.map((type) => (
                  <Link
                    key={type.id}
                    href={`/permohonan?jenis=${encodeURIComponent(type.code)}`}
                    className="rounded-lg border border-gray-200 p-4 transition hover:border-teal-400 hover:shadow"
                  >
                    <div className="font-semibold text-gray-800">
                      {type.name}
                    </div>
                    {type.description ? (
                      <div className="mt-1 text-sm text-gray-500">
                        {type.description}
                      </div>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <PublicSubmissionForm
            letterTypeCode={selectedType.code}
            letterTypeName={selectedType.name}
            fields={fields}
            informasi={selectedType.permohonan_informasi}
          />
        )}
      </div>
    </div>
  );
}
