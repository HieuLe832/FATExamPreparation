import HexDump, { useDump } from "../components/HexDump.jsx";
import { Ask, DiskStrip, Final, Layout, Must, PageHead, Recipe, Result, Step, Steps, Table, Traps } from "../components/Study.jsx";
import { RealMbr } from "./RealExercise.jsx";
import { parseHex } from "../fat/dumps.js";
import { h2, hp } from "../fat/annotate.js";

const TABLE_START = 0x1be;
const PARTITION_ROWS = [0, 1, 2, 3].map((p) => [TABLE_START + p * 16, 16]);

/** Reads bytes [offset, offset + len) of the mini MBR dump, or "…" while it loads. */
function useMbrBytes() {
  const s = useDump("mbr");
  if (s.status !== "ready") return () => "…";
  const bytes = parseHex(s.dump.hex);
  return (o, len) => Array.from({ length: len }, (_, k) => h2(bytes[o - s.dump.base + k])).join(" ");
}

/** The 64-byte partition table split into its 4 rows of 16 bytes. */
function PartitionSplit() {
  const read = useMbrBytes();
  return (
    <Table
      head={["Dòng", "Byte", "16 byte của dòng"]}
      rows={PARTITION_ROWS.map(([o], p) => [
        <span className={`band-chip band-${p + 1}`}>Phân vùng {p + 1}</span>,
        <span className="mono">{hp(o)} – {hp(o + 15)}</span>,
        <span className="split-bytes">{read(o, 16)}</span>,
      ])}
    />
  );
}

// The 6 boxes inside one 16-byte partition row: [offset in row, length, label, meaning, skip?]
const ROW_FIELDS = [
  [0, 1, "+0", "khởi động"], [1, 3, "+1", "bỏ qua", true], [4, 1, "+4", "loại"],
  [5, 3, "+5", "bỏ qua", true], [8, 4, "+8", "sector đầu"], [12, 4, "+C", "số sector"],
];

/** Row 1 of the partition table cut into its 6 boxes. */
function RowSplit() {
  const read = useMbrBytes();
  return (
    <div className="tablewrap">
      <div className="rowsplit" role="img" aria-label="Một dòng 16 byte chia thành 6 ô: +0 khởi động, +1 bỏ qua, +4 loại, +5 bỏ qua, +8 sector đầu, +C số sector">
        {ROW_FIELDS.map(([o, len, label, meaning, skip]) => (
          <div key={label} className={"rs-cell" + (skip ? " skip" : "")} style={{ flex: len + 1 }}>
            <span className="rs-off">{label} · {len} byte</span>
            <b className="mono">{read(TABLE_START + o, len)}</b>
            <span>{meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Mbr() {
  return (
    <section>
      <PageHead tag="Câu 1" title="MBR và phân vùng" />
      <Ask
        given="Sector 0 của ổ cứng (Master boot sector)."
        asks="Ổ cứng chia làm mấy phân vùng, loại và dung lượng từng phân vùng. Phân vùng nào là phân vùng khởi động?"
      />
      <DiskStrip on={["mbr"]} />

      <h2>Hiểu nhanh</h2>
      <p><b>MBR</b> là sector 0 của ổ cứng, dài 512 byte. Đề chỉ cần 64 byte <b>bảng phân vùng</b> ở gần cuối sector.</p>
      <Layout label="MBR: mã khởi động 446 byte (000–1BD), bảng phân vùng 64 byte (1BE–1FD), chữ ký 55 AA (1FE–1FF)" parts={[
        { label: "Mã khởi động · 446 byte", sub: "000 – 1BD · bỏ qua", cls: "l-skip", flex: 3 },
        { label: "Bảng phân vùng · 64 byte", sub: "1BE – 1FD", cls: "l-data", flex: 2 },
        { label: "55 AA", sub: "bỏ qua", cls: "l-skip", flex: 1 },
      ]} />
      <p>Bảng gồm 4 dòng 16 byte, mỗi dòng mô tả 1 phân vùng. Bảng bắt đầu ở byte 446, viết hex là <code>1BE</code>.</p>

      <h2>Cách giải</h2>
      <Recipe skip={<>446 byte mã khởi động, các byte +1 đến +3 và +5 đến +7 (địa chỉ CHS kiểu cũ), chữ ký 55 AA. Ô +8 (sector đầu) đề mẫu không hỏi.</>}>
        <li>Tìm 4 dòng ở <Must>1BE, 1CE, 1DE, 1EE</Must>. <Must>Dòng toàn 00 là không có phân vùng</Must>; đếm các dòng còn lại.</li>
        <li>Mỗi dòng đọc 3 ô: <Must>+0 khởi động (80 = có)</Must>, <Must>+4 loại</Must>, <Must>+C số sector (4 byte, đọc ngược)</Must>.</li>
        <li>Mã loại: <Must>07 NTFS · 0B, 0C FAT32 · 83 Linux · 05, 0F Extended</Must>.</li>
        <li><Must>Dung lượng = số sector × 512</Must> byte, rồi chia 1024 lần lượt ra KB, MB, GB.</li>
      </Recipe>

      <h2>Làm mẫu trên đề mini</h2>
      <Steps>
        <Step title="Tìm 4 dòng của bảng">
          <p>Mỗi dòng bắt đầu ở cột <code>E</code> và tràn sang dòng hex kế tiếp (cùng màu), vì 1BE kết thúc bằng E.</p>
          <HexDump id="mbr" bands={PARTITION_ROWS} />
          <PartitionSplit />
          <Result>Dòng 1BE và 1CE có dữ liệu, 1DE và 1EE toàn 00: <b>2 phân vùng</b>.</Result>
        </Step>
        <Step title="Cắt mỗi dòng thành các ô">
          <p>Đây là dòng của phân vùng 1. Hai ô xám không cần đọc.</p>
          <RowSplit />
        </Step>
        <Step title="Đọc ô +0, +4, +C của 2 dòng">
          <HexDump id="mbr" focus={[[0x1be, 1], [0x1c2, 1], [0x1ca, 4], [0x1ce, 1], [0x1d2, 1], [0x1da, 4]]} />
          <Result>Dung lượng phân vùng 1: 2 097 152 × 512 = 1 073 741 824 byte; ÷ 1024 ÷ 1024 ÷ 1024 = <b>1 GB</b>.</Result>
        </Step>
      </Steps>
      <Final title="Đáp án đề mini">
        <Table
          head={["Phân vùng", "Khởi động", "Loại", { label: "Số sector", cls: "n" }, { label: "Dung lượng", cls: "n" }]}
          rows={[
            [<span className="hi">1</span>, <span className="hi">có (80)</span>, "07 · NTFS", "2 097 152", "1 GB"],
            ["2", "không (00)", "83 · Linux", "1 048 576", "512 MB"],
          ]}
        />
        <p>Ổ chia làm 2 phân vùng; phân vùng 1 là phân vùng khởi động.</p>
      </Final>

      <h2>Làm trên đề thật</h2>
      <RealMbr />

      <h2>Dễ sai</h2>
      <Traps items={[
        <>Quên đảo byte ở ô +C: <code>00 00 20 00</code> là <code>00200000</code>, không phải <code>00002000</code>.</>,
        "Quên nhân 512: số sector chưa phải dung lượng.",
        "Đếm cả dòng toàn 00 là một phân vùng.",
      ]} />
    </section>
  );
}
