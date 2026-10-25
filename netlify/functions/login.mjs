import { checkPassword, json } from "../lib/auth.mjs";

// POST /api/login -> verifică parola de administrator
export default async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!checkPassword(req)) return json({ ok: false }, 401);
  return json({ ok: true });
};

export const config = { path: "/api/login" };
