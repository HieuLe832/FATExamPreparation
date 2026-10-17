// The facts to memorise, one block per exam question. The same blocks fill the "Bảng tra" column next to
// each question page and the full "Bảng phải thuộc" page, so there is a single place to change them.
// Every <Must> on a question page belongs in one of these blocks.

const SB = <>S<sub>B</sub></>, SC = <>S<sub>C</sub></>, NF = <>N<sub>F</sub></>, SF = <>S<sub>F</sub></>, SV = <>S<sub>V</sub></>;

/** Two-column lookup table: [key, meaning]. Keys are what you look for in the dump. `stack` puts each
 *  meaning under its key, for long meanings. */
function Facts({ rows, head, stack }) {
  return (
    <table className={"lk" + (stack ? " stack" : "")}>
      {head && <thead><tr><th>{head[0]}</th><th>{head[1]}</th></tr></thead>}
      <tbody>
        {rows.map(([k, v], i) => <tr key={i}><th scope="row">{k}</th><td>{v}</td></tr>)}
      </tbody>
    </table>
  );
}

function HexFacts() {
  return (
    <Facts rows={[
      ["A B C D E F", "10 11 12 13 14 15"],
      ["Số 2, 4 byte", <>đảo thứ tự byte: <code>26 00</code> → 0026 = 38</>],
      ["Chữ", "đọc xuôi, ở cột bên phải dump"],
      ["1 sector", <>512 byte = <code>200</code> hex</>],
      ["Sector", "offset ÷ 512"],
    ]} />
  );
}

function MbrFacts() {
  return (
    <>
      <Facts rows={[
        [<>1BE, 1CE,<br />1DE, 1EE</>, "4 dòng phân vùng, mỗi dòng 16 byte. Dòng toàn 00 = không có"],
        ["+0", <><code>80</code> = khởi động, <code>00</code> = không</>],
        ["+4", "loại (bảng dưới)"],
        ["+8", "sector đầu, 4 byte (đề mẫu không hỏi)"],
        ["+C", "số sector, 4 byte"],
        ["Dung lượng", "số sector × 512 byte"],
      ]} />
      <Facts head={["Mã +4", "Loại"]} rows={[["07", "NTFS"], ["0B, 0C", "FAT32"], ["83", "Linux"], ["05, 0F", "Extended"]]} />
    </>
  );
}

function BootFacts() {
  return (
    <>
      <Facts head={["Byte · dài", "Nghĩa"]} rows={[
        ["0B · 2", "số byte / sector"],
        ["0D · 1", <>{SC}: sector / cluster</>],
        ["0E · 2", <>{SB}: sector vùng boot</>],
        ["10 · 1", <>{NF}: số bảng FAT</>],
        ["20 · 4", <>{SV}: tổng số sector</>],
        ["24 · 4", <>{SF}: sector / bảng FAT</>],
        ["2C · 4", "cluster đầu của RDET"],
        ["52 · 8", "loại FAT (chữ)"],
      ]} />
      <Facts head={["Tính", ""]} rows={[
        ["FAT1", <>= {SB}</>],
        ["FAT2", <>= {SB} + {SF}</>],
        ["Data", <>= {SB} + {NF} × {SF}</>],
        ["RDET", <>= Data + (cluster RDET − 2) × {SC}, thường = Data</>],
        ["Dung lượng", <>= {SV} × 512</>],
      ]} />
    </>
  );
}

function FatFacts() {
  return (
    <Facts rows={[
      ["Ô k", "byte 4 × k của bảng FAT"],
      ["00000000", "trống"],
      ["0FFFFFFF", "hết: cluster cuối"],
      ["Số khác", "cluster tiếp theo"],
      ["Cluster k", <>sector Data + (k − 2) × {SC}, dài {SC} sector</>],
    ]} />
  );
}

function DirFacts() {
  return (
    <>
      <Facts rows={[
        ["Entry", "32 byte = 2 dòng hex"],
        ["Byte đầu 00", "hết bảng"],
        ["Byte đầu E5", "đã xóa, bỏ qua"],
        ["0B = 0F", "mảnh tên dài"],
        ["0B = 08", "tên ổ, bỏ qua"],
        ["0B = 10", "thư mục"],
        ["0B = 20", "tập tin"],
        ["00–07, 08–0A", "tên, đuôi"],
        ["14–15 + 1A–1B", "cluster đầu (2 byte cao, 2 byte thấp)"],
        ["1C–1F", "kích thước (thư mục: 0)"],
        ["Tên dài", "mảnh ngay trên entry chính, đọc từ dưới lên; mỗi chữ 2 byte"],
        ["SDET", "bỏ qua “.” và “..”"],
      ]} />
      <Facts head={["Cờ 0B", "Cộng lại thành byte 0B"]} rows={[
        ["R 01 · H 02", "chỉ đọc · ẩn"],
        ["S 04 · V 08", "hệ thống · tên ổ"],
        ["D 10 · A 20", "thư mục · lưu trữ"],
      ]} />
    </>
  );
}

