import { PlaceholderPage } from "@/components/admin/placeholder-page";
import { requireUser } from "@/lib/authz";

export default async function Page() {
  await requireUser(["operator", "superadmin"]);

  return (
    <PlaceholderPage
      title="Download Center"
      description="Kelola berkas unduhan dan tautan eksternal."
    />
  );
}
