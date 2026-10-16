import HexDump from "../components/HexDump.jsx";
import { Answer, Example, SectionHead, Slide, SlideStrip, Table, Try } from "../components/Study.jsx";

const mono = (s) => <span className="mono">{s}</span>;
const n = (label) => ({ label, cls: "n" });

export function Boot() {
  return (
    <section id="boot">
      <SectionHead tag="Bài tập 2a" title="Boot sector FAT32 và vị trí các vùng" />
      <Slide n={45} caption="giới thiệu hệ thống tập tin FAT"
        alt="Trích slide: FAT gồm vùng hệ thống (boot sector, bảng FAT, bảng thư mục gốc) và vùng dữ liệu" />
      <div className="prose">
        <p>
          Volume FAT xếp các vùng theo thứ tự: <b>vùng Boot sector</b> (S<sub>B</sub> sector) → <b>FAT1</b> (S<sub>F</sub>{" "}
          sector) → <b>FAT2</b> (bản sao, S<sub>F</sub> sector) → <b>vùng dữ liệu</b>. Với FAT32, bảng thư mục gốc (RDET){" "}
          <b>không</b> nằm riêng mà nằm trong vùng dữ liệu, tại cluster ghi ở offset <code>2C</code>.
        </p>
        <p>Mọi thông số đều đọc từ sector 0. Các dòng in xanh trong bảng dưới là những trường bạn cần.</p>
      </div>
      <Slide n={48} narrow caption="Boot Sector của FAT32" alt="Trích slide: bảng các trường của Boot Sector FAT32 theo offset" />
      <Slide n={57} caption="vùng dữ liệu và công thức cluster → sector"
        alt="Trích slide: cluster đánh số từ 2; sector i = SB + SF*NF + SRDET + (k-2)*Sc" />
      <div className="formula">
        sector đầu FAT1 = S<sub>B</sub><br />
        sector đầu Data = S<sub>B</sub> + N<sub>F</sub>·S<sub>F</sub>{" "}
        <span style={{ color: "var(--muted)" }}>(FAT32: S<sub>RDET</sub> = 0)</span><br />
        sector của cluster k = Data + (k − 2)·S<sub>C</sub><br />
        sector đầu RDET = sector của cluster ghi ở offset 2C<br />
        dung lượng = S<sub>V</sub> × số byte/sector
      </div>

      <HexDump id="boot" />

      <Example title="Đọc S_B ở offset 0E">
        <ol>
          <li>Bảng slide ghi S<sub>B</sub> ở offset <code>E</code>, dài 2 byte.</li>
          <li>
            Tìm trên ảnh: dòng <code>00000000</code>, cột <code>E</code> và <code>F</code> là <code>26 00</code>.
          </li>
          <li>Đảo thứ tự byte: <code>00 26</code> → <code>0x0026</code>.</li>
          <li>Đổi ra thập phân: 2 × 16 + 6 = <b>38</b>. Vùng Boot sector dài 38 sector, nên bảng FAT1 bắt đầu ở sector 38.</li>
        </ol>
        <p>Byte ở cột <code>D</code> ngay cạnh đó là <code>04</code>: chỉ 1 byte nên không cần đảo, S<sub>C</sub> = 4.</p>
      </Example>
      <Try>
        <p>
          Đọc tiếp các offset <code>0B</code>, <code>10</code>, <code>20</code>, <code>24</code>, <code>2C</code>,{" "}
          <code>52</code> theo đúng cách trên, rồi điền bảng 10 dòng của câu a bằng các công thức. Đối chiếu: sector bạn
          tính cho RDET phải trùng một trong các sector đề cho.
        </p>
      </Try>
      <Answer label="Xem đáp án câu a">
        <Table
          head={["STT", "Nội dung", "Đọc từ", n("Giá trị")]}
          rows={[
            ["1", "Loại FAT", mono('52: "FAT32   "'), "FAT32"],
            ["2", "Số byte cho 1 sector", mono("0B: 00 02"), "512"],
            ["3", <>Số sector vùng Bootsector (S<sub>B</sub>)</>, mono("0E: 26 00"), "38"],
            ["4", <>Số lượng bảng FAT (N<sub>F</sub>)</>, mono("10: 02"), "2"],
            ["5", <>Số sector cho 1 bảng FAT (S<sub>F</sub>)</>, mono("24: 2D 03 00 00"), "813"],
            ["6", "Dung lượng đĩa", mono("20: 5B 5F 06 00"), "417 627 sector × 512 = 213 825 024 B ≈ 203,92 MB"],
            ["7", "Sector đầu tiên của bảng FAT1", <>= S<sub>B</sub></>, "38"],
            ["8", "Sector đầu tiên của bảng RDET", mono("2C: cluster 2"), "1664"],
            ["9", "Sector đầu tiên của vùng Data", "38 + 2 × 813", "1664"],
            ["10", <>Số sector cho 1 cluster (S<sub>C</sub>)</>, mono("0D: 04"), "4"],
          ]}
        />
        <div className="tablewrap">
          <div className="layout" role="img" aria-label="Sơ đồ volume: boot 0–37, FAT1 38–850, FAT2 851–1663, RDET cluster 2 tại 1664, dữ liệu sau đó">
            <div className="l-boot"><b>Boot</b><span>0 – 37</span></div>
            <div className="l-fat"><b>FAT1</b><span>38 – 850</span></div>
            <div className="l-fat"><b>FAT2</b><span>851 – 1663</span></div>
            <div className="l-rdet"><b>RDET</b><span>cl. 2 · 1664–1667</span></div>
            <div className="l-data"><b>Dữ liệu (cluster 3, 4, …)</b><span>1668 – 417 626</span></div>
          </div>
        </div>
        <p>
          Kiểm tra với đề: sector 38 có offset <code>0x4C00</code> (= 38 × 512) và bắt đầu bằng <code>F8 FF FF 0F</code>,
          đúng là đầu bảng FAT. Sector 1664 bắt đầu bằng nhãn “NEW VOLUME”, đúng là RDET.
        </p>
      </Answer>
    </section>
  );
}

