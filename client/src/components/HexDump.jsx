import { useEffect, useMemo, useState } from "react";
import { fetchHexDump } from "../api/hexDumps.js";
import { parseHex } from "../fat/dumps.js";
import { annotate, entryRows, fatCells, focusNotes, h2, hp, whereText } from "../fat/annotate.js";

const COLS = Array.from({ length: 16 }, (_, c) => c);
const band = (i) => (i % 4) + 1;

/** Loads a dump once per id (cached in api/hexDumps.js) and retries on demand. */
export function useDump(id) {
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
  return { ...state, retry: () => setAttempt((n) => n + 1) };
}

/**
 * One dump of the mini disk, read from the backend. Nothing on it needs a click: what a step talks about
 * is coloured, and a list under the dump says what each coloured part is.
 * `focus`: [[offset, length], …] absolute ranges this step reads; each field gets a colour and a line in
 *   the list, everything else is dimmed.
 * `list`: "entries" colours each 32-byte directory entry and lists them; "cells" does the same for
 *   4-byte FAT cells. `bands`: [[offset, length], …] ranges to colour with no list.
 * `from` / `to`: absolute offsets of the first and last row to show (default: the whole dump).
 */
export default function HexDump({ id, focus, list, bands, from, to }) {
  const s = useDump(id);
  if (s.status === "ready") return <HexDumpView d={s.dump} focus={focus} list={list} bands={bands} from={from} to={to} />;
  return (
    <div className="dump">
      <div className="dump-status" role={s.status === "error" ? "alert" : "status"}>
        {s.status === "loading" ? "Đang tải hex dump…" : (
          <>
            <span>Chưa tải được hex dump ({s.message}).</span>
            <span className="muted">
              {import.meta.env.DEV
                ? <>Chạy backend bằng <b>dotnet run --project server</b> rồi bấm thử lại.</>
                : "Không kết nối được máy chủ, có thể nó đang cập nhật. Đợi vài giây rồi bấm thử lại."}
            </span>
            <button type="button" className="retry" onClick={s.retry}>Thử lại</button>
          </>
        )}
      </div>
    </div>
  );
}

function HexDumpView({ d, focus, list, bands, from, to }) {
  const bytes = useMemo(() => parseHex(d.hex), [d]);
  const firstRow = from === undefined ? 0 : (from - d.base) / 16;
  const lastRow = to === undefined ? bytes.length / 16 - 1 : (to - d.base) / 16;
  const rows = Array.from({ length: lastRow - firstRow + 1 }, (_, i) => firstRow + i);

  // Coloured ranges [absolute start, length] and the list that explains them.
  const { marks, notes, entries, cells } = useMemo(() => {
    if (list === "entries") {
      const visible = d.base + firstRow * 16, end = d.base + (lastRow + 1) * 16;
      const entries = entryRows(bytes, d.base).filter((r) => r.at >= visible && r.at < end);
      return { entries, marks: entries.map((r) => [r.at, 32]) };
    }
    if (list === "cells") {
      const cells = fatCells(bytes, d.base);
      return { cells, marks: cells.map((c) => [c.start, 4]) };
    }
    if (focus) {
      const notes = focusNotes(annotate(d.kind, bytes, d.base), focus, d.base);
      return { notes, marks: notes.map((n) => [n.start, n.len]) };
    }
    return { marks: bands ?? [] };
  }, [d, bytes, focus, list, bands, firstRow, lastRow]);

  const markOf = (abs) => marks.findIndex(([o, n]) => abs >= o && abs < o + n);
  const cellClass = (i, c) => {
    const m = markOf(d.base + i), prev = c === 0 ? -1 : markOf(d.base + i - 1);
    let cls = "b" + (c === 8 ? " gap" : "");
    if (m >= 0) cls += ` band-${band(m)}`;
    else if (focus) cls += " dim";
    if (m >= 0 && prev >= 0 && prev !== m) cls += " seam"; // a line where one field ends and the next begins
    return cls;
  };

  return (
    <div className="dump">
      <h4 className="dump-title">{d.title}</h4>
      <div className="hexwrap">
        <div className="hex" role="img" aria-label={`Hex dump: ${d.title}`}>
          <div className="row colhead" aria-hidden="true">
            <span className="off">Offset</span>
            <span className="bytes">{COLS.map((c) => <span key={c} className={"b" + (c === 8 ? " gap" : "")}>{hp(c)}</span>)}</span>
          </div>
          {rows.map((r) => (
            <div className="row" key={r}>
              <span className="off">{hp(d.base + r * 16, 8)}</span>
              <span className="bytes">
                {COLS.map((c) => <span key={c} className={cellClass(r * 16 + c, c)}>{h2(bytes[r * 16 + c])}</span>)}
              </span>
              <span className="asc">
                {COLS.map((c) => { const ch = bytes[r * 16 + c]; return ch >= 0x20 && ch < 0x7f ? String.fromCharCode(ch) : "."; }).join("")}
              </span>
            </div>
          ))}
        </div>
      </div>
      {notes && <Notes notes={notes} />}
      {entries && <Entries rows={entries} />}
      {cells && <Cells cells={cells} />}
    </div>
  );
}

function Notes({ notes }) {
  return (
    <ol className="reads">
      {notes.map((n, i) => (
        <li key={n.start}>
          <span className={`chip band-${band(i)}`} aria-hidden="true" />
          <div>
            <b dangerouslySetInnerHTML={{ __html: n.what }} /> <span className="where">{whereText(n.start, n.len)}</span>
            {n.calc && <div className="calc" dangerouslySetInnerHTML={{ __html: n.calc }} />}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Entries({ rows }) {
  return (
    <div className="tablewrap">
      <table className="t entries">
        <thead><tr><th>Entry ở</th><th>Byte đầu</th><th>Byte 0B</th><th>Đọc ra</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.at} className={r.skip ? "skip" : undefined}>
              <td className="mono"><span className={`chip band-${band(i)}`} aria-hidden="true" />{hp(r.at)}</td>
              <td className="mono">{r.first}</td>
              <td className="mono">{r.attr}</td>
              <td>{r.text}{r.skip && r.text !== "hết bảng" && <span className="skip-tag">bỏ qua</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cells({ cells }) {
  return (
    <div className="cells" role="list" aria-label="Giá trị từng ô FAT">
      {cells.map((c, i) => (
        <div role="listitem" key={c.k} className={`cell band-${band(i)} ${c.kind}`}>
          <span>ô {c.k}</span><b>{c.text}</b>
        </div>
      ))}
    </div>
  );
}
