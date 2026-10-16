import HexDump from "../components/HexDump.jsx";
import { Answer, Check, Goal, SectionHead, SubStep, SubSteps, Table } from "../components/Study.jsx";

const n = { cls: "n" };

export default function Mbr() {
  return (
    <section id="mbr">
      <SectionHead tag="Đề mini · phần 1" title="MBR và phân vùng" />
      <Goal>Ổ có mấy phân vùng, loại gì, dung lượng bao nhiêu, phân vùng nào khởi động.</Goal>
      <HexDump id="mbr" />
      <SubSteps>
        <SubStep title="Tìm bảng phân vùng">
          <p>MBR là sector 0 của ổ cứng. Bảng phân vùng có 4 dòng, mỗi dòng 16 byte, bắt đầu ở <code>1BE</code>, <code>1CE</code>, <code>1DE</code>, <code>1EE</code>. Dòng toàn <code>00</code> = không có phân vùng.</p>
          <Check q="Đề mini có mấy phân vùng?">2 (dòng 1DE và 1EE toàn 00)</Check>
        </SubStep>
        <SubStep title="Khởi động và loại">
          <Table head={["Byte", "Nghĩa"]} rows={[
            [<code>+0</code>, <><code>80</code> = phân vùng khởi động, <code>00</code> = không</>],
            [<code>+4</code>, <>Loại: <code>07</code> NTFS · <code>83</code> Linux · <code>0B</code>/<code>0C</code> FAT32 · <code>0F</code> Extended</>],
          ]} />
          <Check q="Phân vùng nào khởi động?">Phân vùng 1 (byte 1BE = 80), loại 07 = NTFS</Check>
        </SubStep>
        <SubStep title="Vị trí và dung lượng">
          <Table head={["Byte", "Nghĩa"]} rows={[
            [<code>+8</code>, "Sector bắt đầu (4 byte, đọc ngược)"],
            [<code>+C</code>, "Số sector (4 byte, đọc ngược)"],
          ]} />
          <p>Dung lượng = số sector × 512. Phân vùng 1: <code>00 00 20 00</code> → <code>00200000</code> = 2 097 152 sector × 512 = <b>1 GB</b>.</p>
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
