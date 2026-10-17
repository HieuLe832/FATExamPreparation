// Baitap_HTTT, one block per exam question, shown at the end of each question page: the exam quoted as
// text (<Exam>, dumps from src/fat/baitap.json), then the worked answer. The answers are hand-written;
// src/fat/baitap.test.js pins the numbers used here. Offsets are the absolute ones printed in the PDF.
import { StaticDump } from "../components/HexDump.jsx";
import { Calc, DiskMap, Exam, Final, ImpactTable, Known, Real, Result, Table, Tree } from "../components/Study.jsx";
import BAITAP from "../fat/baitap.json";

const n = (label) => ({ label, cls: "n" });
const mono = (s) => <span className="mono">{s}</span>;
const nw = (s) => <span className="mono nw">{s}</span>;
const sub = (s) => <span className="sub">{s}</span>;
const SB = <>S<sub>B</sub></>, SC = <>S<sub>C</sub></>, NF = <>N<sub>F</sub></>, SF = <>S<sub>F</sub></>;

const DUMPS = Object.fromEntries(BAITAP.map((d) => [d.id, d]));

/** "• Nội dung phần đầu của sector … như sau:" and the dump under it, as bài tập 2 prints them. */
function SectorDump({ id, sector }) {
  return (
    <>
      <ul><li>Nội dung phần đầu của sector {sector} như sau:</li></ul>
      <StaticDump dump={DUMPS[id]} bare />
    </>
  );
}

/** The blank table that questions c, d, e ask to fill in. */
function BlankImpact() {
  return (
    <Table
      className="blank"
      head={["", "Không thay đổi", "Thay đổi (ghi rõ chỉ số sector bị thay đổi)"]}
      rows={["FAT", "RDET", "SDET", "Data"].map((r) => [<b>{r}</b>, "", ""])}
    />
  );
}

/** Question c, d or e: the command, then the two rules for filling in the table. */
function OpQuestion({ letter, command }) {
  return (
    <Exam>
      <p>{letter}) Sau khi thực hiện lệnh {command}, hãy cho biết thao tác này ảnh hưởng như thế nào tới các vùng trên Volume:</p>
      <ol type="i">
        <li>Nếu không thay đổi đánh dấu “x” vào cột Không thay đổi</li>
        <li>Nếu thay đổi, ghi rõ chỉ số sector thay đổi. Nếu cả vùng thay đổi thì ghi vào “tất cả”</li>
      </ol>
      <BlankImpact />
    </Exam>
  );
}

const TREE_QUESTION = "b) Vẽ cây thư mục của Volume trên và cho biết các thông số (thuộc tính trạng thái, kích thước, danh sách các sector chứa dữ liệu) của từng tập tin, thư mục";

// Rows of the volume table in question a, in the exam's words.
const VOLUME_ROWS = [
  "Loại FAT", "Số byte cho 1 sector", "Số sector vùng Bootsector", "Số lượng bảng FAT", "Số sector cho 1 bảng FAT",
  "Dung lượng đĩa (KB/MB/GB)", "Sector đầu tiên của bảng FAT1", "Sector đầu tiên của bảng RDET",
  "Sector đầu tiên của vùng Data", "Số sector cho 1 cluster",
];

// The 4 rows of the partition table: 1BE, 1CE, 1DE, 1EE, 16 bytes each.
const PARTITION_ROWS = [0, 1, 2, 3].map((p) => [0x1be + p * 16, 16]);

export function RealMbr() {
  return (
    <Real>
      <Exam>
        <p><b>Bài tập 1:</b> Cho thông tin Master boot sector của một ổ cứng như sau:</p>
        <StaticDump dump={DUMPS.mbr} bare />
        <p>Hãy cho biết ổ cứng này được chia làm mấy phân vùng, loại và dung lượng của từng phân vùng. Phân vùng nào là phân vùng khởi động?</p>
      </Exam>
      <p>Bảng phân vùng là 4 dòng 16 byte cuối sector, bắt đầu ở dòng <code>000001B0</code>, cột <code>E</code> (cùng màu là cùng một dòng).</p>
      <StaticDump dump={DUMPS.mbr} from={0x1b0} to={0x1f0} bands={PARTITION_ROWS} />
      <Table
        head={["Dòng", "+0 khởi động", "+4 loại", "+C số sector (đảo)", n("Số sector"), n("Dung lượng")]}
        rows={[
          [mono("1BE"), "00 · không", "DE · Dell Utility (FAT)", nw("47 78 01 00 → 00017847"), "96 327", "≈ 47,03 MB"],
          [mono("1CE"), <span className="hi">80 · có</span>, "07 · NTFS", nw("37 94 32 02 → 02329437"), "36 869 175", "≈ 17,58 GB"],
          [mono("1DE"), "00 · không", "83 · Linux", nw("3D E7 DA 00 → 00DAE73D"), "14 346 045", "≈ 6,84 GB"],
          [mono("1EE"), "00 · không", "0F · Extended", nw("8F AC C0 03 → 03C0AC8F"), "62 958 735", "≈ 30,02 GB"],
        ]}
      />
      <Calc>96 327 × 512 = 49 319 424 byte; ÷ 1024 ÷ 1024 ≈ 47,03 MB</Calc>
      <Result>4 phân vùng. Phân vùng 2 (NTFS) là phân vùng khởi động.</Result>
    </Real>
  );
}

