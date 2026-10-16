import { SectionHead } from "../components/Study.jsx";

const TERMS = [
  ["Bit", "Một chữ số 0 hoặc 1."],
  ["Byte", "8 bit, giá trị 0–255, viết bằng 2 chữ số hex (00–FF)."],
  ["Hex (hệ 16)", "Cách viết số dùng 0–9 và A–F (A = 10 … F = 15). Ví dụ 0x26 = 38."],
  ["Little-endian", "Số nhiều byte được lưu byte nhỏ trước. Đọc giá trị thì đảo ngược thứ tự byte: 26 00 → 0x0026."],
  ["Offset", "Vị trí của một byte, tính từ byte đầu tiên. Offset ÷ 512 = số sector."],
  ["Sector", "Một “trang” 512 byte trên đĩa. Đơn vị nhỏ nhất đĩa đọc/ghi."],
  ["Cluster", "Nhóm vài sector liền nhau (đề: 4). Đơn vị cấp chỗ cho file. Đánh số từ 2."],
  ["Phân vùng (partition)", "Một phần của ổ cứng, như ổ C, ổ D. Tối đa 4 phân vùng chính trong MBR."],
  ["Volume", "Một phân vùng đã được định dạng (ở bài 2 là FAT32)."],
  ["MBR", "Sector 0 của ổ cứng. Chứa bảng mô tả 4 phân vùng."],
  ["Active", "Phân vùng dùng để khởi động máy; byte trạng thái là 80."],
  ["Boot sector", "Sector đầu của volume. Chứa các thông số: số sector, số bảng FAT, kích thước cluster…"],
  ["Bảng FAT", "Bảng ghi “sau cluster này là cluster nào”. Có 2 bản giống nhau (FAT1, FAT2)."],
  ["EOF", "Giá trị trong bảng FAT nghĩa là “đây là cluster cuối của file”. FAT32: 0FFFFFFF."],
  ["RDET", "Bảng thư mục gốc: danh sách file/thư mục ở thư mục gốc. FAT32 đặt nó ở cluster 2."],
  ["SDET", "Bảng thư mục con: giống RDET nhưng của một thư mục con, luôn mở đầu bằng “.” và “..”."],
  ["Entry", "Một dòng 32 byte trong RDET/SDET."],
  ["Entry chính", "Entry chứa tên ngắn (8.3), thuộc tính, cluster bắt đầu, kích thước."],
  ["Entry phụ (LFN)", "Entry chỉ chứa một đoạn tên dài; nằm ngay trên entry chính; byte thuộc tính là 0F."],
  ["Tên 8.3", "Tên ngắn: tối đa 8 ký tự + 3 ký tự đuôi, ví dụ EXTSUP~1.TPL."],
  ["Thuộc tính", "Byte ở vị trí 0B của entry. Mỗi bit là một cờ: A (archive), D (thư mục), V (nhãn volume), S, H, R."],
  ["E5", "Byte đầu của entry là E5 nghĩa là file đã bị xóa."],
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
