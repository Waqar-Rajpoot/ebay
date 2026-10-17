import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const SALT_BYTES = 16;
const KEY_BYTES = 32;

/** Hashes an access code into "salt:key" (hex). Each call uses a new random salt. */
export async function hashAccessCode(code: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await scryptAsync(code, salt, KEY_BYTES);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

/** Checks a code against a stored hash in constant time. Malformed hashes return false. */
export async function verifyAccessCode(code: string, storedHash: string): Promise<boolean> {
  const [saltHex, keyHex] = storedHash.split(":");
  if (!saltHex || !keyHex) return false;

  const expectedKey = Buffer.from(keyHex, "hex");
  if (expectedKey.length !== KEY_BYTES) return false;

  const actualKey = await scryptAsync(code, Buffer.from(saltHex, "hex"), KEY_BYTES);
  return timingSafeEqual(actualKey, expectedKey);
}