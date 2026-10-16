// "Bảng phải thuộc": the lookup blocks of every question (from Lookup.jsx) plus the mistakes that cost
// marks. Keep the pitfalls in sync with the Traps lists on the question pages.
import { PageHead } from "../components/Study.jsx";
import { LOOKUPS } from "./Lookup.jsx";

const SC = <>S<sub>C</sub></>;
const c = (s) => <code>{s}</code>;

const PITFALLS = [
  ["Đọc xuôi số nhiều byte", <>{c("26 00")} là 38 (đảo lại), không phải 9 728.</>],
  ["Quên cluster đánh số từ 2", <>Cluster k = Data + (k − <b>2</b>) × {SC}.</>],
  ["Cộng thêm vùng RDET riêng", "FAT32 không có. RDET nằm trong Data, ở cluster 2: sector đầu RDET = sector đầu Data."],
  ["Coi mảnh tên dài là tập tin", <>Entry có byte {c("0B")} = {c("0F")} chỉ là một phần của tên.</>],
  ["Ghép tên dài từ trên xuống", "Mảnh số 1 nằm sát entry chính; đọc từ dưới lên."],
  ["Đưa entry đã xóa, tên ổ vào cây", <>Byte đầu {c("E5")} = đã xóa; byte 0B = {c("08")} = tên ổ. Bỏ qua cả hai.</>],
  ["Đọc thuộc tính ở byte 0C", <>Thuộc tính ở {c("0B")}.</>],
  ["Lấy kích thước thư mục từ entry", "Luôn là 0. Sector của thư mục tính từ chuỗi FAT."],
  ["Đếm sector theo kích thước tập tin", "Đếm theo cluster: tập tin luôn chiếm trọn cluster."],
  ["Quên FAT2", "Sửa bảng FAT là sửa cả FAT1 và FAT2."],
  ["Nghĩ XÓA làm mất nội dung", "Data không đổi. Chỉ entry và ô FAT bị sửa."],
  ["Làm 2d, 2e trên kết quả câu trước", "Mỗi câu 2c, 2d, 2e bắt đầu lại từ đĩa ban đầu."],
  ["MBR: quên × 512", "Dung lượng = số sector × 512 byte."],
];

export default function MustKnow() {
  const block = (k) => { const { title, Body } = LOOKUPS[k]; return [<h2 key={k + "h"}>{title}</h2>, <div className="lookup-block wide" key={k}><Body /></div>]; };
  return (
    <section>
      <PageHead tag="Ôn tập" title="Bảng phải thuộc" lead="Mọi chỗ tô vàng ở các trang trước, gom theo câu. Đây cũng là nội dung cột Bảng tra bên cạnh mỗi trang." />
      {["hex", "mbr", "boot", "fat", "dir", "ops"].flatMap(block)}

      <h2>Lỗi hay gặp</h2>
      <ol className="pitfalls">
        {PITFALLS.map(([title, body], i) => <li key={i}><b>{title}</b><span>{body}</span></li>)}
      </ol>
    </section>
  );
}
