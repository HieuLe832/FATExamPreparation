import { Answer, Goal, ImpactTable, KeyPoints, SectionHead, Slide, SlideStrip, Table, Try } from "../components/Study.jsx";

export default function Operations() {
  return (
    <section id="ops">
      <SectionHead tag="Bài tập 2c, 2d, 2e" title="Move, Xóa, Copy" />
      <Goal>Biết mỗi lệnh sửa sector nào.</Goal>
      <SlideStrip>
        <Slide n={67} caption="di chuyển (MOVE)" alt="Trích slide: di chuyển tập tin: tìm entry trống ở thư mục đích, copy entry, xóa entry nguồn" />
        <Slide n={64} caption="xóa (DELETE)" alt="Trích slide: xóa tập tin: đặt E5 vào entry, đặt các phần tử FAT về 0, không đổi nội dung" />
        <Slide n={66} caption="sao chép (COPY)" alt="Trích slide: sao chép tập tin: tìm entry trống, tìm cluster trống, copy entry, ghi FAT và nội dung" />
      </SlideStrip>

      <KeyPoints>
        <Table
          head={["Lệnh", "Bảng FAT", "Thư mục", "Data"]}
          rows={[
            [<b>MOVE</b>, "không đổi", "nguồn: E5 · đích: ghi entry", "không đổi"],
            [<b>XÓA</b>, "các ô của file → 0", "E5", "không đổi"],
            [<b>COPY</b>, "ghi chuỗi mới", "đích: ghi entry", "ghi nội dung mới"],
          ]}
        />
        <p>FAT có 2 bản: sửa FAT là sửa cả sector <b>38</b> (FAT1) và <b>851</b> (FAT2).</p>
      </KeyPoints>

      <h3>c) MOVE “Ext Superblock.tpl” vào TMC2</h3>
      <Try><p>File có 3 entry (2 mảnh tên dài + 1 chính). Chúng ở đâu, và sẽ được ghi vào đâu?</p></Try>
      <Answer label="Xem đáp án câu c">
        <ImpactTable
          rdet={<><b>1664</b> (3 entry → E5)</>}
          sdet={<><b>1756</b> (TMC2: thêm 3 entry)</>}
        />
      </Answer>

      <h3>d) XÓA “Sample script.whs”</h3>
      <Try><p>File ở thư mục nào? Chiếm những ô FAT nào?</p></Try>
      <Answer label="Xem đáp án câu d">
        <ImpactTable
          fat={<><b>38</b> và <b>851</b> (ô 21, 22 → 0)</>}
          sdet={<><b>1736</b> (TMC1: 3 entry → E5)</>}
        />
      </Answer>

      <h3>e) COPY “TIMEZONE.DAT” vào thư mục gốc</h3>
      <Try><p>2400 byte cần mấy cluster? Lấy các ô FAT trống đầu tiên là ô nào?</p></Try>
      <Answer label="Xem đáp án câu e">
        <ImpactTable
          fat={<><b>38</b> và <b>851</b> (ô 11 → 12, ô 12 → hết)</>}
          rdet={<><b>1664</b> (thêm 1 entry, cluster 11)</>}
          data={<><b>1700 – 1707</b> (cluster 11, 12)</>}
        />
      </Answer>
    </section>
  );
}
