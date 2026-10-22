import { PlaceholderPage } from "@/components/admin/placeholder-page";
import { requireUser } from "@/lib/authz";

export default async function Page() {
  await requireUser(["operator", "superadmin"]);

  return (
    <PlaceholderPage
      title="Daftar Staf"
      description="Kelola data pegawai yang tampil di halaman publik."
    />
  );
}
