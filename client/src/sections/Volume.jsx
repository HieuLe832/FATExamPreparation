import HexDump from "../components/HexDump.jsx";
import { Answer, Check, Goal, Prereq, SectionHead, SubStep, SubSteps, Table } from "../components/Study.jsx";

const mono = (s) => <span className="mono">{s}</span>;
const n = (label) => ({ label, cls: "n" });

export function Boot() {
  return (
    <section id="boot">
      <SectionHead tag="Đề mini · phần 2a" title="Boot sector" />
      <Goal>Đọc 10 thông số của volume.</Goal>
      <Prereq links={[["volume", "Bên trong volume FAT32"], ["boot-sector", "Boot sector"]]} />
      <SubSteps>
        <SubStep title="Đọc các thông số">
          <Table head={["Byte", "Nghĩa"]} rows={[
            [<code>0B</code>, "Số byte / sector"],
            [<code>0D</code>, <>S<sub>C</sub>: số sector / cluster</>],
            [<code>0E</code>, <>S<sub>B</sub>: số sector vùng boot</>],
            [<code>10</code>, <>N<sub>F</sub>: số bảng FAT</>],
            [<code>20</code>, <>S<sub>V</sub>: tổng số sector</>],
            [<code>24</code>, <>S<sub>F</sub>: số sector / bảng FAT</>],
            [<code>2C</code>, "Cluster của thư mục gốc"],
            [<code>52</code>, "Loại FAT (chữ)"],
          ]} />
          <HexDump id="boot" focus={[[0x0b, 2], [0x0d, 1], [0x0e, 2], [0x10, 1], [0x20, 4], [0x24, 4], [0x2c, 4], [0x52, 8]]} />
          <Check q={<>S<sub>B</sub> (byte 0E) = ?</>}><code>06 00</code> → 6</Check>
        </SubStep>
        <SubStep title="Vẽ bản đồ volume">
          <p>Các vùng nằm nối tiếp nhau: Boot (S<sub>B</sub> sector) → FAT1 (S<sub>F</sub>) → FAT2 (S<sub>F</sub>) → Data.</p>
          <div className="formula">Data bắt đầu = S<sub>B</sub> + N<sub>F</sub> × S<sub>F</sub></div>
          <HexDump id="boot" focus={[[0x0e, 2], [0x10, 1], [0x24, 4]]} />
          <Check q="Data bắt đầu ở sector nào?">6 + 2 × 2 = 10</Check>
        </SubStep>
        <SubStep title="Đổi cluster ra sector">
          <div className="formula">Cluster k bắt đầu ở sector Data + (k − 2) × S<sub>C</sub></div>
          <p>Thư mục gốc ở cluster 2 (byte 2C), nên nó bắt đầu ở sector 10.</p>
          <HexDump id="boot" focus={[[0x0d, 1], [0x2c, 4]]} />
          <Check q="Cluster 7 nằm ở sector nào?">10 + (7 − 2) × 2 = 20, tức sector 20–21</Check>
        </SubStep>
      </SubSteps>
      <Answer label="Ghép lại: đáp án phần 2a">
        <Table
          head={["STT", "Nội dung", n("Giá trị")]}
          rows={[
            ["1", "Loại FAT", "FAT32"],
            ["2", "Số byte / sector", "512"],
            ["3", <>Số sector vùng boot (S<sub>B</sub>)</>, "6"],
            ["4", <>Số bảng FAT (N<sub>F</sub>)</>, "2"],
            ["5", <>Số sector / bảng FAT (S<sub>F</sub>)</>, "2"],
            ["6", "Dung lượng", "64 × 512 = 32 KB"],
            ["7", "Sector đầu FAT1", "6"],
            ["8", "Sector đầu thư mục gốc", "10"],
            ["9", "Sector đầu Data", "10"],
            ["10", <>Số sector / cluster (S<sub>C</sub>)</>, "2"],
          ]}
        />
        <div className="tablewrap">
          <div className="layout" role="img" aria-label="Boot 0–5, FAT1 6–7, FAT2 8–9, thư mục gốc 10–11, dữ liệu 12–63">
            <div className="l-boot"><b>Boot</b><span>0 – 5</span></div>
            <div className="l-fat"><b>FAT1</b><span>6 – 7</span></div>
            <div className="l-fat"><b>FAT2</b><span>8 – 9</span></div>
            <div className="l-rdet"><b>Thư mục gốc</b><span>10 – 11</span></div>
            <div className="l-data"><b>Dữ liệu</b><span>12 – 63</span></div>
          </div>
        </div>
      </Answer>
    </section>
  );
}