export function RealBoot() {
  return (
    <Real>
      <Exam>
        <p><b>Bài tập 2:</b> Cho một Volume cùng với các thông tin:</p>
        <SectorDump id="boot" sector={0} />
        <p className="exam-gap">Đề cho tiếp phần đầu của sector 38, 1664, 1736 và 1756; các dump này chép ở câu 2b.</p>
        <p>a) Xác định thông tin Volume</p>
        <Table className="blank" head={["STT", "Nội dung", "Giá trị"]} rows={VOLUME_ROWS.map((r, i) => [i + 1, r, ""])} />
      </Exam>
      <Table
        head={["STT", "Nội dung", "Byte trong đề (sector 0)", n("Giá trị")]}
        rows={[
          ["1", "Loại FAT", <>52–59 (dòng <code>00000050</code>, cột 2–9): “FAT32”</>, "FAT32"],
          ["2", "Số byte / sector", nw("0B–0C: 00 02 → 0200"), "512"],
          ["3", <>Số sector vùng boot ({SB})</>, nw("0E–0F: 26 00 → 0026"), "38"],
          ["4", <>Số bảng FAT ({NF})</>, mono("10: 02"), "2"],
          ["5", <>Số sector / bảng FAT ({SF})</>, nw("24–27: 2D 03 00 00 → 0000032D"), "813"],
          ["6", "Dung lượng", <>{nw("20–23: 5B 5F 06 00 → 00065F5B")} = 417 627 sector; × 512 = 213 825 024 byte</>, "≈ 203,92 MB"],
          ["7", "Sector đầu FAT1", <>= {SB}</>, "38"],
          ["8", "Sector đầu RDET", <>2C: cluster 2 → trùng sector đầu Data</>, "1664"],
          ["9", "Sector đầu Data", "38 + 2 × 813", "1664"],
          ["10", <>Số sector / cluster ({SC})</>, mono("0D: 04"), "4"],
        ]}
      />
      <Result>Kiểm tra: đề cho dump sector 38 và sector 1664, đúng là FAT1 và RDET vừa tính.</Result>
      <Known from="đây cho các câu sau" items={[[SC, 4], ["FAT1", 38], ["FAT2", "38 + 813 = 851"], ["Data", 1664]]} />
    </Real>
  );
}

// Cells 2–25 of the real FAT (sector 38); 12–17 are all free and shown as one box.
const REAL_CELLS = [
  [2, "hết", "eof"], [3, "hết", "eof"], [4, "hết", "eof"], [5, "hết", "eof"], [6, "→ 7", "next"], [7, "→ 8", "next"],
  [8, "→ 9", "next"], [9, "hết", "eof"], [10, "hết", "eof"], [11, "trống", "free"], ["12–17", "trống", "free"],
  [18, "→ 19", "next"], [19, "hết", "eof"], [20, "hết", "eof"], [21, "→ 22", "next"], [22, "hết", "eof"],
  [23, "→ 24", "next"], [24, "hết", "eof"], [25, "hết", "eof"],
].map(([k, label, cls]) => ({ k: `ô ${k}`, label, cls }));

