import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { Role } from "@/lib/roles";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role,
    isActive: user.isActive,
  };
}

export async function requireUser(roles?: readonly Role[]): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/yukmasuk");
  }

  if (!user.isActive) {
    redirect("/yukmasuk?nonaktif=1");
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    redirect("/dashboard?akses=ditolak");
  }

  return user;
}
