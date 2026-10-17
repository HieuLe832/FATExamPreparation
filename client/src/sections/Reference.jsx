// "Bảng phải thuộc": the lookup blocks of every question (from Lookup.jsx) plus the mistakes that cost
// marks, first for FAT, then for process scheduling. Keep the pitfalls in sync with the Traps lists on the question pages.
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

// Keep in sync with the Traps lists on the process-scheduling pages.
const PROC_PITFALLS = [
  ["So thời gian CPU ban đầu", "So thời gian còn lại của lượt hiện tại: CPU của lượt − phần đã chạy."],
  ["Quên xét lại khi có tiến trình vào RL", "Tiến trình mới đến hoặc xong I/O quay về đều có thể giành CPU."],
  ["Giành CPU khi bằng nhau", "Chỉ giành khi ngắn hơn hẳn."],
  ["Tính WT từ lúc 0", "Tính từ thời điểm tiến trình vào RL."],
  ["Cộng I/O hoặc thời gian xếp hàng chờ thiết bị vào WT", "WT chỉ tính thời gian nằm trong RL."],
  ["Vẽ liền các ô khi CPU rảnh", "Không ai cần CPU thì vẽ ô trống."],
  ["Cho I/O bài 2 xếp hàng", "Đề không ghi thiết bị: I/O chạy song song."],
  ["Dùng thiết bị đang bận", "Mỗi thiết bị 1 cái: xếp hàng FIFO, người trước xong thì chuyển ngay cho người đầu hàng."],
  ["Coi “0 Null” là một lượt", "Không có lượt đó; tiến trình đi tiếp hoặc kết thúc."],
  ["Bài 1 chỉ vẽ CPU", "Đề hỏi cả sơ đồ R1."],
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

      {["sjf", "io", "wt"].flatMap(block)}

      <h2>Lỗi hay gặp: tiến trình</h2>
      <ol className="pitfalls">
        {PROC_PITFALLS.map(([title, body], i) => <li key={i}><b>{title}</b><span>{body}</span></li>)}
      </ol>
    </section>
  );
}
