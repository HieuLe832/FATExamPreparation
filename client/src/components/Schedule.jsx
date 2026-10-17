// Building blocks of the process-scheduling pages: the process table, the step-by-step event list, the Gantt
// chart and the waiting-time table. They draw the data in src/proc/exercises.js and compute nothing new
// except the arithmetic they print.
import { Table } from "./Study.jsx";

const PCLS = { P1: "pc-1", P2: "pc-2", P3: "pc-3", P4: "pc-4" };
const n = (label) => ({ label, cls: "n" });
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

/** A process name in its chart colour. */
export function Pid({ id }) {
  return <span className={"pid " + PCLS[id]}>{id}</span>;
}

/** Gantt chart, as the exam draws it: one row per resource on a shared time axis, times under each row.
 *  rows: [{ label, segs: [[start, end, id | null]] }]; null is the CPU sitting idle. */
export function Gantt({ rows, label }) {
  const end = Math.max(...rows.flatMap((r) => r.segs.map((s) => s[1])));
  const x = (t) => `${(t / end) * 100}%`;
  return (
    <div className="tablewrap">
      <div className="gantt" role="img" aria-label={label} style={{ minWidth: `calc(4.5rem + ${end * 22}px)` }}>
        {rows.map((r) => (
          <div className="gantt-row" key={r.label}>
            <span className="gantt-label">{r.label}</span>
            <div className="gantt-track">
              {r.segs.map(([a, b, id]) => (
                <div key={a} className={"gantt-seg " + (id ? PCLS[id] : "idle")} style={{ left: x(a), width: x(b - a) }}>{id ?? ""}</div>
              ))}
            </div>
            <div className="gantt-ticks">
              {[...new Set(r.segs.flat().filter((v) => typeof v === "number"))].map((t) => (
                <span key={t} style={{ left: x(t) }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The CPU row, then one row per device (`devices`) or per process doing I/O on its own (`io`). */
export function exampleRows(ex) {
  return [
    { label: "CPU", segs: ex.cpu },
    ...Object.entries(ex.devices ?? {}).map(([d, segs]) => ({ label: d, segs })),
    ...Object.entries(ex.io ?? {}).sort().map(([p, segs]) => ({ label: `I/O ${p}`, segs })),
  ];
}

/** "Quá trình điều phối": each moment something happens, who competes for the CPU and who gets it. */
export function EventTable({ events }) {
  return (
    <Table
      className="events"
      head={[n("t"), "Việc xảy ra", "Cần CPU (còn lại)", "CPU"]}
      rows={events.map((e) => [
        <b>{e.t}</b>,
        e.what,
        e.cands.length ? (
          <span className="cands">
            {e.cands.map(([id, left]) => <span key={id} className={id === e.cpu ? "pick" : undefined}>{id} còn {left}</span>)}
          </span>
        ) : <span className="muted">không ai</span>,
        e.cpu ? <Pid id={e.cpu} /> : <span className="muted">{e.cpu === null ? "rảnh" : "—"}</span>,
      ])}
    />
  );
}

/** WT of each process: the spans it sat in the Ready List, and the check end − arrive − CPU − I/O − queue. */
export function WaitTable({ ex }) {
  const queued = (id) => ex.queued?.[id] ?? 0;
  const hasIo = ex.procs.some((p) => p.bursts.some((b) => b.io));
  const head = ["Tiến trình", "Nằm trong RL", n("WT"),
    hasIo ? (ex.queued ? "Kiểm tra: kết thúc − vào − CPU − I/O − xếp hàng" : "Kiểm tra: kết thúc − vào − CPU − I/O") : "Kiểm tra: kết thúc − vào − CPU"];
  return (
    <Table
      head={head}
      rows={ex.procs.map((p) => {
        const spans = ex.waits[p.id];
        const cpu = sum(p.bursts.map((b) => b.cpu ?? 0)), io = sum(p.bursts.map((b) => b.io ?? 0));
        const parts = [ex.finish[p.id], p.arrive, cpu, ...(hasIo ? [io] : []), ...(ex.queued ? [queued(p.id)] : [])];
        return [
          <Pid id={p.id} />,
          spans.length ? spans.map(([a, b]) => `${a}–${b}`).join(", ") : <span className="muted">không chờ</span>,
          spans.length > 1 ? <span className="nw">{spans.map(([a, b]) => b - a).join(" + ")} = <b>{ex.wait[p.id]}</b></span> : <b>{ex.wait[p.id]}</b>,
          <span className="mono nw">{parts.join(" − ")} = {ex.wait[p.id]}</span>,
        ];
      })}
    />
  );
}

/** Average WT, written out. */
export function avgWait(ex) {
  const ws = ex.procs.map((p) => ex.wait[p.id]);
  return `(${ws.join(" + ")}) ÷ ${ws.length} = ${String(sum(ws) / ws.length).replace(".", ",")}`;
}

// Column heads of the three table shapes, in the exam's words.
const HEADS = {
  basic: ["Tiến trình", "Thời điểm vào RL", "CPU"],
  plain: ["Tiến trình", "Thời điểm vào RL", "CPU lần 1", "I/O lần 1", "CPU lần 2", "I/O lần 2", "CPU lần 3"],
  device: ["Tiến trình", "Thời điểm vào Ready list", "Thời gian CPU lần 1", "IO lần 1 · Thời gian", "IO lần 1 · Thiết bị",
    "Thời gian CPU lần 2", "IO lần 2 · Thời gian", "IO lần 2 · Thiết bị"],
};

/** The process table as given: kind "basic", "plain" (Bài tập 2) or "device" (Bài tập 1). */
export function ProcTable({ kind, rows }) {
  const head = HEADS[kind];
  return (
    <Table
      className="procs"
      head={head.map((h, i) => (i === 0 ? h : { label: h, cls: "c" }))}
      rows={rows.map((r) => head.map((_, i) => (i === 0 ? <b>{r[0]}</b> : r[i] ?? "")))}
    />
  );
}
