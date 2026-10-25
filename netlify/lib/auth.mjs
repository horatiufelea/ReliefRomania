import { createHash, timingSafeEqual } from "node:crypto";

// Parola de administrator se setează în Netlify: Site configuration > Environment variables > ADMIN_PASSWORD
export function checkPassword(req) {
  const expected = globalThis.Netlify?.env?.get?.("ADMIN_PASSWORD") ?? process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const got = req.headers.get("x-admin-password") || "";
  const a = createHash("sha256").update(got).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
