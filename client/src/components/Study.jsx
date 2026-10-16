// Small building blocks shared by every lesson.

/** One line: what the learner can do after this lesson. */
export function Goal({ children }) {
  return <p className="goal"><span>Mục tiêu</span>{children}</p>;
}

/** The few rules to remember, as short bullets or a small table. */
export function KeyPoints({ title = "Cần nhớ", children }) {
  return (
    <div className="keypoints">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

/** Ordered small steps: the lesson split into pieces (divide and conquer). */
export function SubSteps({ children }) {
  return <ol className="substeps">{children}</ol>;
}

export function SubStep({ title, children }) {
  return (
    <li className="substep">
      <h3>{title}</h3>
      <div className="substep-body">{children}</div>
    </li>
  );
}

/** A tiny question at the end of a step; the answer stays hidden until clicked. */
export function Check({ q, children }) {
  return (
    <details className="check">
      <summary><span>Thử</span>{q}</summary>
      <div className="check-answer">{children}</div>
    </details>
  );
}

export function Example({ title, children }) {
  return (
    <div className="example">
      <strong>Làm mẫu · {title}</strong>
      {children}
    </div>
  );
}

export function Try({ children }) {
  return (
    <div className="try">
      <strong>Tự làm</strong>
      {children}
    </div>
  );
}

export function Answer({ label, children }) {
  return (
    <details className="answer">
      <summary>{label}</summary>
      <div className="body">{children}</div>
    </details>
  );
}

export function SectionHead({ tag, title }) {
  return (
    <div className="sechead">
      <span className="tag">{tag}</span>
      <h2>{title}</h2>
    </div>
  );
}

export function Table({ head, rows, wrapStyle }) {
  return (
    <div className="tablewrap" style={wrapStyle}>
      <table className="t">
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

/** The four-region "what changed" table used by the move / delete / copy questions. */
export function ImpactTable({ fat, rdet, sdet, data }) {
  const row = (name, change) => [name, change ? "" : "x", change || ""];
  return (
    <Table
      head={["Vùng", { label: "Không đổi", cls: "c" }, "Thay đổi (sector)"]}
      rows={[row("FAT", fat), row("RDET", rdet), row("SDET", sdet), row("Data", data)]}
    />
  );
}

/** Clusters of the mini disk as a strip of boxes, coloured by owner, with each box's FAT value under it. */
export function DiskMap({ cells }) {
  return (
    <div className="tablewrap">
      <div className="diskmap" role="img" aria-label="Bản đồ cluster của đĩa mini">
        {cells.map((c) => (
          <div key={c.k} className={"dm-cell " + (c.cls ?? "")}>
            <span className="dm-k">{c.k}</span>
            <b>{c.label}</b>
            <span className="dm-next">{c.next}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
