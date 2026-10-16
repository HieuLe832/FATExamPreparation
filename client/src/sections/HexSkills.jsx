import HexDump from "../components/HexDump.jsx";
import { Calc, Must, PageHead, Result, Step, Steps, Traps } from "../components/Study.jsx";

const HEX_DIGITS = [["A", 10], ["B", 11], ["C", 12], ["D", 13], ["E", 14], ["F", 15]];

export default function HexSkills() {
  return (
    <section>
      <PageHead tag="Nền tảng · dùng ở mọi câu" title="Đọc hex dump" lead="Đề cho dữ liệu dưới dạng hex dump. Câu nào cũng cần 4 kỹ năng dưới đây." />
      <Steps>
        <Step title="Đổi hex ra số">
          <p>1 byte viết bằng 2 ký tự, từ <code>00</code> đến <code>FF</code>. Ngoài 0–9, hex dùng thêm 6 chữ cái:</p>
          <div className="tablewrap">
            <table className="t hexdigits">
              <tbody>
                <tr><th>Hex</th>{HEX_DIGITS.map(([h]) => <td key={h} className="mono">{h}</td>)}</tr>
                <tr><th>Số</th>{HEX_DIGITS.map(([h, d]) => <td key={h}>{d}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <p>Số 2 chữ số: chữ số trái nhân 16, cộng chữ số phải.</p>
          <Calc>26 = 2 × 16 + 6 = 38</Calc>
          <Calc>1E = 1 × 16 + 14 = 30</Calc>
          <p>Số dài hơn: mỗi chữ số lùi sang trái thì nhân thêm 16. Số lớn thì dùng chế độ BASE-N của máy tính.</p>
          <Calc>1BE = 1 × 256 + 11 × 16 + 14 = 446</Calc>
        </Step>

        <Step title="Tìm một byte">
          <p>Mỗi dòng có 16 byte. Cột trái là vị trí của byte đầu dòng, hàng trên cùng (0–F) là số cột.</p>
          <p>Vị trí byte = vị trí đầu dòng + số cột. Ví dụ: dòng <code>00000000</code>, cột <code>E</code> là byte <code>0E</code>.</p>
          <HexDump id="boot" to={0x10} focus={[[0x0e, 2]]} />
        </Step>

        <Step title="Số nhiều byte: đọc ngược">
          <p><Must>Số dài 2 hoặc 4 byte phải đảo thứ tự byte rồi mới đổi</Must> (gọi là little-endian). Như byte 0E–0F ở trên:</p>
          <Calc>06 00 → đảo → 0006 = 6</Calc>
          <Calc>00 0A 00 00 → đảo → 00000A00 = 2 560</Calc>
          <p>Chữ (tên tập tin, chữ “FAT32”) thì đọc xuôi, xem ở cột chữ bên phải dump.</p>
        </Step>

        <Step title="Offset và sector">
          <p><Must>1 sector = 512 byte = 200 (hex)</Must>. Offset là vị trí byte tính từ đầu đĩa.</p>
          <Calc>sector = offset ÷ 512 · offset = sector × 512</Calc>
          <p>Ví dụ: dump thư mục gốc của đề mini bắt đầu ở offset <code>1400</code>.</p>
          <Calc>1400 (hex) = 5 120 → 5 120 ÷ 512 = sector 10</Calc>
          <Result>Đề thật ghi “sector 1664” và dump bắt đầu ở <code>D0000</code> = 851 968 = 1664 × 512. Dùng phép này để kiểm tra mình đọc đúng sector.</Result>
        </Step>
      </Steps>

      <h2>Dễ sai</h2>
      <Traps items={[
        <>Đọc xuôi số nhiều byte: <code>26 00</code> là 38, không phải 2600 = 9 728.</>,
        <>Nhầm cột: đếm cột từ 0, cột thứ 9 là cột <code>8</code>. Dump có khoảng trống giữa cột 7 và 8.</>,
      ]} />
    </section>
  );
}
