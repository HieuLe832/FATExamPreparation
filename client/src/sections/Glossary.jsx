import { SectionHead } from "../components/Study.jsx";

const TERMS = [
  ["Byte", "1 ô nhớ, viết bằng 2 ký tự hex (00–FF)."],
  ["Hex", "Cách viết số dùng 0–9 và A–F. A = 10 … F = 15."],
  ["Đọc ngược (little-endian)", "Số nhiều byte phải đảo thứ tự: 26 00 → 0026."],
  ["Offset", "Vị trí của byte. Offset ÷ 512 = số sector."],
  ["Sector", "1 ô 512 byte trên đĩa."],
  ["Cluster", "Vài sector liền nhau (đề mini: 2, đề thật: 4). Đánh số từ 2."],
  ["Phân vùng", "Một phần của ổ cứng, như ổ C, ổ D."],
  ["Volume", "Một phân vùng đã định dạng, ví dụ một volume FAT32."],
  ["Active", "Phân vùng dùng để khởi động máy."],
  ["MBR", "Sector 0 của ổ cứng, chứa bảng 4 phân vùng."],
  ["Boot sector", "Sector 0 của phân vùng, chứa các thông số."],
  ["Bảng FAT", "Linked list ghi “sau cluster này là cluster nào”. Có 2 bản."],
  ["EOF", "Hết file. Trong FAT32 là 0FFFFFFF."],
  ["Thư mục", "Mục lục: mỗi dòng ghi tên file và cluster đầu."],
  ["RDET", "Thư mục gốc. FAT32 đặt ở cluster 2."],
  ["SDET", "Thư mục con. Mở đầu bằng “.” và “..”."],
  ["Entry", "1 dòng 32 byte trong thư mục, mô tả 1 file."],
  ["Tên dài (LFN)", "Entry có byte 0B = 0F, chứa một mảnh tên."],
  ["E5", "Byte đầu entry là E5 = file đã xóa."],
  ["Thuộc tính", "Byte 0B của entry; mỗi bit là một cờ: A, D, V, S, H, R."],
];

export default function Glossary() {
  return (
    <section id="tu-dien">
      <SectionHead tag="Gặp chữ lạ thì tra ở đây" title="Từ điển thuật ngữ" />
      <dl className="glossary">
        {TERMS.map(([term, meaning]) => (
          <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>
        ))}
      </dl>
    </section>
  );
}