export function Fat() {
  return (
    <section id="fat">
      <SectionHead tag="Bài tập 2b · phần 1" title="Bảng FAT: chuỗi cluster" />
      <SlideStrip>
        <Slide n={53} caption="Bảng FAT (1/2)"
          alt="Trích slide: bảng FAT lưu vị trí tập tin theo kiểu danh sách liên kết; FAT32 mỗi phần tử 4 byte" />
        <Slide n={54} caption="Bảng FAT (2/2)" alt="Trích slide: giá trị phần tử FAT: 0 trống, 0FFFFFF7 hư, 0FFFFFFF EOF" />
        <Slide n={55} caption="truy xuất phần tử FAT" alt="Trích slide: đọc phần tử FAT32 theo nhóm 4 byte, đảo thứ tự byte" />
      </SlideStrip>
      <div className="prose">
        <p>
          Sector 38 là sector đầu của FAT1, nên byte đầu dump chính là phần tử 0. FAT32 dùng 4 byte cho mỗi phần tử: phần
          tử k nằm ở byte <code>4k</code> của bảng. Đảo byte để đọc giá trị, rồi bỏ 4 bit cao.
        </p>
        <ul>
          <li><code>00000000</code>: cluster trống.</li>
          <li><code>0FFFFFFF</code> (từ <code>0FFFFFF8</code> trở lên): EOF, cluster cuối của tập tin.</li>
          <li>Giá trị khác: chỉ số cluster kế tiếp. Phần tử k = 7 nghĩa là “sau cluster k là cluster 7”.</li>
          <li>Phần tử 0 và 1 không dùng (cluster đánh số từ 2).</li>
        </ul>
      </div>

      <HexDump id="fat" />

      <Example title="Đi theo chuỗi bắt đầu từ cluster 6">
        <ol>
          <li>Phần tử 6 nằm ở byte 6 × 4 = 24 = <code>0x18</code>, tức dòng <code>4C10</code>, cột 8 đến B: <code>07 00 00 00</code>.</li>
          <li>Đảo thứ tự: <code>00000007</code> = 7. Vậy sau cluster 6 là cluster 7.</li>
          <li>Phần tử 7 ở byte <code>0x1C</code>: <code>08 00 00 00</code> → 8. Phần tử 8 ở byte <code>0x20</code>: <code>09 00 00 00</code> → 9.</li>
          <li>Phần tử 9 ở byte <code>0x24</code>: <code>FF FF FF 0F</code> → <code>0FFFFFFF</code> = EOF. Dừng.</li>
        </ol>
        <p>Chuỗi: <b>6 → 7 → 8 → 9 → hết</b>, tức 4 cluster.</p>
      </Example>
      <Try>
        <p>
          Làm tương tự với các chuỗi bắt đầu ở 18, 20, 21, 23, 25. Sau đó tìm phần tử đầu tiên (từ phần tử 2 trở đi) có
          giá trị <code>00000000</code>: đó là cluster trống đầu tiên, bạn sẽ cần nó ở câu e.
        </p>
      </Try>
      <Answer label="Xem các chuỗi cluster">
        <Table
          head={["Bắt đầu", "Chuỗi", n("Số cluster"), "Thuộc về (xem phần sau)"]}
          rows={[
            [mono("2"), mono("2 → EOF"), "1", "RDET"],
            [mono("3, 4, 5"), mono("mỗi cái → EOF"), "1", "3: thư mục đã xóa SYSTEM~1; 4, 5: không có entry nào trong dump trỏ tới"],
            [mono("6"), mono("6 → 7 → 8 → 9 → EOF"), "4", "EXTERNAL.DLL"],
            [mono("10"), mono("10 → EOF"), "1", "không có entry nào trong dump trỏ tới"],
            [mono("11 – 17"), mono("0 (trống)"), "—", <>trống. <b>Cluster trống đầu tiên là 11</b></>],
            [mono("18"), mono("18 → 19 → EOF"), "2", "Ext Superblock.tpl"],
            [mono("20"), mono("20 → EOF"), "1", "TMC1"],
            [mono("21"), mono("21 → 22 → EOF"), "2", "Sample script.whs"],
            [mono("23"), mono("23 → 24 → EOF"), "2", "TIMEZONE.DAT"],
            [mono("25"), mono("25 → EOF"), "1", "TMC2"],
            [mono("26 –"), mono("0 (trống)"), "—", "trống"],
          ]}
        />
      </Answer>
    </section>
  );
}

