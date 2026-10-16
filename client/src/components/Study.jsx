// Small building blocks shared by every lesson section.

export function Slide({ n, alt, caption, narrow }) {
  return (
    <figure className={"slide" + (narrow ? " narrow" : "")}>
      <img src={`slides/slide-${n}.jpg`} alt={alt} loading="lazy" />
      <figcaption>Trích bài giảng: {caption}</figcaption>
    </figure>
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

/** The four-region "what changed" table used by questions c, d and e. */
export function ImpactTable({ fat, rdet, sdet, data }) {
  const row = (name, change) => [name, change ? "" : "x", change || ""];
  return (
    <Table
      head={["Vùng", { label: "Không thay đổi", cls: "c" }, "Thay đổi"]}
      rows={[row("FAT", fat), row("RDET", rdet), row("SDET", sdet), row("Data", data)]}
    />
  );
}
