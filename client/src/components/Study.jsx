// Building blocks shared by every page. Nothing here hides content behind a click: learners read the page
// top to bottom and every answer is already on it.

/** Page title block. `tag` is the group or the exam question ("Câu 2a"). */
export function PageHead({ tag, title, lead }) {
  return (
    <header className="pagehead">
      <span className="tag">{tag}</span>
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}

/** What the exam gives and what it asks, in its own words. */
export function Ask({ given, asks }) {
  return (
    <dl className="ask">
      <div><dt>Đề cho</dt><dd>{given}</dd></div>
      <div><dt>Đề hỏi</dt><dd>{asks}</dd></div>
    </dl>
  );
}

// The parts of the disk, in order, and the exam questions that read each one.
const REGIONS = [
  { id: "mbr", label: "MBR", q: "câu 1" },
  { id: "boot", label: "Boot sector", q: "2a" },
  { id: "fat1", label: "FAT1", q: "2b, 2d, 2e" },
  { id: "fat2", label: "FAT2", q: "2d, 2e" },
  { id: "rdet", label: "RDET", q: "2b–2e" },
  { id: "sdet", label: "SDET", q: "2b–2e" },
  { id: "file", label: "Nội dung file", q: "2b, 2e" },
];

/** The whole disk as one strip, with the parts this page works on lit. Shows how the pages connect. */
export function DiskStrip({ on = [], showQ = false }) {
  const cell = (id) => {
    const r = REGIONS.find((x) => x.id === id);
    return (
      <div className={"strip-cell" + (on.includes(id) ? " on" : "")} key={id}>
        <b>{r.label}</b>
        {showQ && <span>{r.q}</span>}
      </div>
    );
  };
  const lit = REGIONS.filter((r) => on.includes(r.id)).map((r) => r.label).join(", ");
  return (
    <figure className="strip" aria-label={lit ? `Vị trí trên đĩa: ${lit}` : "Các vùng của ổ đĩa"}>
      <div className="strip-group">
        <span className="strip-cap">Ổ cứng</span>
        <div className="strip-row">{cell("mbr")}</div>
      </div>
      <div className="strip-group grow">
        <span className="strip-cap">Một phân vùng FAT32 (volume)</span>
        <div className="strip-row">
          {cell("boot")}{cell("fat1")}{cell("fat2")}
          <div className="strip-group grow data">
            <span className="strip-cap">Vùng Data</span>
            <div className="strip-row">{cell("rdet")}{cell("sdet")}{cell("file")}</div>
          </div>
        </div>
      </div>
    </figure>
  );
}

/** Numbers this part needs from earlier answers: [[label, value], …]. */
export function Known({ from, items }) {
  return (
    <div className="known">
      <span className="known-from">Cần từ {from}:</span>
      {items.map(([label, value], i) => <span className="known-chip" key={i}>{label} = <b>{value}</b></span>)}
    </div>
  );
}

/** Text the learner must memorise for the exam. Shown as a highlighter mark. */
export function Must({ children }) {
  return <mark className="must">{children}</mark>;
}

/** The fixed procedure for one exam question: the part to learn. `skip` lists what the exam never asks. */
export function Recipe({ children, skip }) {
  return (
    <div className="recipe">
      <ol className="recipe-steps">{children}</ol>
      {skip && <p className="recipe-skip"><span>Bỏ qua</span>{skip}</p>}
    </div>
  );
}

/** Worked steps, numbered down the page. */
export function Steps({ children }) {
  return <ol className="steps">{children}</ol>;
}

export function Step({ title, children }) {
  return (
    <li className="step">
      <h3>{title}</h3>
      <div className="step-body">{children}</div>
    </li>
  );
}

/** The outcome of a step, always visible. */
export function Result({ children }) {
  return <p className="result"><span aria-hidden="true">→</span><span>{children}</span></p>;
}

/** One line of arithmetic. */
export function Calc({ children }) {
  return <div className="calc-line">{children}</div>;
}

/** The answer as it would be written on the exam paper. */
export function Final({ title, children }) {
  return (
    <div className="final">
      <strong className="final-title">{title}</strong>
      {children}
    </div>
  );
}

/** The same steps applied to Baitap_HTTT. */
export function Real({ children }) {
  return <div className="real">{children}</div>;
}

/** Mistakes that cost marks on this question. */
export function Traps({ items }) {
  return (
    <ul className="traps">
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ul>
  );
}

export function Table({ head, rows, className = "" }) {
  return (
    <div className="tablewrap">
      <table className={"t " + className}>
        <thead>
          <tr>{head.map((h, i) => <th key={i} className={h.cls}>{h.label ?? h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className={head[j].cls}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The four-region "what changed" table the move / delete / copy questions ask for. */
export function ImpactTable({ fat, rdet, sdet, data }) {
  const row = (name, change) => [<b>{name}</b>, change ? "" : "x", change || ""];
  return (
    <Table
      className="impact"
      head={["Vùng", { label: "Không đổi", cls: "c" }, "Thay đổi (sector)"]}
      rows={[row("FAT", fat), row("RDET", rdet), row("SDET", sdet), row("Data", data)]}
    />
  );
}

/** Boxes that wrap onto new lines: small label on top, value under it. */
export function DiskMap({ cells, label }) {
  return (
    <div className="cells" role="list" aria-label={label}>
      {cells.map((c) => (
        <div role="listitem" key={c.k} className={"cell " + (c.cls ?? "")}>
          <span>{c.k}</span><b>{c.label}</b>{c.next && <span>{c.next}</span>}
        </div>
      ))}
    </div>
  );
}

/** A horizontal bar split into labelled parts: [{ label, sub, cls, flex }]. */
export function Layout({ parts, label }) {
  return (
    <div className="tablewrap">
      <div className="layout" role="img" aria-label={label}>
        {parts.map((p, i) => (
          <div key={i} className={p.cls} style={{ flex: p.flex ?? 1 }}><b>{p.label}</b>{p.sub && <span>{p.sub}</span>}</div>
        ))}
      </div>
    </div>
  );
}

/** A directory tree drawn with box characters: [[depth, name, isDir], …]. */
export function Tree({ root = "\\  (thư mục gốc)", items }) {
  return (
    <pre className="tree" aria-label="Cây thư mục">
      <span className="m">{root}</span>
      {items.map(([depth, name, dir, last, parentLast], i) => (
        <span key={i}>{"\n"}{depth > 0 ? (parentLast ? "    " : "│   ") : ""}{last ? "└── " : "├── "}<span className={dir ? "d" : undefined}>{name}</span></span>
      ))}
    </pre>
  );
}
