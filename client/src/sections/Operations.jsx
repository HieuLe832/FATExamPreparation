import { Ask, Calc, DiskStrip, ImpactTable, Known, Must, PageHead, Recipe, Step, Steps, Table, Traps } from "../components/Study.jsx";
import { RealOps } from "./RealExercise.jsx";

const SC = <>S<sub>C</sub></>;

export default function Operations() {
  return (
    <section>
      <PageHead tag="Câu 2c, 2d, 2e" title="MOVE, XÓA, COPY: vùng nào thay đổi" />
      <Ask
        given="Các dump của câu 2b. Mỗi câu 2c, 2d, 2e làm riêng trên đĩa ban đầu."
        asks="Sau lệnh, mỗi vùng FAT, RDET, SDET, Data có thay đổi không. Không đổi: đánh “x”. Thay đổi: ghi rõ chỉ số sector."
      />
      <DiskStrip on={["fat1", "fat2", "rdet", "sdet", "file"]} />

      <h2>Hiểu nhanh</h2>
      <p>Mỗi lệnh chỉ sửa 3 loại chỗ: <b>entry trong thư mục</b>, <b>ô trong bảng FAT</b>, <b>cluster trong Data</b>. Câu hỏi là các chỗ đó nằm ở sector nào; mọi số cần dùng đã có từ câu 2a và 2b.</p>
      <p className="note">Bốn dòng của bảng đề hỏi: FAT (cả FAT1 và FAT2), RDET (thư mục gốc), SDET (thư mục con), Data (nội dung tập tin).</p>

      <h2>Cách giải</h2>
      <Recipe skip="Nội dung tập tin khi MOVE hay XÓA: không bị chép, không bị xóa.">
        <li>
          Tra xem lệnh sửa những gì:
          <Table className="must-table" head={["Lệnh", "Bảng FAT", "Thư mục chứa tập tin", "Thư mục đích", "Data"]} rows={[
            [<b>MOVE</b>, <Must>không đổi</Must>, <Must>entry → E5</Must>, <Must>thêm entry</Must>, <Must>không đổi</Must>],
            [<b>XÓA</b>, <Must>ô của tập tin → 0</Must>, <Must>entry → E5</Must>, "", <Must>không đổi</Must>],
            [<b>COPY</b>, <Must>ô trống → chuỗi mới</Must>, "không đổi", <Must>thêm entry</Must>, <Must>ghi vào cluster mới</Must>],
          ]} />
        </li>
        <li>
          Đổi mỗi chỗ sửa ra sector:
          <ul>
            <li>Entry ở byte e của bảng thư mục → <Must>sector đầu thư mục + ⌊e ÷ 512⌋</Must>. Bảng ngắn (e &lt; 200 hex) thì chính là sector đầu thư mục.</li>
            <li>Ô FAT k → <Must>FAT1 + ⌊4k ÷ 512⌋ và FAT2 + ⌊4k ÷ 512⌋</Must>: sửa cả 2 bảng. Với k &lt; 128 thì chính là sector FAT1 và FAT2.</li>
            <li>Cluster k → sector Data + (k − 2) × {SC}, như câu 2b.</li>
          </ul>
        </li>
        <li>COPY cần <Must>số cluster = kích thước ÷ ({SC} × 512), làm tròn lên</Must>, lấy các ô trống đầu tiên. Tập tin có tên dài thì mảnh tên cũng được thêm hoặc đánh E5 cùng entry chính.</li>
      </Recipe>

      <h2>Làm mẫu trên đề mini</h2>
      <Known from="câu 2a, 2b" items={[["FAT1", 6], ["FAT2", 8], ["RDET", 10], ["DOCS", 16], ["Data", 10], [SC, 2], ["ô trống đầu", 6]]} />
      <Steps>
        <Step title="2c · MOVE HELLO.TXT vào DOCS">
          <p>Nội dung không di chuyển, chỉ entry đổi chỗ. Entry 1420 ở thư mục gốc đánh E5: sector 10. DOCS thêm entry ở chỗ trống 2060: sector 16.</p>
          <ImpactTable rdet={<><b>10</b> (entry 1420 → E5)</>} sdet={<><b>16</b> (thêm entry ở 2060)</>} />
        </Step>
        <Step title="2d · XÓA NOTE.TXT">
          <p>Entry 2040 trong DOCS đánh E5: sector 16. Ô FAT 7, 9, 12 về 0; byte 28, 36, 48 đều nhỏ hơn 512 nên nằm ở sector 6 (FAT1) và 8 (FAT2).</p>
          <ImpactTable fat={<><b>6</b> và <b>8</b> (ô 7, 9, 12 → 0)</>} sdet={<><b>16</b> (entry 2040 → E5)</>} />
        </Step>
        <Step title="2e · COPY “Bai tap.doc” vào DOCS">
          <Calc>768 byte; 1 cluster = 2 × 512 = 1 024 byte → cần 1 cluster: ô trống đầu tiên là 6</Calc>
          <p>Ô 6 ghi “hết”: sector 6 và 8. Nội dung ghi vào cluster 6 = sector 18–19. DOCS thêm 2 entry (mảnh tên + entry chính) ở 2060, 2080: sector 16.</p>
          <ImpactTable
            fat={<><b>6</b> và <b>8</b> (ô 6 → hết)</>}
            sdet={<><b>16</b> (thêm 2 entry ở 2060, 2080)</>}
            data={<><b>18 – 19</b> (cluster 6)</>}
          />
        </Step>
      </Steps>

      <h2>Làm trên đề thật</h2>
      <RealOps />

      <h2>Dễ sai</h2>
      <Traps items={[
        "Quên FAT2: sửa bảng FAT là sửa cả FAT1 và FAT2.",
        "XÓA không xóa nội dung: vùng Data không đổi.",
        "MOVE trong cùng volume không chép nội dung: bảng FAT và Data không đổi.",
        "Làm câu 2d trên kết quả của 2c. Mỗi câu bắt đầu lại từ đĩa ban đầu.",
        "Quên mảnh tên dài: tập tin “.tpl” có 3 entry, không phải 1.",
      ]} />
    </section>
  );
}