function OpsFacts() {
  return (
    <Facts stack rows={[
      ["MOVE", "thư mục cũ: entry → E5 · thư mục đích: thêm entry · FAT, Data không đổi"],
      ["XÓA", "entry → E5 · ô FAT của tập tin → 0 (FAT1 và FAT2) · Data không đổi"],
      ["COPY", "thư mục đích: thêm entry · ô trống → chuỗi mới (FAT1 và FAT2) · Data: cluster mới"],
      ["Entry ở byte e", "sector đầu thư mục + ⌊e ÷ 512⌋"],
      ["Ô FAT k", "FAT1 + ⌊4k ÷ 512⌋ và FAT2 + ⌊4k ÷ 512⌋"],
      ["COPY cần", <>kích thước ÷ ({SC} × 512) cluster, làm tròn lên</>],
      ["Tên dài", "mảnh tên đổi cùng entry chính"],
    ]} />
  );
}

function SjfFacts() {
  return (
    <Facts stack rows={[
      ["Chọn", "tiến trình còn lại ít nhất trong lượt CPU hiện tại (tính cả tiến trình đang chạy)"],
      ["Xét lại khi", "có tiến trình vào RL (mới đến hoặc xong I/O), hoặc tiến trình đang chạy xong lượt"],
      ["Giành CPU", "chỉ khi ngắn hơn hẳn. Bằng nhau: tiến trình đang chạy giữ CPU; CPU rảnh: ai vào RL trước"],
      ["Còn lại", "CPU của lượt − phần đã chạy"],
      ["Xong lượt CPU", "đi I/O (giờ về = bây giờ + thời gian I/O), hết cột thì kết thúc"],
      ["Không ai cần CPU", "ô trống trên Gantt"],
    ]} />
  );
}

function IoFacts() {
  return (
    <Facts stack rows={[
      ["Bài 2: không ghi thiết bị", "I/O các tiến trình chạy song song, không chờ nhau"],
      ["Bài 1: R1, R2 (FIFO)", "mỗi thiết bị 1 cái; rảnh → dùng ngay; bận → xếp cuối hàng chờ"],
      ["Xong thiết bị", "quay lại RL; thiết bị chuyển ngay cho tiến trình đầu hàng"],
      ["Thời gian 0, Null", "không có lượt đó"],
      ["Thiết bị", "không bị giành giữa chừng"],
    ]} />
  );
}

function WtFacts() {
  return (
    <Facts stack rows={[
      ["WT", "tổng các khoảng nằm trong RL (chờ CPU)"],
      ["Không tính", "lúc chạy CPU, lúc làm I/O, lúc xếp hàng chờ thiết bị"],
      ["Kiểm tra", "WT = kết thúc − vào − tổng CPU − tổng I/O − thời gian xếp hàng chờ thiết bị"],
      ["Trung bình", "tổng WT ÷ số tiến trình"],
    ]} />
  );
}

/** Numbers found in câu 2a (and 2b with `full`), for the mini disk and for Baitap_HTTT. */
function KnownNumbers({ full }) {
  const rows = [
    [SC, "2", "4"], ["FAT1", "6", "38"], ["FAT2", "8", "851"], ["Data = RDET", "10", "1664"],
    ...(full ? [["SDET", "DOCS 16", "TMC1 1736, TMC2 1756"], ["Ô trống đầu", "6", "11, 12"]] : []),
  ];
  return (
    <table className="lk known-table">
      <thead><tr><th></th><th>Đề mini</th><th>Đề thật</th></tr></thead>
      <tbody>{rows.map(([k, a, b], i) => <tr key={i}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>)}</tbody>
    </table>
  );
}

export const LOOKUPS = {
  known: { title: "Số đã tính ở câu 2a", Body: () => <KnownNumbers /> },
  knownFull: { title: "Số đã tính ở câu 2a, 2b", Body: () => <KnownNumbers full /> },
  hex: { title: "Đọc hex", Body: HexFacts },
  mbr: { title: "Câu 1 · MBR", Body: MbrFacts },
  boot: { title: "Câu 2a · Boot sector", Body: BootFacts },
  fat: { title: "Câu 2b · Bảng FAT", Body: FatFacts },
  dir: { title: "Câu 2b · Thư mục", Body: DirFacts },
  ops: { title: "Câu 2c–e · MOVE, XÓA, COPY", Body: OpsFacts },
  sjf: { title: "Tiến trình · SJF không độc quyền", Body: SjfFacts },
  io: { title: "Tiến trình · I/O và thiết bị", Body: IoFacts },
  wt: { title: "Tiến trình · Thời gian chờ", Body: WtFacts },
};

/** The blocks listed in a page's `lookup`, for the side column. */
export function LookupBlocks({ keys }) {
  return keys.map((k) => {
    const { title, Body } = LOOKUPS[k];
    return (
      <div className="lookup-block" key={k}>
        <h3>{title}</h3>
        <Body />
      </div>
    );
  });
}
