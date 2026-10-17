import { useCallback, useEffect, useState } from "react";
import Start from "./sections/Start.jsx";
import HexSkills from "./sections/HexSkills.jsx";
import DiskOverview from "./sections/DiskOverview.jsx";
import Mbr from "./sections/Mbr.jsx";
import Boot from "./sections/Boot.jsx";
import Fat from "./sections/Fat.jsx";
import Tree from "./sections/Tree.jsx";
import Operations from "./sections/Operations.jsx";
import ProcBasics from "./sections/ProcBasics.jsx";
import ProcPlain from "./sections/ProcPlain.jsx";
import ProcDevice from "./sections/ProcDevice.jsx";
import MustKnow from "./sections/Reference.jsx";
import Glossary from "./sections/Glossary.jsx";
import { LookupBlocks } from "./sections/Lookup.jsx";

// One page is shown at a time; the URL hash (#cau-1, #cau-2a, …) says which. The course follows the exams:
// for Baitap_HTTT two foundation pages, then one page per exam question; for Baitap_QLTT one foundation page,
// then one page per exercise (bài 2 first, it is bài 1 without device queues); then the review sheet. `lookup` lists the
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
  { name: "Quản lý tiến trình", steps: [
    { id: "tt-sjf", label: "SJF và sơ đồ Gantt", Page: ProcBasics, lookup: ["sjf", "wt"] },
    { id: "tt-bai-2", label: "Bài 2 · SJF nhiều lần CPU", Page: ProcPlain, lookup: ["sjf", "io", "wt"] },
    { id: "tt-bai-1", label: "Bài 1 · CPU và thiết bị R1", Page: ProcDevice, lookup: ["sjf", "io", "wt"] },
  ] },
  { name: "Ôn tập", steps: [
    { id: "phai-thuoc", label: "Bảng phải thuộc", Page: MustKnow },
    { id: "tu-dien", label: "Từ điển, máy tính", Page: Glossary, reference: true },
  ] },
];
const STEPS = GROUPS.flatMap((g) => g.steps.map((s) => ({ ...s, group: g.name })));
const LESSONS = STEPS.filter((s) => !s.reference);
const PROGRESS_KEY = "fat-guide:done";
const THEME_KEY = "fat-guide:theme";

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

/** Light or dark, chosen with the button in the top bar. index.html applies the saved choice before render. */
function useTheme() {
  const [theme, setTheme] = useState(() => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"));
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* the choice just won't persist */ }
    setTheme(next);
  };
  return [theme, toggle];
}

const SUN = <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></svg>;
const MOON = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></svg>;

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
  const [theme, toggleTheme] = useTheme();

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
  useEffect(() => { document.title = `${step.label} · HĐH`; }, [step]);

  const finished = LESSONS.filter((s) => done.has(s.id)).length;
  const pct = Math.round((finished / LESSONS.length) * 100);
  const lessonNo = LESSONS.indexOf(step) + 1;
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const { Page } = step;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#bat-dau"><span className="brand-mark" aria-hidden="true">HĐH</span><span>Giải bài tập tập tin và tiến trình</span></a>
          <div className="progress" title={`Đã xong ${finished}/${LESSONS.length} bước`}>
            <span className="progress-text">{finished}/{LESSONS.length} bước</span>
            <span className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ học">
              <span style={{ width: `${pct}%` }} />
            </span>
          </div>
          <button type="button" className="theme-btn" onClick={toggleTheme}
            aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}>
            {theme === "dark" ? SUN : MOON}<span>{theme === "dark" ? "Sáng" : "Tối"}</span>
          </button>
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