const LEGEND = [
  ["--f-name", "tên"], ["--f-lfn", "ký tự tên dài"], ["--f-attr", "thuộc tính"], ["--f-clus", "cluster"],
  ["--f-size", "kích thước"], ["--f-num", "số thứ tự entry phụ"], ["--f-del", "E5 đã xóa"],
];

export function Directories() {
  return (
    <section id="dir">
      <SectionHead tag="Bài tập 2b · phần 2" title="RDET, SDET và cây thư mục" />
      <SlideStrip>
        <Slide n={49} caption="bảng thư mục gốc (RDET)"
          alt="Trích slide: RDET gồm các entry 32 byte; byte đầu 0 là trống, E5 là đã xóa; entry chính và entry phụ" />
        <Slide n={51} caption="entry chính" alt="Trích slide: các trường của entry chính và 8 bit thuộc tính" />
        <Slide n={52} caption="entry phụ" alt="Trích slide: các trường của entry phụ (tên dài)" />
        <Slide n={58} caption="bảng thư mục con (SDET)"
          alt="Trích slide: SDET nằm trên vùng dữ liệu, cấu trúc giống RDET, luôn có entry . và .." />
        <Slide n={59} caption="cấu trúc bảng thư mục con"
          alt="Trích slide: cấu trúc bảng thư mục con với . , .. , entry phụ N..1 rồi entry chính" />
      </SlideStrip>
      <div className="prose">
        <p>Cách đọc từng entry 32 byte:</p>
        <ol>
          <li><b>Byte 0:</b> <code>00</code> là entry trống (từ đây trở đi bảng hết), <code>E5</code> là đã xóa, còn lại là đang dùng.</li>
          <li>
            <b>Byte <code>0B</code> (thuộc tính):</b> <code>0F</code> là entry phụ chứa tên dài. <code>10</code> là thư mục,{" "}
            <code>20</code> là tập tin (bit Archive), <code>08</code> là nhãn volume. Bit: <code>0 0 A D V S H R</code>.
          </li>
          <li>
            <b>Entry phụ</b> nằm ngay phía trên entry chính của nó, xếp ngược: entry phụ số <code>01</code> sát entry chính
            nhất. Entry phụ cuối có byte 0 = <code>4N</code> (N là số entry phụ). Tên là UTF-16: mỗi ký tự 2 byte, dừng ở{" "}
            <code>00 00</code>, <code>FF FF</code> là phần đệm.
          </li>
          <li>
            <b>Cluster bắt đầu</b> = word cao ở <code>14</code> ghép word thấp ở <code>1A</code>. <b>Kích thước</b> ở{" "}
            <code>1C</code> (4 byte). Thư mục có kích thước 0, độ dài của nó lấy từ chuỗi FAT.
          </li>
          <li>Có cluster đầu → tra chuỗi FAT → đổi từng cluster ra sector bằng công thức ở bước 2a.</li>
        </ol>
      </div>

      <div className="legend" aria-label="Chú thích màu">
        {LEGEND.map(([token, label]) => <span key={token}><i style={{ background: `var(${token})` }} />{label}</span>)}
      </div>
      <HexDump id="rdet" />
      <HexDump id="tmc1" />
      <HexDump id="tmc2" />

      <Example title="Entry EXTERNAL.DLL (dòng D0020 và D0030)">
        <p>Một entry = 32 byte = 2 dòng của ảnh hex. Entry thứ hai của sector 1664 là:</p>
        <p className="step">45 58 54 45 52 4E 41 4C 44 4C 4C 20 18 AC 34 69<br />4A 59 4A 59 00 00 A0 08 61 35 06 00 00 1E 00 00</p>
        <ol>
          <li>Byte 0 = <code>45</code>, không phải <code>00</code> hay <code>E5</code> → entry đang dùng.</li>
          <li>Byte <code>0B</code> (byte thứ 12 của dòng đầu) = <code>20</code>, không phải <code>0F</code> → entry chính, bit A bật → tập tin.</li>
          <li>Byte 0–7 = “EXTERNAL”, byte 8–A = “DLL” (đọc xuôi theo cột chữ bên phải) → tên <b>EXTERNAL.DLL</b>.</li>
          <li>Cluster: word cao ở <code>14</code> = <code>00 00</code>, word thấp ở <code>1A</code> = <code>06 00</code> → cluster <b>6</b>.</li>
          <li>Kích thước ở <code>1C</code> = <code>00 1E 00 00</code> → đảo: <code>00001E00</code> = <b>7680 byte</b>.</li>
          <li>Tra bảng FAT: 6 → 7 → 8 → 9 → hết. Đổi sector: cluster 6 = 1664 + (6 − 2) × 4 = 1680, cluster 9 kết thúc ở 1695 → <b>sector 1680–1695</b>.</li>
        </ol>
      </Example>
      <Try>
        <ol>
          <li>Trong sector 1664, chia thành từng entry 32 byte (2 dòng một entry). Gạch các entry <code>E5</code> và nhãn volume.</li>
          <li>Ghép tên dài của tập tin <code>EXTSUP~1.TPL</code> từ 2 entry phụ phía trên nó.</li>
          <li>Hai thư mục TMC1, TMC2 có cluster bao nhiêu? Đổi ra sector và so với 1736, 1756 trong đề.</li>
          <li>Với mỗi tập tin: thuộc tính, kích thước, danh sách sector.</li>
        </ol>
      </Try>
      <Answer label="Xem đáp án câu b">
        <pre className="tree">
          <span className="m">{"\\  (RDET · cluster 2 · sector 1664–1667)"}</span>
          {"\n├── Ext Superblock.tpl\n├── EXTERNAL.DLL\n├── "}<span className="d">TMC1</span>
          {"\n│   ├── Sample script.whs\n│   └── TIMEZONE.DAT\n└── "}<span className="d">TMC2</span>{"   "}
          <span className="m">(rỗng)</span>
        </pre>
        <Table
          head={["Tên", "Tên ngắn", "Thuộc tính", n("Kích thước"), "Cluster", "Sector"]}
          rows={[
            ["Ext Superblock.tpl", mono("EXTSUP~1.TPL"), <><code>20</code> Archive</>, "2 321 B", mono("18, 19"), mono("1728 – 1735")],
            ["EXTERNAL.DLL", mono("EXTERNAL.DLL"), <><code>20</code> Archive</>, "7 680 B", mono("6, 7, 8, 9"), mono("1680 – 1695")],
            [<span className="hi">TMC1</span>, mono("TMC1"), <><code>10</code> Directory</>, "0 (thư mục)", mono("20"), mono("1736 – 1739")],
            ["  Sample script.whs", mono("SAMPLE~1.WHS"), <><code>20</code> Archive</>, "2 051 B", mono("21, 22"), mono("1740 – 1747")],
            ["  TIMEZONE.DAT", mono("TIMEZONE.DAT"), <><code>20</code> Archive</>, "2 400 B", mono("23, 24"), mono("1748 – 1755")],
            [<span className="hi">TMC2</span>, mono("TMC2"), <><code>10</code> Directory</>, "0 (thư mục)", mono("25"), mono("1756 – 1759")],
          ]}
        />
        <p>
          Kiểm tra số cluster: một cluster = 4 × 512 = 2048 byte. 7680 B cần 4 cluster, 2321 / 2051 / 2400 B cần 2
          cluster, khớp với chuỗi FAT.
        </p>
        <p>
          Không đưa vào cây: <code>NEW VOLUME</code> (thuộc tính <code>08</code>, nhãn volume) và{" "}
          <code>System Volume Information</code> (3 entry bắt đầu bằng <code>E5</code>, thuộc tính <code>16</code> = D + S
          + H, cluster 3): đã bị xóa.
        </p>
      </Answer>
    </section>
  );
}
