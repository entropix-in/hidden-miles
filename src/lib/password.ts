import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const PREFIX = "scrypt";

/**
 * Hash a plain-text password with a per-user random salt.
 * Stored as `scrypt:<salt>:<hash>` so the format can evolve later.
 */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH);
  return `${PREFIX}:${salt}:${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [prefix, salt, hash] = stored.split(":");
  if (prefix !== PREFIX || !salt || !hash) return false;

  let expected: Buffer;
  try {
    expected = Buffer.from(hash, "base64url");
  } catch {
    return false;
  }
  if (expected.length !== KEY_LENGTH) return false;

  const derived = await scrypt(
    password.normalize("NFKC"),
    salt,
    KEY_LENGTH,
  ).catch(() => null);
  if (!derived) return false;

  return timingSafeEqual(derived, expected);
}
