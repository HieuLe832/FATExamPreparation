// Small building blocks shared by every lesson section.
import { useRef } from "react";

/** A cropped lecture slide; click to see it full size. */
export function Slide({ n, alt, caption, narrow }) {
  const dialog = useRef(null);
  const src = `slides/slide-${n}.jpg`;
  return (
    <figure className={"slide" + (narrow ? " narrow" : "")}>
      <button type="button" className="slide-zoom" onClick={() => dialog.current?.showModal()} aria-label={`Phóng to slide: ${caption}`}>
        <img src={src} alt={alt} loading="lazy" />
      </button>
      <figcaption><span>Trích bài giảng</span> {caption}<span className="zoom-hint">Bấm để phóng to</span></figcaption>
      <dialog ref={dialog} className="lightbox" onClick={(e) => e.target === e.currentTarget && dialog.current.close()}>
        <img src={src} alt={alt} />
        <form method="dialog"><button type="submit" className="lightbox-close">Đóng</button></form>
      </dialog>
    </figure>
  );
}

/** Several related slides as a scrollable strip of thumbnails. */
export function SlideStrip({ children }) {
  return (
    <div className="slide-strip-wrap">
      <p className="strip-label">Slide bài giảng liên quan · bấm vào slide để phóng to</p>
      <div className="slides-row">{children}</div>
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

/** A fully worked example the learner reads before trying the rest alone. */
export function Example({ title, children }) {
  return (
    <div className="example">
      <strong>Làm mẫu · {title}</strong>
      {children}
    </div>
  );
}

/** One line: what the learner can do after this lesson. */
export function Goal({ children }) {
  return <p className="goal"><span>Mục tiêu</span>{children}</p>;
}

/** The few rules to remember, as short bullets. */
export function KeyPoints({ title = "Cần nhớ", children }) {
  return (
    <div className="keypoints">
      <strong>{title}</strong>
      {children}
    </div>
  );
}
