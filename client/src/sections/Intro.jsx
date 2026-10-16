import Calculators from "../components/Calculators.jsx";
import { Check, Goal, SectionHead, SubStep, SubSteps } from "../components/Study.jsx";

export function Hero({ lessons = [], done = new Set() }) {
  return (
    <header className="hero" id="pham-vi">
      <div className="hero-strip" aria-hidden="true">
        <span>EB 58 90 4D 53 44 4F 53 35 2E 30 00 02 02 06 00</span>
        <span className="hero-strip-asc">ëX.MSDOS5.0.....</span>
      </div>
      <h1>FAT vừa đủ làm bài</h1>
      <p className="lead">
        Ta giải một <b>đề mini</b> giống Baitap_HTTT nhưng nhỏ hơn, chia thành từng bước nhỏ. Làm xong đề mini là làm
        được đề thật.
      </p>
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

const HEX_DIGITS = [["A", 10], ["B", 11], ["C", 12], ["D", 13], ["E", 14], ["F", 15]];

export function HexBasics() {
  return (
    <section id="hex">
      <SectionHead tag="Dùng cho mọi câu" title="Byte và hex" />
      <Goal>Đọc được một con số trong hex dump.</Goal>
      <SubSteps>
        <SubStep title="Hex là gì">
          <p>1 byte được viết bằng 2 ký tự, từ <code>00</code> đến <code>FF</code>. Ngoài 0–9 còn có 6 chữ cái:</p>
          <div className="tablewrap">
            <table className="t hexdigits">
              <tbody>
                <tr><th>Hex</th>{HEX_DIGITS.map(([h]) => <td key={h} className="mono">{h}</td>)}</tr>
                <tr><th>Số</th>{HEX_DIGITS.map(([h, d]) => <td key={h}>{d}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <p>Đổi ra số: chữ số bên trái nhân 16. Ví dụ <code>26</code> = 2 × 16 + 6 = 38.</p>
          <Check q="1E = ?">1 × 16 + 14 = 30</Check>
        </SubStep>
        <SubStep title="Tìm một byte">
          <p>Mỗi dòng có 16 byte. Cột trái cho biết dòng, hàng trên cùng (0–F) cho biết cột.</p>
          <Check q="Byte 0E nằm ở đâu?">Dòng <code>00000000</code>, cột <code>E</code></Check>
        </SubStep>
        <SubStep title="Số nhiều byte: đọc ngược">
          <p><code>00 0A 00 00</code> → đảo lại → <code>00000A00</code> = 2560. Chữ (tên file) thì đọc xuôi.</p>
          <Check q="06 00 = ?">Đảo lại: 0006 = 6</Check>
        </SubStep>
        <SubStep title="Đổi offset ra sector">
          <p>Offset là vị trí byte tính từ đầu đĩa. Chia 512 là ra số sector.</p>
          <Check q="Offset 1400 (hex) là sector mấy?">1400 hex = 5120, ÷ 512 = sector 10</Check>
        </SubStep>
      </SubSteps>
      <Calculators />
    </section>
  );
}
