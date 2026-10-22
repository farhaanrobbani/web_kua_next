import { PlaceholderPage } from "@/components/admin/placeholder-page";
import { requireUser } from "@/lib/authz";

export default async function Page() {
  await requireUser(["superadmin"]);

  return (
    <PlaceholderPage
      title="Pengaturan Web"
      description="Atur identitas KUA, kontak, logo, dan integrasi layanan."
    />
  );
}
