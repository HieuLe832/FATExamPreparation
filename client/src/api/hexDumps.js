// Empty in dev (Vite proxies /api). On Vercel, set VITE_API_BASE_URL to the Azure API origin.
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

/** GET /api/hex-dumps/{id}, mapped to the shape the decoders use. */
export async function fetchHexDump(id, signal) {
  const res = await fetch(`${API_BASE}/api/hex-dumps/${encodeURIComponent(id)}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  return {
    title: d.title, note: d.note, kind: d.kind, base: d.baseOffset, pick: d.pickOffset,
    hex: d.rows,
  };
}
