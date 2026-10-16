import { useEffect, useMemo, useState } from "react";
import { fetchHexDump } from "../api/hexDumps.js";
import { parseHex } from "../fat/dumps.js";
import { annotate, h2, hx } from "../fat/annotate.js";

const COLS = Array.from({ length: 16 }, (_, c) => c);

/** Loads one exercise dump from the backend, then renders it. */
export default function HexDump({ id }) {
  const [state, setState] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetchHexDump(id, ctrl.signal)
      .then((dump) => setState({ status: "ready", dump }))
      .catch((err) => { if (!ctrl.signal.aborted) setState({ status: "error", message: err.message }); });
    return () => ctrl.abort();
  }, [id, attempt]);

  if (state.status === "ready") return <HexDumpView d={state.dump} />;
  return (
    <div className="dump">
      <div className="info" role={state.status === "error" ? "alert" : "status"}>
        {state.status === "loading" ? (
          <div className="what">Đang tải hex dump “{id}” từ backend…</div>
        ) : (
          <>
            <div className="what">Chưa tải được hex dump “{id}” ({state.message}).</div>
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
function HexDumpView({ d }) {
  const { bytes, segs, owner } = useMemo(() => {
    const bytes = parseHex(d.hex);
    const segs = annotate(d.kind, bytes, d.base);
    const owner = new Array(bytes.length);
    segs.forEach((s, si) => { for (let k = 0; k < s.len; k++) owner[s.start + k] = si; });
    return { bytes, segs, owner };
  }, [d]);
  const [sel, setSel] = useState(() => owner[d.pick - d.base]);
  const cur = segs[sel];

  const cellClass = (i, c) => {
    const s = segs[owner[i]];
    let cls = "b " + s.cls + (c === 8 ? " gap" : "");
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
        <h3>{d.title}</h3>
        <span>offset {hx(d.base, 5)} = sector {Math.floor(d.base / 512)} · {d.note}</span>
      </div>
      <div className="hexwrap">
        <div className="hex" aria-label={d.title}>
          <div className="row colhead">
            <span className="off">Offset</span>
            <span className="bytes">
              {COLS.map((c) => <span key={c} className={"b" + (c === 8 ? " gap" : "")} style={{ cursor: "default" }}>{c.toString(16).toUpperCase()}</span>)}
            </span>
          </div>
          {Array.from({ length: bytes.length / 16 }, (_, r) => (
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
        <div className="what" dangerouslySetInnerHTML={{ __html: `${hx(d.base + cur.start, 5)} · ${cur.what}` }} />
        {cur.calc && <div className="calc" dangerouslySetInnerHTML={{ __html: cur.calc }} />}
        {cur.ent && <div className="ent" dangerouslySetInnerHTML={{ __html: cur.ent }} />}
      </div>
    </div>
  );
}
