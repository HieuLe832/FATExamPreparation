import Calculators from "../components/Calculators.jsx";
import { PageHead } from "../components/Study.jsx";

const TERMS = [
  ["Byte", "1 ô nhớ, viết bằng 2 ký tự hex (00–FF)."],
  ["Hex", "Cách viết số dùng 0–9 và A–F. A = 10 … F = 15."],
  ["Đọc ngược (little-endian)", "Số nhiều byte phải đảo thứ tự byte: 26 00 → 0026."],
  ["Offset", "Vị trí của byte. Offset ÷ 512 = số sector."],
  ["Sector", "1 ô 512 byte trên đĩa."],
  ["Cluster", "Vài sector liền nhau (đề mini: 2, đề thật: 4). Đánh số từ 2."],
  ["Phân vùng", "Một phần của ổ cứng, như ổ C, ổ D."],
  ["Volume", "Một phân vùng đã định dạng, ví dụ một volume FAT32."],
  ["Phân vùng khởi động", "Phân vùng máy dùng để khởi động; byte +0 = 80."],
  ["MBR", "Sector 0 của ổ cứng, chứa bảng 4 phân vùng."],
  ["Boot sector", "Sector 0 của volume, chứa kích thước các vùng."],
  ["Bảng FAT", "Dãy ô 4 byte; ô k ghi cluster đứng sau cluster k. Có 2 bản: FAT1, FAT2."],
  ["Hết (EOF)", "Ô FAT ghi 0FFFFFFF: cluster cuối của tập tin."],
  ["RDET", "Bảng thư mục gốc. FAT32 đặt ở cluster 2."],
  ["SDET", "Bảng của một thư mục con. Mở đầu bằng “.” và “..”."],
  ["Entry", "1 dòng 32 byte trong bảng thư mục, mô tả 1 tập tin hoặc thư mục."],
  ["Mảnh tên dài (entry phụ)", "Entry có byte 0B = 0F, chứa tối đa 13 chữ của tên dài."],
  ["E5", "Byte đầu entry là E5: tập tin đã xóa."],
  ["Thuộc tính", "Byte 0B của entry, là tổng các cờ R 01, H 02, S 04, V 08, D 10, A 20."],
];

export default function Glossary() {
  return (
    <section>
      <PageHead tag="Ôn tập" title="Từ điển và máy tính đổi số" />
      <dl className="glossary">
        {TERMS.map(([term, meaning]) => (
          <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>
        ))}
      </dl>
      <h2>Máy tính đổi số</h2>
      <p className="note">Gõ số vào ô để tự kiểm tra phép đổi khi làm bài ở nhà.</p>
      <Calculators />
    </section>
  );
}
