import { PlaceholderPage } from "@/components/admin/placeholder-page";
import { requireUser } from "@/lib/authz";

export default async function Page() {
  await requireUser(["operator", "superadmin"]);

  return (
    <PlaceholderPage
      title="Jenis Surat"
      description="Atur jenis surat, field formulir, dan pengaturan kop surat."
    />
  );
}
