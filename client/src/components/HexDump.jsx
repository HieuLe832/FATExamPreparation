import { useEffect, useMemo, useState } from "react";
import { fetchHexDump } from "../api/hexDumps.js";
import { parseHex } from "../fat/dumps.js";
import { annotate, h2, hx } from "../fat/annotate.js";

const COLS = Array.from({ length: 16 }, (_, c) => c);

/**
 * Loads one dump of the mini disk from the backend, then renders it.
 * `focus`: [[offset, length], …] absolute byte ranges this step talks about; everything else is dimmed.
 * `from` / `to`: absolute offsets of the first and last row to show (default: the whole dump).
 * `bands`: [[offset, length], …] ranges painted in band colours 1, 2, 3… (overrides the field colours).
 */
export default function HexDump({ id, focus, from, to, bands }) {
  const [state, setState] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    fetchHexDump(id)
      .then((dump) => alive && setState({ status: "ready", dump }))
      .catch((err) => alive && setState({ status: "error", message: err.message }));
    return () => { alive = false; };
  }, [id, attempt]);

  if (state.status === "ready") return <HexDumpView d={state.dump} focus={focus} from={from} to={to} bands={bands} />;
  return (
    <div className="dump">
      <div className="info" role={state.status === "error" ? "alert" : "status"}>
        {state.status === "loading" ? (
          <div className="what">Đang tải hex dump…</div>
        ) : (
          <>
            <div className="what">Chưa tải được hex dump ({state.message}).</div>
            <div className="calc">
              {import.meta.env.DEV
                ? <>Chạy backend bằng <b>dotnet run --project server</b> rồi bấm thử lại.</>
                : "Máy chủ có thể đang khởi động sau một lúc không ai dùng. Đợi khoảng 20 giây rồi bấm thử lại."}
            </div>
            <button type="button" className="retry" onClick={() => setAttempt((n) => n + 1)}>Thử lại</button>
          </>
        )}
      </div>
    </div>
  );
}

/** Clickable hex dump: each byte belongs to a field segment; selecting one explains it. */
function HexDumpView({ d, focus, from, to, bands }) {
  const { bytes, segs, owner } = useMemo(() => {
    const bytes = parseHex(d.hex);
    const segs = annotate(d.kind, bytes, d.base);
    const owner = new Array(bytes.length);
    segs.forEach((s, si) => { for (let k = 0; k < s.len; k++) owner[s.start + k] = si; });
    return { bytes, segs, owner };
  }, [d]);
  const [sel, setSel] = useState(null);
  const cur = sel === null ? null : segs[sel];

  const firstRow = from === undefined ? 0 : (from - d.base) / 16;
  const lastRow = to === undefined ? bytes.length / 16 - 1 : (to - d.base) / 16;
  const rows = Array.from({ length: lastRow - firstRow + 1 }, (_, i) => firstRow + i);
  const inFocus = (i) => !focus || focus.some(([o, n]) => d.base + i >= o && d.base + i < o + n);
  const band = (i) => (bands ?? []).findIndex(([o, n]) => d.base + i >= o && d.base + i < o + n) + 1;

  const cellClass = (i, c) => {
    const s = segs[owner[i]];
    let cls = "b " + s.cls + (c === 8 ? " gap" : "") + (inFocus(i) ? "" : " dim") + (band(i) ? ` band-${band(i)}` : "");
    if (owner[i] === sel) {
      cls += " sel";
      if (i === s.start || c === 0) cls += " sel-l";
      if (i === s.start + s.len - 1 || c === 15) cls += " sel-r";
    }
    return cls;
  };
  const pick = (i) => setSel(owner[i]);
  const onKey = (e, i) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(i); }
  };

  return (
    <div className="dump">
      <div className="dump-head">
        <h4>{d.title}</h4>
      </div>
      <div className="hexwrap">
        <div className="hex" aria-label={d.title}>
          <div className="row colhead">
            <span className="off">Offset</span>
            <span className="bytes">
              {COLS.map((c) => <span key={c} className={"b" + (c === 8 ? " gap" : "")} style={{ cursor: "default" }}>{c.toString(16).toUpperCase()}</span>)}
            </span>
          </div>
          {rows.map((r) => (
            <div className="row" key={r}>
              <span className="off">{(d.base + r * 16).toString(16).toUpperCase().padStart(8, "0")}</span>
              <span className="bytes">
                {COLS.map((c) => {
                  const i = r * 16 + c, first = segs[owner[i]].start === i;
                  return (
                    <span key={c} className={cellClass(i, c)} onClick={() => pick(i)}
                      {...(first ? { tabIndex: 0, role: "button", onKeyDown: (e) => onKey(e, i) } : {})}>
                      {h2(bytes[i])}
                    </span>
                  );
                })}
              </span>
              <span className="asc">
                {COLS.map((c) => { const ch = bytes[r * 16 + c]; return ch >= 0x20 && ch < 0x7f ? String.fromCharCode(ch) : "."; }).join("")}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="info" aria-live="polite">
        {cur ? (
          <>
            <div className="what" dangerouslySetInnerHTML={{ __html: `${hx(d.base + cur.start, 5)} · ${cur.what}` }} />
            {cur.calc && <div className="calc" dangerouslySetInnerHTML={{ __html: cur.calc }} />}
            {cur.ent && <div className="ent" dangerouslySetInnerHTML={{ __html: cur.ent }} />}
          </>
        ) : (
          <div className="hint">Bấm vào một byte để xem nó là gì.</div>
        )}
      </div>
    </div>
  );
}
