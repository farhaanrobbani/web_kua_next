import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex items-center justify-between gap-3 text-sm"
    >
      <p className="text-muted-foreground">
        Halaman <span className="font-medium text-foreground">{page}</span> dari{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={href(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page <= 1 && "pointer-events-none opacity-50",
          )}
        >
          <ChevronLeft />
          Sebelumnya
        </Link>
        <Link
          href={href(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page >= totalPages && "pointer-events-none opacity-50",
          )}
        >
          Berikutnya
          <ChevronRight />
        </Link>
      </div>
    </nav>
  );
}
