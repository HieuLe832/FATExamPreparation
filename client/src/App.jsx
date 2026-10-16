import { useCallback, useEffect, useState } from "react";
import { Hero, HexBasics } from "./sections/Intro.jsx";
import Foundations from "./sections/Foundations.jsx";
import Glossary from "./sections/Glossary.jsx";
import Mbr from "./sections/Mbr.jsx";
import { Boot, Directories, Fat } from "./sections/Volume.jsx";
import Operations from "./sections/Operations.jsx";
import { CheatSheet, Pitfalls } from "./sections/Reference.jsx";

// One lesson is shown at a time; the URL hash (#mbr, #boot, …) says which.
const GROUPS = [
  { name: "Khởi động", steps: [
    { id: "pham-vi", label: "Bắt đầu", Page: Hero },
    { id: "co-ban", label: "Kiến thức nền", Page: Foundations },
    { id: "hex", label: "Đọc hex dump", Page: HexBasics },
  ] },
  { name: "Bài tập 1", steps: [
    { id: "mbr", label: "MBR và phân vùng", Page: Mbr },
  ] },
  { name: "Bài tập 2", steps: [
    { id: "boot", label: "2a · Boot sector", Page: Boot },
    { id: "fat", label: "2b · Bảng FAT", Page: Fat },
    { id: "dir", label: "2b · Thư mục và cây", Page: Directories },
    { id: "ops", label: "2c–e · Move, Xóa, Copy", Page: Operations },
  ] },
  { name: "Tra cứu", steps: [
    { id: "pitfalls", label: "Lỗi hay gặp", Page: Pitfalls },
    { id: "cheat", label: "Tóm tắt công thức", Page: CheatSheet },
    { id: "tu-dien", label: "Từ điển", Page: Glossary },
  ] },
];
const STEPS = GROUPS.flatMap((g) => g.steps.map((s) => ({ ...s, group: g.name })));
const LESSONS = STEPS.filter((s) => s.group !== "Tra cứu");
const PROGRESS_KEY = "fat-guide:done";

const stepFromHash = () => STEPS.find((s) => s.id === window.location.hash.slice(1)) ?? STEPS[0];

function useProgress() {
  const [done, setDone] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "[]")); } catch { return new Set(); }
  });
  const save = (next) => {
    setDone(next);
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next])); } catch { /* progress just won't persist */ }
  };
  return {
    done,
    markDone: (id) => { if (!done.has(id)) save(new Set([...done, id])); },
    reset: () => save(new Set()),
  };
}

function Outline({ current, done, onPick }) {
  return (
    <nav className="outline" aria-label="Mục lục">
      {GROUPS.map((g) => (
        <div className="outline-group" key={g.name}>
          <p className="outline-label">{g.name}</p>
          <ol>
            {g.steps.map((s) => {
              const state = s.id === current ? "current" : done.has(s.id) ? "done" : "todo";
              return (
                <li key={s.id}>
                  <a href={`#${s.id}`} className={"outline-item " + state} aria-current={state === "current" ? "page" : undefined} onClick={onPick}>
                    <span className="dot" aria-hidden="true">{state === "done" ? "✓" : ""}</span>
                    <span>{s.label}</span>
                    {state === "done" && <span className="sr-only">(đã xong)</span>}
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </nav>
  );
}

function Pager({ step, onDone }) {
  const i = STEPS.indexOf(step), prev = STEPS[i - 1], next = STEPS[i + 1];
  return (
    <div className="pager">
      {prev ? (
        <a className="pager-link" href={`#${prev.id}`}><small>← Trước</small><span>{prev.label}</span></a>
      ) : <span />}
      {next && (
        <a className="pager-link primary" href={`#${next.id}`} onClick={onDone}>
          <small>{i === 0 ? "Sẵn sàng?" : step.group === "Tra cứu" ? "Tiếp" : "Xong bước này, sang bước"}</small>
          <span>{i === 0 ? "Bắt đầu học" : next.label} →</span>
        </a>
      )}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(stepFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const { done, markDone, reset } = useProgress();

  useEffect(() => {
    const onHash = () => { setStep(stepFromHash()); setMenuOpen(false); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { document.title = `${step.label} · FAT`; }, [step]);

  const finished = LESSONS.filter((s) => done.has(s.id)).length;
  const pct = Math.round((finished / LESSONS.length) * 100);
  const lessonNo = LESSONS.indexOf(step) + 1;
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const { Page } = step;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#pham-vi"><span className="brand-mark" aria-hidden="true">FAT</span><span>vừa đủ làm bài</span></a>
          <div className="progress" title={`Đã xong ${finished}/${LESSONS.length} bước`}>
            <span className="progress-text">{finished}/{LESSONS.length} bước</span>
            <span className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ học">
              <span style={{ width: `${pct}%` }} />
            </span>
          </div>
          <button type="button" className="menu-btn" aria-expanded={menuOpen} aria-controls="outline-panel" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? "Đóng" : "Mục lục"}
          </button>
        </div>
      </header>

      <div className="shell">
        <aside id="outline-panel" className={"sidebar" + (menuOpen ? " open" : "")}>
          <Outline current={step.id} done={done} onPick={closeMenu} />
          {done.size > 0 && <button type="button" className="reset" onClick={reset}>Xóa tiến độ</button>}
        </aside>

        <main key={step.id}>
          <p className="crumb">
            {lessonNo > 0 ? <>Bước {lessonNo} / {LESSONS.length}</> : "Tra cứu"} · {step.group}
          </p>
          <Page lessons={LESSONS} done={done} />
          <Pager step={step} onDone={() => markDone(step.id)} />
        </main>
      </div>
    </div>
  );
}
