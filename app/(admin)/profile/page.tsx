import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Mail, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/roles";
import { uploadUrl } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profil — Surat Digital KUA",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium sm:col-span-2">{value || "-"}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await requireUser();
  const user = await prisma.users.findUnique({
    where: { id: Number(session.id) },
  });

  const avatar = uploadUrl(user?.foto_profil_url);

  return (
    <div className="space-y-6">
      <PageHeader title="Profil Saya" description="Informasi akun dan data pegawai.">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          <ArrowLeft />
          Dashboard
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Avatar className="size-20">
              {avatar ? <AvatarImage src={avatar} alt={session.name} /> : null}
              <AvatarFallback className="bg-teal-700 text-xl text-white">
                {initials(session.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{session.name}</p>
              <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5" />
                {session.email}
              </p>
            </div>
            <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
              <ShieldCheck />
              {ROLE_LABELS[session.role]}
            </Badge>
            <Badge
              variant="outline"
              className={
                session.isActive
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-destructive"
              }
            >
              <BadgeCheck />
              {session.isActive ? "Akun aktif" : "Akun nonaktif"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Data Pegawai</CardTitle>
            <CardDescription>
              Data ini digunakan pada kop surat dan dokumen resmi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <Row label="Nama lengkap" value={user?.name ?? session.name} />
              <Row label="NIP" value={user?.nip ?? null} />
              <Row label="Jabatan" value={user?.jabatan ?? null} />
              <Row label="Level jabatan" value={user?.level_jabatan ?? null} />
              <Row label="Pangkat" value={user?.pangkat ?? null} />
              <Row label="Ruang golongan" value={user?.ruang_golongan ?? null} />
              <Row label="Instansi" value={user?.instansi ?? null} />
            </dl>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              Pengubahan data pegawai dan password akan tersedia pada modul
              pengaturan akun.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