export function RealFat() {
  return (
    <Real>
      <Exam>
        <SectorDump id="fat" sector={38} />
        <p>{TREE_QUESTION}</p>
      </Exam>
      <Known from="câu 2a" items={[[SC, 4], ["Data", 1664], ["FAT1", "sector 38"]]} />
      <p>Sector 38 là đầu FAT1. Dump bắt đầu ở offset <code>4C00</code>, nên ô k ở <code>4C00</code> + 4k. Ví dụ ô 6 ở <code>4C18</code> (dòng <code>00004C10</code>, cột 8–B): <code>07 00 00 00</code> → 7.</p>
      <DiskMap label="Ô 2 đến 25 của bảng FAT đề thật" cells={REAL_CELLS} />
      <Table
        head={["Cluster đầu", "Chuỗi", "Sector = 1664 + (k − 2) × 4", "Của (xem trang sau)"]}
        rows={[
          ["2", mono("2"), mono("1664 – 1667"), "RDET"],
          ["6", mono("6 → 7 → 8 → 9"), mono("1680 – 1695"), "EXTERNAL.DLL"],
          ["18", mono("18 → 19"), mono("1728 – 1735"), "Ext Superblock.tpl"],
          ["20", mono("20"), mono("1736 – 1739"), "TMC1"],
          ["21", mono("21 → 22"), mono("1740 – 1747"), "Sample script.whs"],
          ["23", mono("23 → 24"), mono("1748 – 1755"), "TIMEZONE.DAT"],
          ["25", mono("25"), mono("1756 – 1759"), "TMC2"],
        ]}
      />
      <Calc>cluster 6 = 1664 + (6 − 2) × 4 = 1680 → 1680–1683; cluster 9 = 1692–1695</Calc>
      <Result>Ô trống đầu tiên là 11, rồi 12 (dùng ở câu 2e). Ô 3, 4, 5, 10 không thuộc mục nào trong cây.</Result>
    </Real>
  );
}

