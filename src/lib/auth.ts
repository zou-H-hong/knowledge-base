import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "admin_token";
const EXPIRE_DAYS = 7;

function sign(value: string): string {
  const secret = process.env.AUTH_SECRET || "default-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createToken(): string {
  const expires = Date.now() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
  const payload = `admin:${expires}`;
  const signature = sign(payload);
  return `${payload}:${signature}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [role, expires, signature] = parts;
  const payload = `${role}:${expires}`;
  if (sign(payload) !== signature) return false;
  if (Date.now() > Number(expires)) return false;
  return role === "admin";
}

export function isAdmin(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyToken(token);
}

export function cookieName(): string {
  return COOKIE_NAME;
}

export function cookieMaxAge(): number {
  return EXPIRE_DAYS * 24 * 60 * 60;
}
