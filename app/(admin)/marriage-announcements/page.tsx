import { PlaceholderPage } from "@/components/admin/placeholder-page";
import { requireUser } from "@/lib/authz";

export default async function Page() {
  await requireUser(["operator", "superadmin"]);

  return (
    <PlaceholderPage
      title="Pengumuman Nikah"
      description="Kelola jadwal akad dan pengumuman nikah."
    />
  );
}
