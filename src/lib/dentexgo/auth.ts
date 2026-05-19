import { constTimeEqual } from "./sign";
import { getSharedSecret } from "./constants";

export function errorJson(
  status: number,
  code: string,
  message: string,
): Response {
  return Response.json({ error: { code, message } }, { status });
}

export function requireBearerAuth(req: Request): Response | null {
  const secret = getSharedSecret();
  if (!secret) {
    return errorJson(
      503,
      "not_configured",
      "DENTEXGO_SHARED_SECRET is not set on the clinic site.",
    );
  }
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || !constTimeEqual(match[1], secret)) {
    return errorJson(401, "unauthorized", "Bearer token missing or invalid.");
  }
  return null;
}
