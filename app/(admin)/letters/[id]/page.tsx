import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  FilePenLine,
  Send,
  Trash2,
  Upload,
} from "lucide-react";

import {
  approveLetter,
  deleteLetter,
  publishLetter,
  submitLetter,
} from "@/app/actions/letters";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { PageHeader } from "@/components/admin/page-header";
import { RejectLetterDialog } from "@/components/admin/reject-letter-dialog";
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
  letterStatusClass,
  letterStatusLabel,
} from "@/lib/letter-status";
import {
  parseLetterData,
  parseLetterFields,
  renderLetterHeader,
  tanggalSuratId,
} from "@/lib/letters";
import { prisma } from "@/lib/prisma";
import { canApproveLetters } from "@/lib/roles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Surat — Surat Digital KUA",
};

const ERROR_MESSAGES: Record<string, string> = {
  status: "Tindakan tidak sesuai dengan status surat saat ini.",
  akses: "Anda tidak memiliki akses untuk melakukan tindakan tersebut.",
  nomor: "Nomor surat wajib diisi sebelum surat diterbitkan.",
  tanggal: "Tanggal surat wajib diisi sebelum surat diterbitkan.",
};

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

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

export default async function LetterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireUser();
  const letterId = Number.parseInt((await params).id, 10);

  if (!Number.isInteger(letterId)) notFound();

  const letter = await prisma.letters.findUnique({
    where: { id: letterId },
    include: {
      letter_types: true,
      users_letters_created_byTousers: { select: { name: true } },
      users_letters_approved_byTousers: { select: { name: true } },
    },
  });

  if (!letter) notFound();

  const errorKey = single((await searchParams).error);
  const errorMessage = ERROR_MESSAGES[errorKey];
  const fields = parseLetterFields(letter.letter_types.fields);
  const data = parseLetterData(letter.data);
  const header = renderLetterHeader(letter);
  const canApprove = canApproveLetters(session.role);
  const editable = ["draft", "ditolak", "disetujui"].includes(letter.status);

  return (
    <div className="space-y-6">
      <PageHeader title="Detail Surat" description={letter.letter_types.name}>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/letters" />}
        >
          <ArrowLeft />
          Arsip Surat
        </Button>
      </PageHeader>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Badge className={letterStatusClass(letter.status)}>
          {letterStatusLabel(letter.status)}
        </Badge>
        {letter.nomor ? (
          <span className="font-mono text-sm text-muted-foreground">
            {letter.nomor}
          </span>
        ) : null}
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Informasi Surat</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Jenis Surat" value={letter.letter_types.name} />
            <InfoRow label="Perihal" value={letter.perihal} />
            <InfoRow label="Nomor Surat" value={letter.nomor} />
            <InfoRow
              label="Tanggal Surat"
              value={
                letter.tanggal_surat
                  ? tanggalSuratId(letter.tanggal_surat)
                  : null
              }
            />
            <InfoRow
              label="Dibuat oleh"
              value={
                letter.users_letters_created_byTousers?.name
                  ? `${letter.users_letters_created_byTousers.name}${
                      letter.created_at
                        ? ` · ${datetimeId(letter.created_at)}`
                        : ""
                    }`
                  : null
              }
            />
            <InfoRow
              label="Disetujui oleh"
              value={
                letter.users_letters_approved_byTousers?.name
                  ? `${letter.users_letters_approved_byTousers.name}${
                      letter.approved_at
                        ? ` · ${datetimeId(letter.approved_at)}`
                        : ""
                    }`
                  : null
              }
            />
          </dl>

          {letter.keterangan ? (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-xs font-medium text-destructive">
                Catatan penolakan
              </p>
              <p className="mt-1 text-sm">{letter.keterangan}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Pratinjau Surat</CardTitle>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={`/letters/${letter.id}/preview`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <ExternalLink />
              Buka Tab Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <iframe
            src={`/letters/${letter.id}/preview`}
            title="Pratinjau surat"
            className="h-[80vh] min-h-[600px] w-full rounded-md border bg-white"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Data Surat</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Jenis surat ini tidak memiliki field data.
            </p>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <InfoRow
                  key={field.name}
                  label={field.label}
                  value={data[field.name] || null}
                />
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Baris Atas Surat</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-md bg-muted/40 p-3 text-sm [&_p]:mb-2 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: header }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3">
          {letter.status === "draft" ? (
            <>
              <form action={submitLetter.bind(null, letter.id)}>
                <Button type="submit">
                  <Send />
                  Ajukan ke Kepala KUA
                </Button>
              </form>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={`/letters/${letter.id}/edit`} />}
              >
                <FilePenLine />
                Edit
              </Button>
            </>
          ) : null}

          {letter.status === "diajukan" ? (
            canApprove ? (
              <>
                <form action={approveLetter.bind(null, letter.id)}>
                  <Button type="submit">
                    <CheckCircle2 />
                    Setujui
                  </Button>
                </form>
                <RejectLetterDialog letterId={letter.id} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Surat sedang menunggu persetujuan Kepala KUA.
              </p>
            )
          ) : null}

          {letter.status === "disetujui" ? (
            <>
              <form action={publishLetter.bind(null, letter.id)}>
                <Button type="submit">
                  <Upload />
                  Terbitkan
                </Button>
              </form>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={`/letters/${letter.id}/edit`} />}
              >
                <FilePenLine />
                Edit
              </Button>
            </>
          ) : null}

          {letter.status === "terbit" ? (
            <Button
              nativeButton={false}
              render={<a href={`/letters/${letter.id}/pdf`} />}
            >
              <Download />
              Unduh PDF
            </Button>
          ) : null}

          {editable || letter.status === "terbit" ? (
            <form action={deleteLetter.bind(null, letter.id)}>
              <ConfirmSubmit
                variant="outline"
                confirmMessage={`Hapus surat "${letter.perihal}"? Tindakan ini tidak bisa dibatalkan.`}
                pendingLabel="Menghapus…"
              >
                <Trash2 />
                Hapus
              </ConfirmSubmit>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
