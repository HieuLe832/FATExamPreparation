import { useEffect, useState } from "react";
import HexDump from "../components/HexDump.jsx";
import { Answer, Check, Goal, SectionHead, SubStep, SubSteps, Table } from "../components/Study.jsx";
import { fetchHexDump } from "../api/hexDumps.js";
import { parseHex } from "../fat/dumps.js";
import { h2 } from "../fat/annotate.js";

const n = { cls: "n" };
const TABLE_START = 0x1be;
const PARTITION_ROWS = [0, 1, 2, 3].map((p) => [TABLE_START + p * 16, 16]);
const hex3 = (v) => v.toString(16).toUpperCase();

/** The 64-byte partition table split into its 4 rows of 16 bytes, with the real bytes of each row. */
function PartitionSplit() {
  const [dump, setDump] = useState(null);
  useEffect(() => { let alive = true; fetchHexDump("mbr").then((d) => alive && setDump(d)).catch(() => {}); return () => { alive = false; }; }, []);
  const bytes = dump && parseHex(dump.hex);
  return (
    <Table
      head={["Dòng", "Byte", "16 byte của dòng"]}
      rows={PARTITION_ROWS.map(([o], p) => [
        <span className={`band-chip band-${p + 1}`}>Phân vùng {p + 1}</span>,
        <span className="mono">{hex3(o)} – {hex3(o + 15)}</span>,
        <span className="split-bytes">
          {bytes ? Array.from({ length: 16 }, (_, k) => h2(bytes[o - dump.base + k])).join(" ") : "…"}
        </span>,
      ])}
    />
  );
}

// The 6 boxes inside one 16-byte partition row: [offset in row, length, label, meaning, skip?]
const ROW_FIELDS = [
  [0, 1, "+0", "khởi động"], [1, 3, "+1", "bỏ qua", true], [4, 1, "+4", "loại"],
  [5, 3, "+5", "bỏ qua", true], [8, 4, "+8", "sector đầu"], [12, 4, "+C", "số sector"],
];

