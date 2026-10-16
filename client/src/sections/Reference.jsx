import { SectionHead, Table } from "../components/Study.jsx";

const PITFALLS = [
  ["Đọc xuôi số nhiều byte", <><code>26 00</code> là 38 (đọc ngược), không phải 9728.</>],
  ["Quên cluster bắt đầu từ 2", <>Cluster k = Data + (k − <b>2</b>) × S<sub>C</sub>.</>],
  ["Cộng thêm vùng RDET riêng", "FAT32 không có. RDET nằm trong vùng Data, ở cluster 2."],
  ["Coi mảnh tên dài là file", <>Entry có byte <code>0B</code> = <code>0F</code> chỉ là một phần của tên.</>],
  ["Đưa file đã xóa vào cây", <>Byte đầu <code>E5</code> = đã xóa. Bỏ qua.</>],
  ["Nhầm byte 0C là thuộc tính", <>Thuộc tính ở <code>0B</code>.</>],
  ["Lấy kích thước thư mục từ entry", "Luôn là 0. Xem chuỗi FAT."],
  ["Đếm sector theo kích thước file", "Đếm theo cluster: file 1280 byte vẫn chiếm trọn 2 cluster."],
  ["Quên FAT2", "Sửa FAT là sửa cả 2 bảng FAT."],
  ["Nghĩ XÓA làm mất nội dung", "Nội dung vẫn còn. Chỉ entry và ô FAT bị đổi."],
  ["MBR: quên × 512", "Dung lượng = số sector × 512 byte."],
];

export function Pitfalls() {
  return (
    <section id="pitfalls">
      <SectionHead tag="Known pitfalls" title="Lỗi hay gặp" />
      <ol className="pitfalls">
        {PITFALLS.map(([title, body], i) => (
          <li key={i}><div><b>{title}</b><p>{body}</p></div></li>
        ))}
      </ol>
    </section>
  );
}

export function CheatSheet() {
  return (
    <section id="cheat">
      <SectionHead tag="Mang vào phòng thi trong đầu" title="Tóm tắt công thức" />
      <Table
        wrapStyle={{ maxWidth: 900 }}
        head={["Cần", "Lấy ở đâu / tính thế nào"]}
        rows={[
          ["Phân vùng trong MBR", <>4 entry × 16 B tại <code>1BE</code>; +0 active (80), +4 loại, +8 LBA đầu, +C số sector</>],
          [<>Byte/sector, S<sub>C</sub>, S<sub>B</sub>, N<sub>F</sub></>, <>Boot sector: <code>0B</code> (2), <code>0D</code> (1), <code>0E</code> (2), <code>10</code> (1)</>],
          [<>S<sub>V</sub>, S<sub>F</sub>, cluster RDET, loại FAT</>, <><code>20</code> (4), <code>24</code> (4), <code>2C</code> (4), <code>52</code> (8 ký tự)</>],
          ["Sector đầu FAT1 / FAT2 / Data", <>S<sub>B</sub> / S<sub>B</sub> + S<sub>F</sub> / S<sub>B</sub> + N<sub>F</sub>·S<sub>F</sub></>],
          ["Cluster k → sector", <>Data + (k − 2)·S<sub>C</sub> … + S<sub>C</sub> − 1</>],
          ["Phần tử FAT32 k", <>Byte 4k của bảng → sector S<sub>B</sub> + ⌊4k / 512⌋; 0 trống, 0FFFFFFF EOF</>],
          ["Entry chính", <>tên <code>0</code>(8) · đuôi <code>8</code>(3) · thuộc tính <code>0B</code> · cluster cao <code>14</code> · cluster thấp <code>1A</code> · size <code>1C</code>(4)</>],
          ["Entry phụ", <>thứ tự <code>0</code> · 5 ký tự <code>1</code> · <code>0B</code> = 0F · 6 ký tự <code>0E</code> · 2 ký tự <code>1C</code></>],
          ["DELETE", "E5 ở entry (chính + phụ); phần tử FAT → 0 (cả 2 bảng); Data giữ nguyên"],
          ["MOVE (cùng volume)", "Ghi entry ở thư mục đích; E5 ở thư mục nguồn; FAT, Data giữ nguyên"],
          ["COPY", "Entry mới ở thư mục đích; cluster trống đầu tiên → chuỗi FAT mới (cả 2 bảng); ghi Data mới"],
        ]}
      />
    </section>
  );
}
