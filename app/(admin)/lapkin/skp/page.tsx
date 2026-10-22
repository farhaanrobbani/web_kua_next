import { PlaceholderPage } from "@/components/admin/placeholder-page";
import { requireUser } from "@/lib/authz";

export default async function Page() {
  await requireUser(["operator", "superadmin"]);

  return (
    <PlaceholderPage
      title="SKP"
      description="Rekap sasaran kerja pegawai berdasarkan kegiatan harian."
    />
  );
}