/** Row 1 of the partition table cut into its 6 boxes, with the real bytes. */
function RowSplit() {
  const [dump, setDump] = useState(null);
  useEffect(() => { let alive = true; fetchHexDump("mbr").then((d) => alive && setDump(d)).catch(() => {}); return () => { alive = false; }; }, []);
  const bytes = dump && parseHex(dump.hex);
  return (
    <div className="tablewrap">
      <div className="rowsplit" role="img" aria-label="Một dòng phân vùng 16 byte chia thành 6 ô: +0 khởi động, +1 bỏ qua, +4 loại, +5 bỏ qua, +8 sector đầu, +C số sector">
        {ROW_FIELDS.map(([o, len, label, meaning, skip]) => (
          <div key={label} className={"rs-cell" + (skip ? " skip" : "")} style={{ flex: len + 1 }}>
            <span className="rs-off">{label} · {len} byte</span>
            <b className="mono">{bytes ? Array.from({ length: len }, (_, k) => h2(bytes[TABLE_START - dump.base + o + k])).join(" ") : "…"}</b>
            <span>{meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Mbr() {
  return (
    <section id="mbr">
      <SectionHead tag="Đề mini · phần 1" title="MBR và phân vùng" />
      <Goal>Ổ có mấy phân vùng, loại gì, dung lượng bao nhiêu, phân vùng nào khởi động.</Goal>
      <SubSteps>
        <SubStep title="MBR gồm 3 phần">
          <p>MBR là sector 0 của ổ cứng, dài 512 byte, luôn chia như sau:</p>
          <div className="tablewrap">
            <div className="layout" role="img" aria-label="MBR: mã khởi động 446 byte (000–1BD), bảng phân vùng 64 byte (1BE–1FD), chữ ký 55 AA 2 byte (1FE–1FF)">
              <div className="l-boot" style={{ flex: 3 }}><b>Mã khởi động · 446 byte</b><span>000 – 1BD</span></div>
              <div className="l-data" style={{ flex: 2 }}><b>Bảng phân vùng · 64 byte</b><span>1BE – 1FD</span></div>
              <div className="l-fat" style={{ flex: 1 }}><b>55 AA · 2 byte</b><span>1FE – 1FF</span></div>
            </div>
          </div>
          <p>446 byte đầu là mã khởi động, nên bảng phân vùng bắt đầu ở byte 446. Đổi ra hex: 446 = <b>1BE</b>.</p>
          <Check q="Kiểm tra: 3 phần cộng lại bằng bao nhiêu?">446 + 64 + 2 = 512 byte, đúng bằng 1 sector</Check>
        </SubStep>
        <SubStep title="Chia 64 byte thành 4 dòng">
          <p>64 byte ÷ 4 phân vùng = <b>16 byte</b> mỗi dòng. 16 viết hex là <code>10</code>, nên dòng sau = dòng trước + <code>10</code>:</p>
          <PartitionSplit />
          <p>Trên hex dump, mỗi dòng phân vùng bắt đầu ở cột <code>E</code> và tràn sang dòng hex kế tiếp (cùng màu với bảng trên). Dòng toàn <code>00</code> = không có phân vùng.</p>
          <HexDump id="mbr" focus={[[TABLE_START, 64]]} bands={PARTITION_ROWS} />
          <Check q="Đề mini có mấy phân vùng?">2 (dòng 1DE và 1EE toàn 00)</Check>
        </SubStep>
        <SubStep title="Chia 1 dòng thành 6 ô">
          <p>Mỗi dòng 16 byte lại chia thành 6 ô. Đây là dòng của phân vùng 1:</p>
          <RowSplit />
          <p>Hai ô “bỏ qua” là địa chỉ kiểu cũ (CHS), đề không hỏi. Chỉ cần 4 ô: <code>+0</code>, <code>+4</code>, <code>+8</code>, <code>+C</code>.</p>
          <Check q="Ô nào cho biết loại phân vùng?">Ô +4 (byte thứ 5 của dòng)</Check>
        </SubStep>
        <SubStep title="Khởi động và loại">
          <Table head={["Byte", "Nghĩa"]} rows={[
            [<code>+0</code>, <><code>80</code> = phân vùng khởi động, <code>00</code> = không</>],
            [<code>+4</code>, <>Loại: <code>07</code> NTFS · <code>83</code> Linux · <code>0B</code>/<code>0C</code> FAT32 · <code>0F</code> Extended</>],
          ]} />
          <HexDump id="mbr" focus={[[0x1be, 1], [0x1c2, 1], [0x1ce, 1], [0x1d2, 1]]} />
          <Check q="Phân vùng nào khởi động?">Phân vùng 1 (byte 1BE = 80), loại 07 = NTFS</Check>
        </SubStep>
        <SubStep title="Vị trí và dung lượng">
          <Table head={["Byte", "Nghĩa"]} rows={[
            [<code>+8</code>, "Sector bắt đầu (4 byte, đọc ngược)"],
            [<code>+C</code>, "Số sector (4 byte, đọc ngược)"],
          ]} />
          <p>Dung lượng = số sector × 512. Phân vùng 1: <code>00 00 20 00</code> → <code>00200000</code> = 2 097 152 sector × 512 = <b>1 GB</b>.</p>
          <HexDump id="mbr" focus={[[0x1c6, 8], [0x1d6, 8]]} />
          <Check q="Phân vùng 2 bao nhiêu?"><code>00 00 10 00</code> → 1 048 576 sector × 512 = 512 MB</Check>
        </SubStep>
      </SubSteps>
      <Answer label="Ghép lại: đáp án phần 1">
        <Table
          head={["#", "Khởi động", "Loại", { label: "Sector đầu", ...n }, { label: "Số sector", ...n }, { label: "Dung lượng", ...n }]}
          rows={[
            [<span className="hi">1</span>, <span className="hi">có (80)</span>, "07 · NTFS", "2 048", "2 097 152", "1 GB"],
            ["2", "không", "83 · Linux", "2 099 200", "1 048 576", "512 MB"],
          ]}
        />
      </Answer>
    </section>
  );
}
