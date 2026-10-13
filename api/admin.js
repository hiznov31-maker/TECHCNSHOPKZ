// Админка наличия. Пароль задаётся в Vercel: переменная ADMIN_PASSWORD.
import crypto from "node:crypto";
import { kvOn, getStock, setStock } from "./_kv.js";

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method" }); }
  const pass = process.env.ADMIN_PASSWORD || "";
  if (pass.length < 8) return res.status(500).json({ error: "no_password_configured" });
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (!crypto.timingSafeEqual(sha(b.password || ""), sha(pass))) { await sleep(700); return res.status(401).json({ error: "bad_password" }); }
  if (!kvOn()) {
    if (b.action === "set") return res.status(503).json({ error: "storage_not_connected" });
    return res.status(200).json({ kv: false, stock: {} });
  }
  try {
    if (b.action === "set") {
      const id = String(b.id || "");
      if (!/^[a-z0-9]{2,20}$/.test(id)) return res.status(400).json({ error: "bad_id" });
      if (!["in", "order", "out"].includes(b.s)) return res.status(400).json({ error: "bad_status" });
      const stock = await getStock();
      stock[id] = { s: b.s, note: String(b.note == null ? "" : b.note).replace(/[\u0000-\u001F<>]/g, "").trim().slice(0, 140) };
      await setStock(stock);
      return res.status(200).json({ kv: true, stock });
    }
    return res.status(200).json({ kv: true, stock: await getStock() });
  } catch (e) {
    console.error("admin failed:", e && e.message);
    return res.status(502).json({ error: "storage_error" });
  }
}
