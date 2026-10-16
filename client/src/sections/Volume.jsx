import HexDump from "../components/HexDump.jsx";
import { Answer, Example, Goal, KeyPoints, SectionHead, Slide, SlideStrip, Table, Try } from "../components/Study.jsx";

const mono = (s) => <span className="mono">{s}</span>;
const n = (label) => ({ label, cls: "n" });

export function Boot() {
  return (
    <section id="boot">
      <SectionHead tag="Bài tập 2a" title="Boot sector" />
      <Goal>Điền bảng 10 thông số của câu a.</Goal>
      <SlideStrip>
        <Slide n={48} caption="Boot Sector của FAT32" alt="Trích slide: bảng các trường của Boot Sector FAT32 theo offset" />
        <Slide n={45} caption="các vùng của FAT"
          alt="Trích slide: FAT gồm vùng hệ thống (boot sector, bảng FAT, bảng thư mục gốc) và vùng dữ liệu" />
        <Slide n={57} caption="công thức cluster → sector"
          alt="Trích slide: cluster đánh số từ 2; sector i = SB + SF*NF + SRDET + (k-2)*Sc" />
      </SlideStrip>

      <KeyPoints title="Đọc ở sector 0">
        <Table
          head={["Byte", "Nghĩa"]}
          rows={[
            [mono("0B"), "Số byte / sector"],
            [mono("0D"), <>S<sub>C</sub>: số sector / cluster</>],
            [mono("0E"), <>S<sub>B</sub>: số sector vùng boot</>],
            [mono("10"), <>N<sub>F</sub>: số bảng FAT</>],
            [mono("20"), <>S<sub>V</sub>: tổng số sector của volume</>],
            [mono("24"), <>S<sub>F</sub>: số sector / bảng FAT</>],
            [mono("2C"), "Cluster của thư mục gốc (RDET)"],
            [mono("52"), "Loại FAT (chữ, đọc xuôi)"],
          ]}
        />
      </KeyPoints>
      <KeyPoints title="Rồi tính">
        <div className="formula">
          FAT1 bắt đầu = S<sub>B</sub><br />
          Data bắt đầu = S<sub>B</sub> + N<sub>F</sub> × S<sub>F</sub><br />
          Cluster k = Data + (k − 2) × S<sub>C</sub>
        </div>
      </KeyPoints>

      <HexDump id="boot" />

      <Example title="Đọc S_B ở byte 0E">
        <ol>
          <li>Dòng <code>00000000</code>, cột <code>E</code>–<code>F</code>: <code>26 00</code>.</li>
          <li>Đọc ngược: <code>0026</code> = 2 × 16 + 6 = <b>38</b>.</li>
        </ol>
      </Example>
      <Try><p>Đọc các byte còn lại trong bảng trên, rồi tính vị trí FAT1, Data, RDET.</p></Try>
      <Answer label="Xem đáp án câu a">
        <Table
          head={["STT", "Nội dung", n("Giá trị")]}
          rows={[
            ["1", "Loại FAT", "FAT32"],
            ["2", "Số byte / sector", "512"],
            ["3", <>Số sector vùng boot (S<sub>B</sub>)</>, "38"],
            ["4", <>Số bảng FAT (N<sub>F</sub>)</>, "2"],
            ["5", <>Số sector / bảng FAT (S<sub>F</sub>)</>, "813"],
            ["6", "Dung lượng", "417 627 × 512 B ≈ 203,92 MB"],
            ["7", "Sector đầu FAT1", "38"],
            ["8", "Sector đầu RDET", "1664 (cluster 2)"],
            ["9", "Sector đầu Data", "38 + 2 × 813 = 1664"],
            ["10", <>Số sector / cluster (S<sub>C</sub>)</>, "4"],
          ]}
        />
        <div className="tablewrap">
          <div className="layout" role="img" aria-label="Boot 0–37, FAT1 38–850, FAT2 851–1663, RDET 1664–1667, dữ liệu sau đó">
            <div className="l-boot"><b>Boot</b><span>0 – 37</span></div>
            <div className="l-fat"><b>FAT1</b><span>38 – 850</span></div>
            <div className="l-fat"><b>FAT2</b><span>851 – 1663</span></div>
            <div className="l-rdet"><b>RDET</b><span>1664 – 1667</span></div>
            <div className="l-data"><b>Dữ liệu</b><span>1668 – …</span></div>
          </div>
        </div>
      </Answer>
    </section>
  );
}

