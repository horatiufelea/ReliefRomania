import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import { checkPassword, json } from "../lib/auth.mjs";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// POST /api/upload -> salvează o imagine (corpul cererii = fișierul) și întoarce adresa ei
export default async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!checkPassword(req)) return json({ error: "unauthorized" }, 401);
  const type = (req.headers.get("content-type") || "").split(";")[0].trim();
  if (!TYPES[type]) return json({ error: "unsupported_type" }, 415);
  const buf = await req.arrayBuffer();
  if (buf.byteLength === 0) return json({ error: "empty" }, 400);
  if (buf.byteLength > 3_000_000) return json({ error: "too_large" }, 413);
  const key = `${randomUUID()}.${TYPES[type]}`;
  const store = getStore({ name: "imagini", consistency: "strong" });
  await store.set(key, buf, { metadata: { type } });
  return json({ url: `/api/img/${key}` });
};

export const config = { path: "/api/upload" };