/** A static entry table for a real directory: [offset, first byte, byte 0B, text, skip]. */
function RealEntries({ rows }) {
  return (
    <div className="tablewrap">
      <table className="t entries">
        <thead><tr><th>Entry ở</th><th>Byte đầu</th><th>Byte 0B</th><th>Đọc ra</th></tr></thead>
        <tbody>
          {rows.map(([at, first, attr, text, skip]) => (
            <tr key={at} className={skip ? "skip" : undefined}>
              <td className="mono">{at}</td><td className="mono">{first}</td><td className="mono">{attr}</td>
              <td>{text}{skip && <span className="skip-tag">bỏ qua</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RealTree() {
  return (
    <Real>
      <Exam><p>{TREE_QUESTION}</p></Exam>
      <Known from="câu 2a và bảng FAT" items={[["Data", 1664], [SC, 4], ["chuỗi cluster", "trang trước"]]} />
      <h3>RDET · sector 1664</h3>
      <Exam><SectorDump id="rdet" sector={1664} /></Exam>
      <RealEntries rows={[
        ["D0000", "4E", "08", "tên ổ “NEW VOLUME”", true],
        ["D0020", "45", "20", <>tập tin <b>EXTERNAL.DLL</b> · cluster 06 = 6 · kích thước 00001E00 = 7 680 byte</>],
        ["D0040", "E5", "0F", "mảnh tên dài đã xóa", true],
        ["D0060", "E5", "0F", "mảnh tên dài đã xóa", true],
        ["D0080", "E5", "16", "thư mục đã xóa (SYSTEM~1)", true],
        ["D00A0", "42", "0F", "mảnh tên số 2, mảnh cuối: “k.tpl”"],
        ["D00C0", "01", "0F", "mảnh tên số 1: “Ext Superbloc”"],
        ["D00E0", "45", "20", <>tập tin EXTSUP~1.TPL · cluster 12 = 18 · 00000911 = 2 321 byte. Tên dài: mảnh 1 + mảnh 2 = <b>Ext Superblock.tpl</b></>],
        ["D0100", "54", "10", <>thư mục <b>TMC1</b> · cluster 14 = 20</>],
        ["D0120", "54", "10", <>thư mục <b>TMC2</b> · cluster 19 = 25</>],
        ["D0140", "00", "", "hết bảng"],
      ]} />
      <h3>SDET của TMC1 · cluster 20 → sector 1664 + 18 × 4 = 1736</h3>
      <Exam><SectorDump id="tmc1" sector={1736} /></Exam>
      <RealEntries rows={[
        ["D9000", "2E", "10", "“.”: chính thư mục này", true],
        ["D9020", "2E", "10", "“..”: thư mục cha", true],
        ["D9040", "42", "0F", "mảnh tên số 2, mảnh cuối: “.whs”"],
        ["D9060", "01", "0F", "mảnh tên số 1: “Sample script”"],
        ["D9080", "53", "20", <>tập tin SAMPLE~1.WHS · cluster 15 = 21 · 00000803 = 2 051 byte. Tên dài: <b>Sample script.whs</b></>],
        ["D90A0", "54", "20", <>tập tin <b>TIMEZONE.DAT</b> · cluster 17 = 23 · 00000960 = 2 400 byte</>],
        ["D90C0", "00", "", "hết bảng"],
      ]} />
      <h3>SDET của TMC2 · cluster 25 → sector 1756</h3>
      <Exam><SectorDump id="tmc2" sector={1756} /></Exam>
      <p>Chỉ có “.” và “..”: thư mục rỗng.</p>

      <Final title="Đáp án câu 2b (đề thật)">
        <Tree items={[
          [0, "EXTERNAL.DLL"], [0, "Ext Superblock.tpl"], [0, "TMC1", true],
          [1, "Sample script.whs"], [1, "TIMEZONE.DAT", false, true], [0, "TMC2", true, true],
        ]} />
        <Table
          head={["Tên", "Thuộc tính", n("Kích thước"), "Sector"]}
          rows={[
            ["EXTERNAL.DLL", "20 · A (lưu trữ)", "7 680 B", mono("1680 – 1695")],
            ["Ext Superblock.tpl", "20 · A", "2 321 B", mono("1728 – 1735")],
            [<b>TMC1</b>, "10 · D (thư mục)", "0", mono("1736 – 1739")],
            [sub("Sample script.whs"), "20 · A", "2 051 B", mono("1740 – 1747")],
            [sub("TIMEZONE.DAT"), "20 · A", "2 400 B", mono("1748 – 1755")],
            [<b>TMC2</b>, "10 · D, rỗng", "0", mono("1756 – 1759")],
          ]}
        />
      </Final>
    </Real>
  );
}

export function RealOps() {
  return (
    <Real>
      <Known from="câu 2a, 2b" items={[["FAT1", 38], ["FAT2", 851], ["RDET", 1664], ["TMC1", 1736], ["TMC2", 1756], ["ô trống đầu", "11, 12"]]} />
      <h3>2c · MOVE “Ext Superblock.tpl” vào TMC2</h3>
      <OpQuestion letter="c" command={<>MOVE tập tin “.tpl” vào thư mục TMC2</>} />
      <p>Tập tin có 3 entry (2 mảnh tên + entry chính) ở <code>D00A0</code>–<code>D00FF</code>, đều trong sector 1664: đánh E5. TMC2 thêm 3 entry ngay sau “..”, ở <code>DB840</code>–<code>DB89F</code>: sector 1756.</p>
      <ImpactTable rdet={<b>1664</b>} sdet={<><b>1756</b> (TMC2)</>} />

      <h3>2d · XÓA “Sample script.whs”</h3>
      <OpQuestion letter="d" command={<>XÓA tập tin “.whs”</>} />
      <p>3 entry ở <code>D9040</code>–<code>D909F</code> (TMC1, sector 1736): đánh E5. Ô FAT 21, 22 về 0; byte 4 × 21 = 84 và 4 × 22 = 88 đều nhỏ hơn 512, nên nằm ở sector 38 (FAT1) và 851 (FAT2).</p>
      <ImpactTable fat={<><b>38</b> và <b>851</b></>} sdet={<><b>1736</b> (TMC1)</>} />

      <h3>2e · COPY “TIMEZONE.DAT” vào thư mục gốc</h3>
      <OpQuestion letter="e" command={<>COPY tập tin “.DAT” vào thư mục gốc (RDET)</>} />
      <p>2 400 byte; 1 cluster = 4 × 512 = 2 048 byte, nên cần 2 cluster: lấy 2 ô trống đầu tiên là 11, 12. Ô 11 ghi 12, ô 12 ghi “hết” (sector 38 và 851).</p>
      <Calc>cluster 11 = 1664 + 9 × 4 = 1700 → 1700–1703; cluster 12 → 1704–1707</Calc>
      <p>RDET thêm 1 entry ở chỗ trống <code>D0140</code>: sector 1664. Tên TIMEZONE.DAT vừa 8 + 3 ký tự nên không cần mảnh tên dài.</p>
      <ImpactTable fat={<><b>38</b> và <b>851</b></>} rdet={<b>1664</b>} data={<b>1700 – 1707</b>} />
    </Real>
  );
}
