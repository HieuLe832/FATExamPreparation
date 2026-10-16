import { useEffect, useState } from "react";
import { Hero, HexBasics } from "./sections/Intro.jsx";
import Mbr from "./sections/Mbr.jsx";
import { Boot, Directories, Fat } from "./sections/Volume.jsx";
import Operations from "./sections/Operations.jsx";
import { CheatSheet, Pitfalls } from "./sections/Reference.jsx";

const STEPS = [
  ["pham-vi", "Phạm vi"],
  ["hex", "0 · Đọc hex dump"],
  ["mbr", "1 · MBR"],
  ["boot", "2a · Boot sector"],
  ["fat", "2b · Bảng FAT"],
  ["dir", "2b · RDET, SDET, cây"],
  ["ops", "2c–e · Move, Xóa, Copy"],
  ["pitfalls", "Lỗi hay gặp"],
  ["cheat", "Tóm tắt công thức"],
];

function useCurrentSection() {
  const [current, setCurrent] = useState(STEPS[0][0]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: "-20% 0px -70% 0px" },
    );
    STEPS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return current;
}

export default function App() {
  const current = useCurrentSection();
  return (
    <div className="shell">
      <nav className="rail" aria-label="Các bước">
        <p className="rail-label">Lộ trình</p>
        <ol>
          {STEPS.map(([id, label]) => (
            <li key={id}><a href={`#${id}`} className={current === id ? "on" : undefined}>{label}</a></li>
          ))}
        </ol>
      </nav>
      <main>
        <Hero />
        <HexBasics />
        <Mbr />
        <Boot />
        <Fat />
        <Directories />
        <Operations />
        <Pitfalls />
        <CheatSheet />
      </main>
    </div>
  );
}
