import Calculators from "../components/Calculators.jsx";
import { Goal, KeyPoints, SectionHead } from "../components/Study.jsx";

export function Hero({ lessons = [], done = new Set() }) {
  return (
    <header className="hero" id="pham-vi">
      <div className="hero-strip" aria-hidden="true">
        <span>EB 58 90 4D 53 44 4F 53 35 2E 30 00 02 04 26 00</span>
        <span className="hero-strip-asc">ëX.MSDOS5.0...&amp;.</span>
      </div>
      <h1>FAT vừa đủ làm bài</h1>
      <p className="lead">7 bước ngắn để làm hết Baitap_HTTT.pdf. Mỗi bước: xem mẫu, tự làm, rồi mới mở đáp án.</p>
      <ol className="roadmap" aria-label="Lộ trình học">
        {lessons.slice(1).map((s, i) => (
          <li key={s.id} className={done.has(s.id) ? "done" : undefined}>
            <a href={`#${s.id}`}>
              <span className="roadmap-no">{done.has(s.id) ? "✓" : i + 1}</span>
              <span className="roadmap-text"><small>{s.group}</small>{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </header>
  );
}

export function HexBasics() {
  return (
    <section id="hex">
      <SectionHead tag="Dùng cho mọi câu" title="Đọc hex dump" />
      <Goal>Tìm một byte trong ảnh hex và đọc ra con số.</Goal>
      <KeyPoints>
        <ul>
          <li><b>Tìm byte:</b> cột trái là dòng, hàng trên cùng (0–F) là cột. Byte <code>0E</code> = dòng <code>00000000</code>, cột <code>E</code>.</li>
          <li><b>Số nhiều byte thì đọc ngược:</b> <code>26 00</code> → <code>0026</code> = 38.</li>
          <li><b>Chữ thì đọc xuôi:</b> tên file, chữ “FAT32”.</li>
          <li><b>Ra số sector:</b> offset ÷ 512. Ví dụ <code>D0000</code> = 851 968 ÷ 512 = sector 1664.</li>
        </ul>
      </KeyPoints>
      <Calculators />
      <p className="note">Mẹo: trong các bài sau, bấm vào byte bất kỳ của hex dump để xem nó là gì.</p>
    </section>
  );
}
