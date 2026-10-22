import { PlaceholderPage } from "@/components/admin/placeholder-page";
import { requireUser } from "@/lib/authz";

export default async function Page() {
  await requireUser(["superadmin"]);

  return (
    <PlaceholderPage
      title="Akun"
      description="Kelola akun pengguna, peran, dan status aktif."
    />
  );
}
