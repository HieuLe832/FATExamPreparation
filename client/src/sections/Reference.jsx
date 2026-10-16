// "Bảng phải thuộc": every highlighted fact from the question pages, grouped by question, plus the
// mistakes that cost marks. Keep it in sync with the Recipe boxes and the Traps lists.
import { PageHead, Table } from "../components/Study.jsx";

const SB = <>S<sub>B</sub></>, SC = <>S<sub>C</sub></>, NF = <>N<sub>F</sub></>, SF = <>S<sub>F</sub></>, SV = <>S<sub>V</sub></>;
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
  return (
    <section className="cheatsheet">
      <PageHead tag="Ôn tập" title="Bảng phải thuộc" lead="Mọi chỗ tô vàng ở các trang trước, gom theo câu. Đọc lại trang này trước khi vào thi." />

      <h2>Đọc hex</h2>
      <ul className="facts">
        <li>Số 2 hoặc 4 byte: <b>đảo thứ tự byte</b> rồi mới đổi. Chữ thì đọc xuôi.</li>
        <li>1 sector = 512 byte = {c("200")} hex. Sector = offset ÷ 512.</li>
      </ul>

      <h2>Câu 1 · MBR</h2>
      <Table head={["Byte", "Nghĩa"]} rows={[
        [c("1BE, 1CE, 1DE, 1EE"), "4 dòng phân vùng, mỗi dòng 16 byte. Dòng toàn 00 = không có"],
        [c("+0"), <>{c("80")} = phân vùng khởi động</>],
        [c("+4"), <>Loại: {c("07")} NTFS · {c("0B")}, {c("0C")} FAT32 · {c("83")} Linux · {c("05")}, {c("0F")} Extended</>],
        [c("+C"), "Số sector (4 byte). Dung lượng = số sector × 512"],
      ]} />

      <h2>Câu 2a · Boot sector</h2>
      <Table head={["Byte", "Dài", "Nghĩa"]} rows={[
        [c("0B"), "2", "Số byte / sector"],
        [c("0D"), "1", <>{SC}: số sector / cluster</>],
        [c("0E"), "2", <>{SB}: số sector vùng boot</>],
        [c("10"), "1", <>{NF}: số bảng FAT</>],
        [c("20"), "4", <>{SV}: tổng số sector của volume</>],
        [c("24"), "4", <>{SF}: số sector / bảng FAT</>],
        [c("2C"), "4", "Cluster đầu của RDET"],
        [c("52"), "8", "Loại FAT (chữ)"],
      ]} />
      <div className="formulas">
        <span>FAT1 = {SB}</span>
        <span>FAT2 = {SB} + {SF}</span>
        <span>Data = {SB} + {NF} × {SF}</span>
        <span>RDET = Data (cluster 2)</span>
        <span>Dung lượng = {SV} × 512</span>
      </div>

      <h2>Câu 2b · Bảng FAT</h2>
      <ul className="facts">
        <li>Ô k ở byte 4 × k của bảng. Đọc ngược 4 byte: {c("0")} trống · {c("0FFFFFFF")} hết · số khác = cluster tiếp theo.</li>
        <li>Cluster k bắt đầu ở sector Data + (k − 2) × {SC}, dài {SC} sector.</li>
      </ul>

      <h2>Câu 2b · Thư mục</h2>
      <Table head={["Ở đâu", "Nghĩa"]} rows={[
        ["Byte đầu", <>{c("00")} hết bảng · {c("E5")} đã xóa</>],
        [c("0B"), <>{c("0F")} mảnh tên dài · {c("08")} tên ổ · {c("10")} thư mục · {c("20")} tập tin</>],
        ["Cờ thuộc tính", <>R {c("01")} · H {c("02")} · S {c("04")} · V {c("08")} · D {c("10")} · A {c("20")}; byte 0B là tổng</>],
        [c("00–07, 08–0A"), "Tên, đuôi"],
        [c("14–15 + 1A–1B"), "Cluster đầu (2 byte cao, 2 byte thấp)"],
        [c("1C–1F"), "Kích thước (thư mục: 0)"],
        ["Tên dài", "Mảnh tên ngay trên entry chính, đọc từ dưới lên; mỗi chữ 2 byte"],
        ["SDET", "Bỏ qua “.” và “..”"],
      ]} />

      <h2>Câu 2c–e · MOVE, XÓA, COPY</h2>
      <Table head={["Lệnh", "FAT", "Thư mục chứa tập tin", "Thư mục đích", "Data"]} rows={[
        [<b>MOVE</b>, "không đổi", "entry → E5", "thêm entry", "không đổi"],
        [<b>XÓA</b>, "ô → 0 (cả 2 bảng)", "entry → E5", "", "không đổi"],
        [<b>COPY</b>, "chuỗi mới (cả 2 bảng)", "không đổi", "thêm entry", "cluster mới"],
      ]} />
      <ul className="facts">
        <li>Entry ở byte e → sector đầu thư mục + ⌊e ÷ 512⌋. Ô FAT k → FAT1 + ⌊4k ÷ 512⌋ và FAT2 + ⌊4k ÷ 512⌋.</li>
        <li>COPY: số cluster = kích thước ÷ ({SC} × 512), làm tròn lên; lấy các ô trống đầu tiên.</li>
      </ul>

      <h2>Lỗi hay gặp</h2>
      <ol className="pitfalls">
        {PITFALLS.map(([title, body], i) => <li key={i}><b>{title}</b><span>{body}</span></li>)}
      </ol>
    </section>
  );
}
