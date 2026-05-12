/**
 * Translate raw error messages (mostly from Supabase / network) into
 * user-friendly Mongolian. Falls back to a generic message if nothing matches.
 */

type ErrorLike = {
  message?: string;
  code?: string | number;
  status?: number;
  details?: string;
  hint?: string;
};

const SUPABASE_MESSAGE_MAP: Record<string, string> = {
  "Invalid login credentials": "Имэйл эсвэл нууц үг буруу байна.",
  "Email not confirmed": "Имэйл хаягаа баталгаажуулна уу.",
  "Email rate limit exceeded":
    "Имэйл илгээх хязгаар хэтэрсэн. Хэсэг хүлээгээд дахин оролдоно уу.",
  "User already registered": "Энэ имэйл аль хэдийн бүртгэлтэй байна.",
  "Password should be at least 6 characters":
    "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.",
  "Unable to validate email address: invalid format":
    "Имэйл хаягийн формат буруу байна.",
  "Token has expired or is invalid":
    "Хугацаа дууссан буюу буруу токен. Дахин нэвтрэнэ үү.",
  "JWT expired": "Сесс дууссан. Дахин нэвтрэнэ үү.",
  "User not found": "Хэрэглэгч олдсонгүй.",
  "duplicate key value violates unique constraint":
    "Энэ утга аль хэдийн бүртгэлтэй байна.",
  "violates foreign key constraint":
    "Холбогдох мэдээлэл олдсонгүй.",
  "violates not-null constraint":
    "Шаардлагатай талбар хоосон байна.",
  "row-level security": "Хандах эрхгүй байна.",
  "permission denied": "Хандах эрхгүй байна.",
  "Failed to fetch": "Сүлжээний алдаа гарлаа. Интернетээ шалгана уу.",
  "Network request failed":
    "Сүлжээний алдаа. Интернет холболтоо шалгана уу.",
  "TypeError: fetch failed": "Сүлжээний алдаа. Дахин оролдоно уу.",
};

const STATUS_MAP: Record<number, string> = {
  400: "Хүсэлт буруу байна.",
  401: "Нэвтрэх шаардлагатай.",
  403: "Хандах эрхгүй байна.",
  404: "Олдсонгүй.",
  409: "Зөрчилдсөн өөрчлөлт. Дахин ачаалаад оролдоно уу.",
  422: "Өгсөн мэдээлэл буруу байна.",
  429: "Хэт олон хүсэлт. Хэсэг хүлээгээд дахин оролдоно уу.",
  500: "Серверийн алдаа. Хэсэг хугацааны дараа дахин оролдоно уу.",
  502: "Сервер хариу өгөхгүй байна.",
  503: "Үйлчилгээ түр унтарсан байна.",
  504: "Серверийн хариу удлаа.",
};

const POSTGRES_CODE_MAP: Record<string, string> = {
  "23505": "Энэ утга аль хэдийн бүртгэлтэй байна.",
  "23503": "Холбогдох мэдээлэл олдсонгүй.",
  "23502": "Шаардлагатай талбар хоосон байна.",
  "22P02": "Утгын формат буруу байна.",
  "42501": "Хандах эрхгүй байна.",
  "P0001": "Үйлдлийг гүйцэтгэх боломжгүй.",
};

export function translateError(err: unknown): string {
  if (!err) return "Системийн алдаа. Дахин оролдоно уу.";

  const e = err as ErrorLike;
  const raw = typeof err === "string" ? err : e.message ?? "";

  // 1. Postgres SQLSTATE codes
  if (e.code && typeof e.code === "string" && POSTGRES_CODE_MAP[e.code]) {
    return POSTGRES_CODE_MAP[e.code];
  }

  // 2. HTTP status codes
  if (typeof e.status === "number" && STATUS_MAP[e.status]) {
    return STATUS_MAP[e.status];
  }

  // 3. Match known Supabase / network messages
  for (const [pattern, translation] of Object.entries(SUPABASE_MESSAGE_MAP)) {
    if (raw.toLowerCase().includes(pattern.toLowerCase())) {
      return translation;
    }
  }

  // 4. Generic fallback
  return "Системийн алдаа гарлаа. Дахин оролдоно уу.";
}
