import HexDump from "../components/HexDump.jsx";
import { Ask, Calc, DiskStrip, Final, Known, Must, PageHead, Recipe, Result, Step, Steps, Table, Traps } from "../components/Study.jsx";
import { RealFat } from "./RealExercise.jsx";

const mono = (s) => <span className="mono">{s}</span>;
const SC = <>S<sub>C</sub></>;
const cell = (k) => [0xc00 + 4 * k, 4]; // FAT1 starts at offset C00 (sector 6)

export default function Fat() {
  return (
    <section>
      <PageHead tag="Câu 2b · phần 1" title="Bảng FAT: tập tin nằm ở những cluster nào" />
      <Ask
        given="Phần đầu bảng FAT1 (đề thật: sector 38)."
        asks="Câu 2b hỏi danh sách sector chứa dữ liệu của từng tập tin, thư mục. Bảng FAT cho biết các cluster đó."
      />
      <DiskStrip on={["fat1", "fat2"]} />

      <h2>Hiểu nhanh</h2>
      <p><b>Bảng FAT</b> là dãy ô 4 byte đánh số 0, 1, 2… <b>Ô số k ghi cluster đứng sau cluster k.</b></p>
      <p>Thư mục chỉ ghi cluster đầu của tập tin. Các cluster sau phải lần theo bảng FAT như một linked list: mỗi ô chỉ tới ô tiếp theo, đến ô ghi “hết” thì dừng.</p>

      <h2>Cách giải</h2>
      <Recipe skip="Ô 0 và ô 1: không ứng với cluster nào, vì cluster đánh số từ 2.">
        <li><Must>Ô k nằm ở byte 4 × k</Must> của bảng. Mỗi dòng dump chứa 4 ô: dòng đầu là ô 0–3, dòng sau là ô 4–7…</li>
        <li>Đọc ngược 4 byte: <Must>00000000 = trống · 0FFFFFFF = hết (cluster cuối) · số khác = cluster tiếp theo</Must>.</li>
        <li>Bắt đầu từ cluster đầu (ghi trong thư mục), đọc ô rồi nhảy tới ô có số vừa đọc, đến khi gặp “hết”.</li>
        <li>Đổi cluster ra sector: <Must>cluster k bắt đầu ở sector Data + (k − 2) × {SC}</Must> và dài {SC} sector.</li>
      </Recipe>

      <h2>Làm mẫu trên đề mini</h2>
      <Known from="câu 2a" items={[[SC, 2], ["Data", 10], ["FAT1", "sector 6, offset C00"]]} />
      <Steps>
        <Step title="Chia bảng thành ô 4 byte">
          <p>Mỗi màu là 1 ô. Dưới dump là giá trị đã đọc ngược của từng ô.</p>
          <HexDump id="fat" list="cells" />
        </Step>
        <Step title="Đọc một ô: ô 7">
          <p>Ô 7 ở byte 4 × 7 = 28 = <code>1C</code> của bảng, tức dòng <code>00000C10</code>, cột C–F.</p>
          <HexDump id="fat" focus={[cell(7)]} />
        </Step>
        <Step title="Đi theo chuỗi bắt đầu từ cluster 7">
          <HexDump id="fat" focus={[cell(7), cell(9), cell(12)]} />
          <Result>Chuỗi: 7 → 9 → 12 → hết. Tập tin này nằm ở 3 cluster rời nhau.</Result>
        </Step>
        <Step title="Đổi cluster ra sector">
          <Calc>cluster 7 = 10 + (7 − 2) × 2 = 20 → sector 20–21</Calc>
          <Calc>cluster 9 = 10 + (9 − 2) × 2 = 24 → sector 24–25</Calc>
          <Calc>cluster 12 = 10 + (12 − 2) × 2 = 30 → sector 30–31</Calc>
        </Step>
      </Steps>
      <Final title="Đáp án đề mini: mọi chuỗi trong bảng">
        <Table
          head={["Cluster đầu", "Chuỗi", "Sector", "Của (xem trang sau)"]}
          rows={[
            ["2", mono("2"), mono("10 – 11"), "RDET"],
            ["3", mono("3 → 4"), mono("12 – 15"), "HELLO.TXT"],
            ["5", mono("5"), mono("16 – 17"), "DOCS"],
            ["7", mono("7 → 9 → 12"), mono("20–21, 24–25, 30–31"), "NOTE.TXT"],
            ["8", mono("8"), mono("22 – 23"), "Bai tap.doc"],
          ]}
        />
        <Result>Ô trống đầu tiên là <b>6</b> (dùng ở câu 2e).</Result>
      </Final>

      <h2>Làm trên đề thật</h2>
      <RealFat />

      <h2>Dễ sai</h2>
      <Traps items={[
        <>Quên cluster đánh số từ 2: phải trừ 2 trong Data + (k − <b>2</b>) × {SC}.</>,
        <>Đọc xuôi ô FAT: <code>09 00 00 00</code> là 9.</>,
        <>Tính sector theo kích thước tập tin. Tập tin luôn chiếm trọn cluster: 1 280 byte vẫn chiếm 2 cluster = 4 sector.</>,
      ]} />
    </section>
  );
}