export function Fat() {
  return (
    <section id="fat">
      <SectionHead tag="Đề mini · phần 2b (1)" title="Bảng FAT" />
      <Goal>Tìm tất cả cluster của một file.</Goal>
      <Prereq links={[["bang-fat", "Bảng FAT"]]} />
      <SubSteps>
        <SubStep title="Ô số k nằm ở đâu">
          <p>Mỗi ô dài 4 byte, nên ô số k nằm ở byte <b>4 × k</b> của bảng.</p>
          <HexDump id="fat" />
          <Check q="Ô số 7 nằm ở đâu?">Byte 28 = <code>1C</code>, tức dòng 00000C10, cột C</Check>
        </SubStep>
        <SubStep title="Đọc một ô">
          <p>Đọc ngược 4 byte. <code>0</code> = trống, <code>0FFFFFFF</code> = hết, số khác = cluster tiếp theo.</p>
          <HexDump id="fat" focus={[[0xc1c, 4]]} />
          <Check q="Ô số 7 ghi gì?"><code>09 00 00 00</code> → 9</Check>
        </SubStep>
        <SubStep title="Đi theo chuỗi">
          <p>Bắt đầu từ cluster đầu, cứ đọc ô rồi nhảy tới, đến khi gặp “hết”.</p>
          <HexDump id="fat" focus={[[0xc1c, 4], [0xc24, 4], [0xc30, 4]]} />
          <Check q="Chuỗi bắt đầu từ 7?">7 → 9 → 12 → hết</Check>
        </SubStep>
      </SubSteps>
      <Answer label="Ghép lại: tất cả chuỗi">
        <Table
          head={["Bắt đầu", "Chuỗi", "Là"]}
          rows={[
            [mono("2"), mono("2"), "Thư mục gốc"],
            [mono("3"), mono("3 → 4"), "HELLO.TXT"],
            [mono("5"), mono("5"), "DOCS"],
            [mono("7"), mono("7 → 9 → 12"), "NOTE.TXT"],
            [mono("8"), mono("8"), "Bai tap.doc"],
          ]}
        />
        <p>Ô trống đầu tiên: <b>6</b> (dùng ở câu 2e).</p>
      </Answer>
    </section>
  );
}

export function Directories() {
  return (
    <section id="dir">
      <SectionHead tag="Đề mini · phần 2b (2)" title="Thư mục và cây" />
      <Goal>Vẽ cây thư mục, ghi cluster và sector của từng file.</Goal>
      <Prereq links={[["thu-muc", "Thư mục: RDET, SDET"], ["entry", "Một entry 32 byte"]]} />
      <SubSteps>
        <SubStep title="Chia thành từng entry">
          <p>Mỗi file chiếm 1 entry = 32 byte = <b>2 dòng</b>. Byte đầu <code>00</code> = hết bảng, <code>E5</code> = đã xóa (bỏ qua).</p>
          <HexDump id="rdet" focus={[0x1400, 0x1420, 0x1440, 0x1460, 0x1480, 0x14a0, 0x14c0].map((o) => [o, 1])} />
          <Check q="Entry nào đã bị xóa?">Entry ở 14A0 (OLD.TXT)</Check>
        </SubStep>
        <SubStep title="Entry này là gì">
          <p>Xem byte <code>0B</code>: <code>20</code> = file, <code>10</code> = thư mục, <code>0F</code> = mảnh tên dài, <code>08</code> = tên ổ.</p>
          <HexDump id="rdet" focus={[0x140b, 0x142b, 0x144b, 0x146b, 0x148b, 0x14ab].map((o) => [o, 1])} />
          <Check q="Entry ở 1480 là gì?">Byte 0B = 10 → thư mục DOCS</Check>
        </SubStep>
        <SubStep title="Ghép tên dài">
          <p>Entry <code>0F</code> nằm ngay trên entry chính. Chữ nằm ở các byte xen kẽ <code>00</code>: <code>42 00 61 00</code> = “Ba”.</p>
          <HexDump id="rdet" from={0x1440} to={0x1470} focus={[[0x1440, 32]]} />
          <Check q="Tên dài ở 1440 là gì?">Bai tap.doc</Check>
        </SubStep>
        <SubStep title="Cluster, kích thước, sector">
          <p>Cluster ở byte <code>1A</code> (2 byte), kích thước ở <code>1C</code> (4 byte). Tra bảng FAT rồi đổi ra sector.</p>
          <HexDump id="rdet" from={0x1420} to={0x1430} focus={[[0x1420, 11], [0x143a, 2], [0x143c, 4]]} />
          <Check q="HELLO.TXT?">Cluster 3 → 4, 1280 byte, sector 12–15</Check>
        </SubStep>
        <SubStep title="Vào thư mục con">
          <p>DOCS ở cluster 5 → sector 16. Bảng của nó luôn mở đầu bằng “.” và “..”, bỏ qua 2 dòng này.</p>
          <HexDump id="docs" focus={[[0x2040, 11], [0x205a, 2], [0x205c, 4]]} />
          <Check q="NOTE.TXT?">Cluster 7 → 9 → 12, 2560 byte, sector 20–21, 24–25, 30–31</Check>
        </SubStep>
      </SubSteps>
      <Answer label="Ghép lại: đáp án phần 2b">
        <pre className="tree">
          <span className="m">{"\\  (thư mục gốc)"}</span>
          {"\n├── HELLO.TXT\n├── Bai tap.doc\n└── "}<span className="d">DOCS</span>
          {"\n    └── NOTE.TXT"}
        </pre>
        <Table
          head={["Tên", "Loại", n("Kích thước"), "Cluster", "Sector"]}
          rows={[
            ["HELLO.TXT", "file (20)", "1 280 B", mono("3, 4"), mono("12 – 15")],
            ["Bai tap.doc", "file (20)", "768 B", mono("8"), mono("22 – 23")],
            [<span className="hi">DOCS</span>, "thư mục (10)", "0", mono("5"), mono("16 – 17")],
            ["  NOTE.TXT", "file (20)", "2 560 B", mono("7, 9, 12"), mono("20–21, 24–25, 30–31")],
          ]}
        />
        <p>Không tính: MINI (tên ổ) và OLD.TXT (đã xóa).</p>
      </Answer>
    </section>
  );
}
