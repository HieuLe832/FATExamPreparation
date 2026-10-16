import { SectionHead, Table } from "../components/Study.jsx";

const PITFALLS = [
  ["Đọc xuôi số little-endian", <><code>26 00</code> là 38, không phải 0x2600 = 9728. Chỉ chuỗi ký tự mới đọc xuôi.</>],
  ["Lẫn hệ 16 và hệ 10", <>Offset trong bảng slide là hex: <code>1C</code> = 28, <code>2C</code> = 44. Giá trị <code>2D 03</code> = 0x32D = 813, không phải 32D.</>],
  ["Quên cluster bắt đầu từ 2", <>Cluster k ở sector Data + (k − 2)·S<sub>C</sub>. Cluster 20 → 1664 + 18 × 4 = 1736.</>],
  [<>Cộng thêm S<sub>RDET</sub> với FAT32</>, "FAT32 không có vùng RDET riêng; RDET là cluster 2 trong vùng dữ liệu. Vì vậy RDET và Data cùng bắt đầu ở 1664."],
  ["Coi entry phụ hoặc nhãn volume là tập tin", <>Thuộc tính <code>0F</code> = entry phụ (một phần tên dài), <code>08</code> = nhãn volume. Cả hai đều không xuất hiện trong cây.</>],
  ["Đưa entry đã xóa vào cây", <>Byte đầu <code>E5</code>: bỏ qua cả entry chính lẫn các entry phụ đi kèm (ở đây là “System Volume Information”).</>],
  ["Đọc nhầm byte 0C là thuộc tính", <>Thuộc tính ở <code>0B</code>. Byte <code>0C</code> (đề có giá trị <code>18</code>) là vùng dành riêng: bỏ qua.</>],
  ["Ghép tên dài sai thứ tự", <>Ghép theo số thứ tự <code>01</code>, <code>02</code>…, không theo thứ tự từ trên xuống. Entry <code>01</code> nằm sát entry chính. “Ext S” + “uperbl” + “oc” + “k.tpl”.</>],
  ["Lấy kích thước thư mục từ entry", "Entry thư mục luôn ghi kích thước 0. Số sector của thư mục lấy từ chuỗi FAT."],
  ["Liệt kê sector theo kích thước thay vì theo cluster", "Tập tin chiếm trọn cluster: 2321 B vẫn chiếm 2 cluster = 8 sector (1728–1735), dù chỉ 5 sector đầu có dữ liệu."],
  ["Chỉ ghi FAT1, quên FAT2", "Volume có 2 bảng FAT; khi FAT đổi thì cả sector 38 (FAT1) và 851 (FAT2) cùng đổi."],
  ["Nghĩ MOVE làm đổi FAT và dữ liệu", <>MOVE trong cùng volume chỉ ghi entry ở thư mục đích và đánh <code>E5</code> ở thư mục nguồn.</>],
  ["Nghĩ DELETE xóa nội dung", <>Xóa chỉ đánh <code>E5</code> và đưa phần tử FAT về 0. Vùng dữ liệu không đổi.</>],
  ["COPY lấy cluster tùy ý", "Lấy các phần tử FAT trống đầu tiên (11, 12), không phải nối sau cluster lớn nhất đang dùng (25)."],
  ["Cố gắn chuỗi FAT “mồ côi” vào tập tin", "Cluster 3, 4, 5, 10 đang là EOF nhưng không có entry sống nào trỏ tới. Chúng thuộc thư mục đã xóa hoặc phần không chụp; bỏ qua."],
  ["MBR: dùng CHS, quên × 512, quên byte 80", <>Dùng sector bắt đầu (+8) và số sector (+C) dạng LBA. Dung lượng = số sector × 512. Byte trạng thái <code>80</code> mới là phân vùng khởi động.</>],
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
