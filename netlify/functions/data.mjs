import { getStore } from "@netlify/blobs";
import { checkPassword, json } from "../lib/auth.mjs";

// GET  /api/data  -> conținutul salvat al dicționarului (sau data: null dacă nu s-a salvat încă nimic)
// PUT  /api/data  -> salvează conținutul; cere parola și eticheta (etag) versiunii pe care s-a lucrat
export default async (req) => {
  const store = getStore({ name: "dictionar", consistency: "strong" });

  if (req.method === "GET") {
    const r = await store.getWithMetadata("data", { type: "json" });
    if (!r) return json({ data: null, etag: null });
    return json({ data: r.data, etag: r.etag });
  }

  if (req.method === "PUT") {
    if (!checkPassword(req)) return json({ error: "unauthorized" }, 401);
    const body = await req.text();
    if (body.length > 4_000_000) return json({ error: "too_large" }, 413);
    let p;
    try { p = JSON.parse(body); } catch { return json({ error: "invalid" }, 400); }
    if (!p || !p.data || !Array.isArray(p.data.pages) || !Array.isArray(p.data.chapters)) {
      return json({ error: "invalid" }, 400);
    }
    const opts = p.etag ? { onlyIfMatch: p.etag } : { onlyIfNew: true };
    const res = await store.setJSON("data", p.data, opts);
    if (!res.modified) return json({ error: "conflict" }, 409);
    return json({ ok: true, etag: res.etag });
  }

  return json({ error: "method_not_allowed" }, 405);
};

export const config = { path: "/api/data" };
