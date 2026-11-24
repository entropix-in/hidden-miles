import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuth } from "@/lib/auth";
import { safeNext } from "@/lib/auth-rules";

export { safeNext } from "@/lib/auth-rules";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  createdAt: Date;
};

export function accountsConfigured() {
  return Boolean(getAuth());
}

/**
 * Resolve the signed-in traveller for this request through Better Auth.
 * Cached per request so multiple server components share one lookup.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const auth = getAuth();
  if (!auth) return null;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return null;
    const { user } = session;
    return {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone ?? "",
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error(
      "[hidden-miles] failed to read session",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
});

/** Send guests to sign in, then back to where they were headed. */
export async function requireUser(nextPath = "/account") {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeNext(nextPath))}`);
  }
  return user;
}
