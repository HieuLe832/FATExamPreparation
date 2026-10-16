// Empty in dev (Vite proxies /api). On Vercel, set VITE_API_BASE_URL to the Azure API origin.
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

// One request per dump, shared by every step that shows it. A failed request is forgotten so "Thử lại" refetches.
const cache = new Map();

/** GET /api/hex-dumps/{id}, mapped to the shape the decoders use. */
export function fetchHexDump(id) {
  if (!cache.has(id)) {
    const request = fetch(`${API_BASE}/api/hex-dumps/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        return { title: d.title, note: d.note, kind: d.kind, base: d.baseOffset, hex: d.rows };
      })
      .catch((err) => { cache.delete(id); throw err; });
    cache.set(id, request);
  }
  return cache.get(id);
}
