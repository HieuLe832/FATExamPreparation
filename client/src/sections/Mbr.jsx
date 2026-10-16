import HexDump from "../components/HexDump.jsx";
import { Answer, Check, Goal, SectionHead, SubStep, SubSteps, Table } from "../components/Study.jsx";

const n = { cls: "n" };

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
        <SubStep title="Tìm 4 dòng phân vùng">
          <p>Bảng có 4 dòng, mỗi dòng 16 byte. 16 viết hex là <code>10</code>, nên mỗi dòng sau cộng thêm <code>10</code>: <code>1BE</code> → <code>1CE</code> → <code>1DE</code> → <code>1EE</code>.</p>
          <p>Trên hex dump, <code>1BE</code> = dòng <code>1B0</code>, cột <code>E</code>, nên mỗi dòng phân vùng bắt đầu ở cuối một dòng hex. Dòng toàn <code>00</code> = không có phân vùng.</p>
          <HexDump id="mbr" focus={[[0x1be, 64]]} />
          <Check q="Đề mini có mấy phân vùng?">2 (dòng 1DE và 1EE toàn 00)</Check>
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
