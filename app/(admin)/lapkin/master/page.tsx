import { PlaceholderPage } from "@/components/admin/placeholder-page";
import { requireUser } from "@/lib/authz";

export default async function Page() {
  await requireUser(["operator", "superadmin"]);

  return (
    <PlaceholderPage
      title="Master Data Harian"
      description="Kelola data master target dan realisasi layanan harian."
    />
  );
}