export function Fat() {
  return (
    <section id="fat">
      <SectionHead tag="Bài tập 2b · phần 1" title="Bảng FAT" />
      <Goal>Tìm các cluster của một file.</Goal>
      <SlideStrip>
        <Slide n={54} caption="giá trị trong bảng FAT" alt="Trích slide: giá trị phần tử FAT: 0 trống, 0FFFFFF7 hư, 0FFFFFFF EOF" />
        <Slide n={55} caption="đọc phần tử FAT" alt="Trích slide: đọc phần tử FAT32 theo nhóm 4 byte, đảo thứ tự byte" />
        <Slide n={53} caption="bảng FAT là danh sách liên kết"
          alt="Trích slide: bảng FAT lưu vị trí tập tin theo kiểu danh sách liên kết; FAT32 mỗi phần tử 4 byte" />
      </SlideStrip>

      <KeyPoints>
        <ul>
          <li>Mỗi ô = 4 byte. Ô số k nằm ở byte <b>4 × k</b>.</li>
          <li>Giá trị trong ô = cluster tiếp theo. <code>0FFFFFFF</code> = hết. <code>0</code> = trống.</li>
        </ul>
      </KeyPoints>

      <HexDump id="fat" />

      <Example title="Đi từ cluster 6">
        <ol>
          <li>Ô 6 ở byte 24 (<code>0x18</code>): <code>07 00 00 00</code> → 7.</li>
          <li>Ô 7 → 8. Ô 8 → 9. Ô 9: <code>FF FF FF 0F</code> → hết.</li>
        </ol>
        <p>Kết quả: <b>6 → 7 → 8 → 9</b>.</p>
      </Example>
      <Try><p>Làm tương tự với 18, 20, 21, 23, 25. Ô trống đầu tiên là ô nào?</p></Try>
      <Answer label="Xem đáp án">
        <Table
          head={["Bắt đầu", "Chuỗi", "Là file"]}
          rows={[
            [mono("6"), mono("6 → 7 → 8 → 9"), "EXTERNAL.DLL"],
            [mono("18"), mono("18 → 19"), "Ext Superblock.tpl"],
            [mono("20"), mono("20"), "TMC1"],
            [mono("21"), mono("21 → 22"), "Sample script.whs"],
            [mono("23"), mono("23 → 24"), "TIMEZONE.DAT"],
            [mono("25"), mono("25"), "TMC2"],
          ]}
        />
        <p>Ô trống đầu tiên: <b>11</b> (dùng ở câu e). Cluster 3, 4, 5, 10 không thuộc file nào còn sống, bỏ qua.</p>
      </Answer>
    </section>
  );
}

const LEGEND = [
  ["--f-name", "tên"], ["--f-lfn", "tên dài"], ["--f-attr", "thuộc tính"], ["--f-clus", "cluster"],
  ["--f-size", "kích thước"], ["--f-del", "đã xóa"],
];

