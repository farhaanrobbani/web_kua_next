import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FilePlus2,
  Trash2,
} from "lucide-react";

import { deleteSubmission } from "@/app/actions/submissions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { PageHeader } from "@/components/admin/page-header";
import { SubmissionStatusForm } from "@/components/admin/submission-status-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/authz";
import { datetimeId } from "@/lib/format";
import {
  parseLetterData,
  parseLetterFields,
} from "@/lib/letters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Permohonan — Surat Digital KUA",
};

const STATUS_CLASS: Record<string, string> = {
  baru: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  diproses: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  selesai:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  ditolak: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

const STATUS_LABEL: Record<string, string> = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();

  const submissionId = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(submissionId)) notFound();

  const submission = await prisma.submissions.findUnique({
    where: { id: submissionId },
    include: { letter_types: true },
  });

  if (!submission) notFound();

  const fields = parseLetterFields(submission.letter_types.fields);
  const data = parseLetterData(submission.data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Permohonan"
        description={submission.letter_types.name}
      >
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/submissions" />}
        >
          <ArrowLeft />
          Daftar Permohonan
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <Badge
          className={
            STATUS_CLASS[submission.status] ?? "bg-muted text-muted-foreground"
          }
        >
          {STATUS_LABEL[submission.status] ?? submission.status}
        </Badge>
        {submission.token ? (
          <Link
            href={`/permohonan/track/${submission.token}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
            title={submission.token}
          >
            Kode tracking: {submission.token}
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Data Permohonan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Pemohon" value={submission.nama_pemohon} />
              <InfoRow label="Kontak" value={submission.kontak} />
              <InfoRow
                label="Jenis Surat"
                value={submission.letter_types.name}
              />
              <InfoRow
                label="Diajukan"
                value={
                  submission.created_at
                    ? datetimeId(submission.created_at)
                    : null
                }
              />
            </dl>

            {submission.catatan ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-medium text-destructive">Catatan</p>
                <p className="mt-1 text-sm">{submission.catatan}</p>
              </div>
            ) : null}

            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-medium">Data Surat yang Diminta</h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                  <InfoRow
                    key={field.name}
                    label={field.label}
                    value={data[field.name] || null}
                  />
                ))}
              </dl>
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Jenis surat ini tidak memiliki field data.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Perbarui Status</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionStatusForm
                submissionId={submission.id}
                status={submission.status}
                catatan={submission.catatan ?? ""}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Tindakan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cetak surat permohonan untuk arsip, lalu buat draft surat dengan
                data permohonan yang sudah terisi otomatis.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  render={
                    <a href={`/submissions/${submission.id}/permohonan`} />
                  }
                >
                  <Download />
                  Cetak Surat Permohonan
                </Button>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link
                      href={`/letters/create?jenis=${encodeURIComponent(
                        submission.letter_types.code,
                      )}&dari=${submission.id}`}
                    />
                  }
                >
                  <FilePlus2 />
                  Buat Surat dari Permohonan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <form action={deleteSubmission.bind(null, submission.id)}>
                <ConfirmSubmit
                  variant="outline"
                  confirmMessage={`Hapus permohonan dari "${submission.nama_pemohon}"?`}
                  pendingLabel="Menghapus…"
                >
                  <Trash2 />
                  Hapus Permohonan
                </ConfirmSubmit>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
