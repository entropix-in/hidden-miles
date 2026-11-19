import { createHash, randomBytes } from "crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { passwordResets, userSessions, users } from "@/db/schema";

const RESET_DURATION_MS = 1000 * 60 * 60;

function tokenId(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export type PasswordResetTarget = {
  userId: number;
  name: string;
  email: string;
};

/**
 * Issue a fresh reset token for a user. Any earlier link stops working.
 * Returns the raw token (only place it exists outside the email).
 */
export async function createPasswordResetToken(userId: number) {
  const db = getDb();
  if (!db) return null;

  const token = randomBytes(32).toString("base64url");

  await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  await db.insert(passwordResets).values({
    id: tokenId(token),
    userId,
    expiresAt: new Date(Date.now() + RESET_DURATION_MS),
  });

  await db
    .delete(passwordResets)
    .where(lt(passwordResets.expiresAt, new Date()))
    .catch(() => undefined);

  return token;
}

export async function findPasswordReset(
  token: string,
): Promise<PasswordResetTarget | null> {
  if (!token) return null;
  const db = getDb();
  if (!db) return null;

  try {
    const [row] = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
      })
      .from(passwordResets)
      .innerJoin(users, eq(users.id, passwordResets.userId))
      .where(
        and(
          eq(passwordResets.id, tokenId(token)),
          gt(passwordResets.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!row) return null;
    return { userId: Number(row.userId), name: row.name, email: row.email };
  } catch {
    return null;
  }
}

/**
 * Set the new password, burn every reset link and sign the user out everywhere.
 */
export async function applyPasswordReset(token: string, passwordHash: string) {
  const db = getDb();
  if (!db) return null;

  const target = await findPasswordReset(token);
  if (!target) return null;

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, target.userId));

  await db
    .delete(passwordResets)
    .where(eq(passwordResets.userId, target.userId));
  await db
    .delete(userSessions)
    .where(eq(userSessions.userId, target.userId));

  return target;
}