export function Directories() {
  return (
    <section id="dir">
      <SectionHead tag="Bài tập 2b · phần 2" title="Thư mục và cây" />
      <Goal>Vẽ cây thư mục và ghi thông tin từng file (câu b).</Goal>
      <SlideStrip>
        <Slide n={51} caption="entry chính" alt="Trích slide: các trường của entry chính và 8 bit thuộc tính" />
        <Slide n={49} caption="bảng thư mục gốc (RDET)"
          alt="Trích slide: RDET gồm các entry 32 byte; byte đầu 0 là trống, E5 là đã xóa; entry chính và entry phụ" />
        <Slide n={52} caption="entry phụ (tên dài)" alt="Trích slide: các trường của entry phụ (tên dài)" />
        <Slide n={59} caption="thư mục con (SDET)"
          alt="Trích slide: cấu trúc bảng thư mục con với . , .. , entry phụ N..1 rồi entry chính" />
      </SlideStrip>

      <KeyPoints>
        <ul>
          <li>1 entry = 32 byte = <b>2 dòng</b> hex.</li>
          <li>Byte đầu: <code>00</code> = hết bảng, <code>E5</code> = đã xóa (bỏ qua).</li>
          <li>Byte <code>0B</code>: <code>20</code> = file, <code>10</code> = thư mục, <code>0F</code> = mảnh tên dài, <code>08</code> = tên ổ.</li>
          <li>Cluster ở byte <code>1A</code> (2 byte), kích thước ở <code>1C</code> (4 byte).</li>
        </ul>
        <p className="note">Tên dài: các dòng <code>0F</code> nằm ngay trên entry chính, ghép từ dưới lên.</p>
      </KeyPoints>

      <div className="legend" aria-label="Chú thích màu">
        {LEGEND.map(([token, label]) => <span key={token}><i style={{ background: `var(${token})` }} />{label}</span>)}
      </div>
      <HexDump id="rdet" />

      <Example title="Entry EXTERNAL.DLL (dòng D0020–D0030)">
        <ol>
          <li>Byte <code>0B</code> = <code>20</code> → file.</li>
          <li>Tên: “EXTERNAL” + “DLL” → <b>EXTERNAL.DLL</b>.</li>
          <li>Byte <code>1A</code> = <code>06 00</code> → cluster <b>6</b>.</li>
          <li>Byte <code>1C</code> = <code>00 1E 00 00</code> → <code>1E00</code> = <b>7680 byte</b>.</li>
          <li>FAT: 6 → 9. Sector: 1664 + (6 − 2) × 4 = <b>1680</b> đến <b>1695</b>.</li>
        </ol>
      </Example>
      <Try><p>Làm các entry còn lại trong sector 1664, rồi 2 thư mục con bên dưới.</p></Try>

      <HexDump id="tmc1" />
      <HexDump id="tmc2" />

      <Answer label="Xem đáp án câu b">
        <pre className="tree">
          <span className="m">{"\\  (thư mục gốc)"}</span>
          {"\n├── Ext Superblock.tpl\n├── EXTERNAL.DLL\n├── "}<span className="d">TMC1</span>
          {"\n│   ├── Sample script.whs\n│   └── TIMEZONE.DAT\n└── "}<span className="d">TMC2</span>{"   "}
          <span className="m">(rỗng)</span>
        </pre>
        <Table
          head={["Tên", "Thuộc tính", n("Kích thước"), "Cluster", "Sector"]}
          rows={[
            ["Ext Superblock.tpl", "20 · file", "2 321 B", mono("18, 19"), mono("1728 – 1735")],
            ["EXTERNAL.DLL", "20 · file", "7 680 B", mono("6 – 9"), mono("1680 – 1695")],
            [<span className="hi">TMC1</span>, "10 · thư mục", "0", mono("20"), mono("1736 – 1739")],
            ["  Sample script.whs", "20 · file", "2 051 B", mono("21, 22"), mono("1740 – 1747")],
            ["  TIMEZONE.DAT", "20 · file", "2 400 B", mono("23, 24"), mono("1748 – 1755")],
            [<span className="hi">TMC2</span>, "10 · thư mục", "0", mono("25"), mono("1756 – 1759")],
          ]}
        />
        <p>Không tính: <code>NEW VOLUME</code> (tên ổ) và <code>System Volume Information</code> (đã xóa, <code>E5</code>).</p>
      </Answer>
    </section>
  );
}
