import HexDump from "../components/HexDump.jsx";
import { Ask, Calc, DiskStrip, Final, Known, Must, PageHead, Recipe, Result, Step, Steps, Table, Traps, Tree as TreeView } from "../components/Study.jsx";
import { RealTree } from "./RealExercise.jsx";

const mono = (s) => <span className="mono">{s}</span>;
const sub = (s) => <span className="sub">{s}</span>;
const n = (label) => ({ label, cls: "n" });
const SC = <>S<sub>C</sub></>;
const ATTRS = [["R", "01", "chỉ đọc"], ["H", "02", "ẩn"], ["S", "04", "hệ thống"], ["V", "08", "tên ổ"], ["D", "10", "thư mục"], ["A", "20", "lưu trữ"]];

export default function Tree() {
  return (
    <section>
      <PageHead tag="Câu 2b · phần 2" title="Thư mục: vẽ cây và đọc từng entry" />
      <Ask
        given="Phần đầu sector của RDET và của từng thư mục con (SDET)."
        asks="b) Vẽ cây thư mục và cho biết thuộc tính trạng thái, kích thước, danh sách các sector chứa dữ liệu của từng tập tin, thư mục."
      />
      <DiskStrip on={["rdet", "sdet"]} />

      <h2>Hiểu nhanh</h2>
      <p>Mỗi thư mục là một bảng, như mục lục. Mỗi dòng của bảng (<b>entry</b>) dài 32 byte, tức 2 dòng hex, mô tả 1 tập tin hoặc thư mục con.</p>
      <p><b>RDET</b> là bảng của thư mục gốc, ở cluster 2. <b>SDET</b> là bảng của một thư mục con, nằm ở cluster ghi trong entry của thư mục đó.</p>
      <div className="dirpair" role="img" aria-label="RDET có HELLO.TXT, Bai tap.doc và thư mục DOCS ở cluster 5; bảng SDET của DOCS ở cluster 5 có ., .. và NOTE.TXT">
        <div className="toc">
          <div className="toc-title">RDET · cluster 2</div>
          <div><span>HELLO.TXT</span><span>cluster 3</span></div>
          <div><span>Bai tap.doc</span><span>cluster 8</span></div>
          <div><span>DOCS (thư mục)</span><span>cluster 5</span></div>
        </div>
        <div className="dirpair-arrow">DOCS ở cluster 5 → mở bảng ở cluster 5</div>
        <div className="toc">
          <div className="toc-title">SDET của DOCS · cluster 5</div>
          <div><span>.</span><span>chính nó</span></div>
          <div><span>..</span><span>thư mục cha</span></div>
          <div><span>NOTE.TXT</span><span>cluster 7</span></div>
        </div>
      </div>

      <h2>Cách giải</h2>
      <Recipe skip={<>Byte 0C–13 và 16–19 của entry chính (ngày giờ); byte 0C–0D của mảnh tên dài (checksum).</>}>
        <li>Chia bảng thành entry 32 byte (2 dòng hex). Byte đầu: <Must>00 = hết bảng</Must>, <Must>E5 = đã xóa, bỏ qua</Must>.</li>
        <li>Byte <Must>0B</Must> cho biết loại: <Must>0F mảnh tên dài · 08 tên ổ (bỏ qua) · 10 thư mục · 20 tập tin</Must>.</li>
        <li>Entry chính: <Must>00–07 tên · 08–0A đuôi · 14–15 và 1A–1B cluster đầu · 1C–1F kích thước</Must>.</li>
        <li>Tên dài: <Must>ghép chữ từ các mảnh nằm ngay trên entry chính, đọc từ dưới lên</Must>. Mỗi chữ 2 byte: <code>42 00</code> = B.</li>
        <li>Lấy chuỗi cluster ở bảng FAT rồi đổi ra sector. Thư mục con: mở SDET ở cluster của nó, <Must>bỏ qua “.” và “..”</Must>, làm lại từ bước 1.</li>
        <li>
          Thuộc tính trạng thái: <Must>byte 0B là tổng các cờ</Must>.
          <div className="tablewrap">
            <table className="t flags">
              <tbody>
                <tr><th>Cờ</th>{ATTRS.map(([c]) => <td key={c}><Must>{c}</Must></td>)}</tr>
                <tr><th>Giá trị</th>{ATTRS.map(([c, v]) => <td key={c} className="mono"><Must>{v}</Must></td>)}</tr>
                <tr><th>Nghĩa</th>{ATTRS.map(([c, , m]) => <td key={c}>{m}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <Calc>20 → A (tập tin thường) · 10 → D (thư mục) · 22 = 20 + 02 → A + H (tập tin ẩn)</Calc>
        </li>
      </Recipe>

      <h2>Làm mẫu trên đề mini</h2>
      <Known from="câu 2a và bảng FAT" items={[["Data", 10], [SC, 2], ["chuỗi", "3 → 4 · 5 · 7 → 9 → 12 · 8"]]} />
      <Steps>
        <Step title="Chia RDET thành entry">
          <p>Mỗi màu là 1 entry. Bảng dưới dump đọc byte đầu và byte 0B của từng entry.</p>
          <HexDump id="rdet" list="entries" />
          <Result>Còn lại 3 mục cho cây: HELLO.TXT, “Bai tap.doc” (mảnh tên 1440 + entry 1460) và thư mục DOCS.</Result>
        </Step>
        <Step title="Đọc một entry chính: HELLO.TXT">
          <HexDump id="rdet" from={0x1420} to={0x1430} focus={[[0x1420, 12], [0x1434, 2], [0x143a, 6]]} />
          <Result>HELLO.TXT · thuộc tính 20 (A) · cluster 3 · 1 280 byte.</Result>
        </Step>
        <Step title="Ghép tên dài">
          <p>Entry 1440 có byte 0B = <code>0F</code>: đó là mảnh tên của entry chính ngay dưới nó (BAITAP~1.DOC).</p>
          <HexDump id="rdet" from={0x1440} to={0x1450} focus={[[0x1440, 12], [0x144e, 12], [0x145c, 4]]} />
          <Result>Tên dài: “Bai tap.doc”. Chỉ có 1 mảnh; tên dài hơn 13 chữ sẽ có nhiều mảnh, xem đề thật.</Result>
        </Step>
        <Step title="Vào thư mục con DOCS">
          <Calc>DOCS ở cluster 5 → sector 10 + (5 − 2) × 2 = 16</Calc>
          <HexDump id="docs" list="entries" />
        </Step>
        <Step title="Tra bảng FAT, đổi ra sector">
          <Table head={["Tên", "Cluster đầu", "Chuỗi (bảng FAT)", "Sector"]} rows={[
            ["HELLO.TXT", "3", mono("3 → 4"), mono("12 – 15")],
            ["Bai tap.doc", "8", mono("8"), mono("22 – 23")],
            ["DOCS", "5", mono("5"), mono("16 – 17")],
            ["NOTE.TXT", "7", mono("7 → 9 → 12"), mono("20–21, 24–25, 30–31")],
          ]} />
        </Step>
      </Steps>
      <Final title="Đáp án đề mini">
        <TreeView items={[[0, "HELLO.TXT"], [0, "Bai tap.doc"], [0, "DOCS", true, true], [1, "NOTE.TXT", false, true, true]]} />
        <Table
          head={["Tên", "Thuộc tính", n("Kích thước"), "Sector"]}
          rows={[
            ["HELLO.TXT", "20 · A (lưu trữ)", "1 280 B", mono("12 – 15")],
            ["Bai tap.doc", "20 · A", "768 B", mono("22 – 23")],
            [<b>DOCS</b>, "10 · D (thư mục)", "0", mono("16 – 17")],
            [sub("NOTE.TXT"), "20 · A", "2 560 B", mono("20–21, 24–25, 30–31")],
          ]}
        />
      </Final>

      <h2>Làm trên đề thật</h2>
      <RealTree />

      <h2>Dễ sai</h2>
      <Traps items={[
        <>Đưa entry đã xóa (byte đầu <code>E5</code>) hoặc tên ổ (0B = <code>08</code>) vào cây.</>,
        <>Coi mảnh tên dài (0B = <code>0F</code>) là một tập tin riêng.</>,
        <>Ghép các mảnh tên từ trên xuống. Mảnh số 1 nằm sát entry chính; đề thật: “Ext Superbloc” + “k.tpl”.</>,
        <>Đọc thuộc tính ở byte 0C. Thuộc tính ở <b>0B</b>; đề thật có byte 0C = <code>18</code>, không liên quan.</>,
        "Lấy kích thước thư mục từ entry: luôn là 0. Sector của thư mục tính từ chuỗi FAT.",
      ]} />
    </section>
  );
}
