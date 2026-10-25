import { getStore } from "@netlify/blobs";

// GET /api/img/<cheie> -> servește o imagine încărcată din administrare
export default async (req, context) => {
  const key = context.params?.key || "";
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(key)) return new Response("Not found", { status: 404 });
  const store = getStore({ name: "imagini" });
  const r = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!r) return new Response("Not found", { status: 404 });
  return new Response(r.data, {
    headers: {
      "content-type": r.metadata?.type || "image/jpeg",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};

export const config = { path: "/api/img/:key" };
