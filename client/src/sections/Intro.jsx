import Calculators from "../components/Calculators.jsx";
import { Check, Goal, SectionHead, SubStep, SubSteps } from "../components/Study.jsx";

export function Hero({ groups = [], done = new Set() }) {
  let n = 0;
  const shown = groups.filter((g) => g.name !== "Giới thiệu" && g.name !== "Tra cứu");
  return (
    <header className="hero" id="pham-vi">
      <div className="hero-strip" aria-hidden="true">
        <span>EB 58 90 4D 53 44 4F 53 35 2E 30 00 02 02 06 00</span>
        <span className="hero-strip-asc">ëX.MSDOS5.0.....</span>
      </div>
      <h1>Hệ thống tập tin FAT32</h1>
      <p className="lead">
        Hướng dẫn giải Baitap_HTTT: bài 1 về MBR, bài 2 về volume FAT32. <b>Kiến thức nền</b> giải thích từng vùng của
        ổ đĩa; <b>đề mini</b> là một bài cùng dạng với số nhỏ hơn, giải từng bước trước khi làm đề thật.
      </p>
      <div className="roadmap-groups">
        {shown.map((g) => (
          <div className="roadmap-group" key={g.name}>
            <p className="outline-label">{g.name}</p>
            <ol className="roadmap" aria-label={g.name}>
              {g.steps.map((s) => {
                n += 1;
                return (
                  <li key={s.id} className={done.has(s.id) ? "done" : undefined}>
                    <a href={`#${s.id}`}>
                      <span className="roadmap-no">{done.has(s.id) ? "✓" : n}</span>
                      <span className="roadmap-text">{s.label}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </header>
  );
}

const HEX_DIGITS = [["A", 10], ["B", 11], ["C", 12], ["D", 13], ["E", 14], ["F", 15]];

export function HexBasics() {
  return (
    <section id="hex">
      <SectionHead tag="Kiến thức nền" title="Byte và hex" />
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
