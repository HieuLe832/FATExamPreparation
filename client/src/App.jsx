import { useCallback, useEffect, useState } from "react";
import Start from "./sections/Start.jsx";
import HexSkills from "./sections/HexSkills.jsx";
import DiskOverview from "./sections/DiskOverview.jsx";
import Mbr from "./sections/Mbr.jsx";
import Boot from "./sections/Boot.jsx";
import Fat from "./sections/Fat.jsx";
import Tree from "./sections/Tree.jsx";
import Operations from "./sections/Operations.jsx";
import MustKnow from "./sections/Reference.jsx";
import Glossary from "./sections/Glossary.jsx";
import { LookupBlocks } from "./sections/Lookup.jsx";

// One page is shown at a time; the URL hash (#cau-1, #cau-2a, …) says which. The course follows the exam:
// two foundation pages, then one page per exam question, then the review sheet. `lookup` lists the
// Lookup.jsx blocks shown in the "Bảng tra" column next to the page.
const GROUPS = [
  { name: "Bắt đầu", steps: [
    { id: "bat-dau", label: "Đề thi gồm những gì", Page: Start },
  ] },
  { name: "Nền tảng", steps: [
    { id: "hex", label: "Đọc hex dump", Page: HexSkills, lookup: ["hex"] },
    { id: "o-dia", label: "Ổ đĩa được chia thế nào", Page: DiskOverview },
  ] },
  { name: "Giải từng câu", steps: [
    { id: "cau-1", label: "Câu 1 · MBR", Page: Mbr, lookup: ["mbr", "hex"] },
    { id: "cau-2a", label: "Câu 2a · Boot sector", Page: Boot, lookup: ["boot", "hex"] },
    { id: "cau-2b-fat", label: "Câu 2b · Bảng FAT", Page: Fat, lookup: ["known", "fat", "hex"] },
    { id: "cau-2b-cay", label: "Câu 2b · Cây thư mục", Page: Tree, lookup: ["known", "dir", "fat"] },
    { id: "cau-2cde", label: "Câu 2c–e · Move, Xóa, Copy", Page: Operations, lookup: ["knownFull", "ops"] },
  ] },
  { name: "Ôn tập", steps: [
    { id: "phai-thuoc", label: "Bảng phải thuộc", Page: MustKnow },
    { id: "tu-dien", label: "Từ điển, máy tính", Page: Glossary, reference: true },
  ] },
];
const STEPS = GROUPS.flatMap((g) => g.steps.map((s) => ({ ...s, group: g.name })));
const LESSONS = STEPS.filter((s) => !s.reference);
const PROGRESS_KEY = "fat-guide:done";

// Hashes from the previous layout, so old links still land on the matching page.
const OLD_HASHES = {
  "pham-vi": "bat-dau", "de-mini": "bat-dau", "fat-la-gi": "o-dia", "o-cung": "o-dia", volume: "o-dia",
  mbr: "cau-1", "boot-sector": "cau-2a", boot: "cau-2a", "bang-fat": "cau-2b-fat", fat: "cau-2b-fat",
  "thu-muc": "cau-2b-cay", entry: "cau-2b-cay", dir: "cau-2b-cay", ops: "cau-2cde", "de-that": "cau-1",
  pitfalls: "phai-thuoc", cheat: "phai-thuoc",
};

const stepFromHash = () => {
  const id = window.location.hash.slice(1);
  return STEPS.find((s) => s.id === (OLD_HASHES[id] ?? id)) ?? STEPS[0];
};

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
          <small>Tiếp</small>
          <span>{next.label} →</span>
        </a>
      )}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(stepFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const { done, markDone, reset } = useProgress();

  useEffect(() => {
    const onHash = () => { setStep(stepFromHash()); setMenuOpen(false); setLookupOpen(false); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!lookupOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setLookupOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lookupOpen]);
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
          <a className="brand" href="#bat-dau"><span className="brand-mark" aria-hidden="true">FAT</span><span>Giải bài tập hệ thống tập tin</span></a>
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

      <div className={"shell" + (step.lookup ? " has-lookup" : "")}>
        <aside id="outline-panel" className={"sidebar" + (menuOpen ? " open" : "")}>
          <Outline current={step.id} done={done} onPick={closeMenu} />
          {finished > 0 && <button type="button" className="reset" onClick={reset}>Xóa tiến độ</button>}
        </aside>

        <main key={step.id}>
          <p className="crumb">
            {lessonNo > 0 ? <>Bước {lessonNo} / {LESSONS.length}</> : "Tra cứu"} · {step.group}
          </p>
          <Page lessons={LESSONS} done={done} groups={GROUPS} />
          <Pager step={step} onDone={() => markDone(step.id)} />
        </main>

        {step.lookup && (
          <aside id="lookup-panel" className={"lookup" + (lookupOpen ? " open" : "")} aria-label="Bảng tra">
            <div className="lookup-head">
              <div><b>Bảng tra</b><span>{step.label}</span></div>
              <button type="button" className="lookup-close" onClick={() => setLookupOpen(false)}>Đóng</button>
            </div>
            <LookupBlocks keys={step.lookup} />
          </aside>
        )}
      </div>

      {step.lookup && (
        <button type="button" className="lookup-btn" aria-expanded={lookupOpen} aria-controls="lookup-panel" onClick={() => setLookupOpen((o) => !o)}>
          {lookupOpen ? "Đóng bảng tra" : "Bảng tra"}
        </button>
      )}
      {lookupOpen && <div className="lookup-overlay" aria-hidden="true" onClick={() => setLookupOpen(false)} />}
    </div>
  );
}
