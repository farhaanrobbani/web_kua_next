import Link from "next/link";
import { Construction } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Construction className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Modul ini sedang diporting</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Halaman {title} sudah terhubung ke navigasi admin, tetapi fitur
              lengkapnya belum diimplementasikan pada milestone ini.
            </p>
          </div>
          <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
            Kembali ke dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
