import { createHmac, timingSafeEqual } from "node:crypto";

export function signBody(body: string, secret: string): string {
  return "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
}

export function constTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifySignature(
  body: string,
  header: string | null,
  secret: string,
): boolean {
  if (!header) return false;
  return constTimeEqual(signBody(body, secret), header);
}
