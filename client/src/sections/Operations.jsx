import { Answer, Goal, ImpactTable, KeyPoints, Prereq, SectionHead, SubStep, SubSteps, Table } from "../components/Study.jsx";

export default function Operations() {
  return (
    <section id="ops">
      <SectionHead tag="Đề mini · phần 2c, 2d, 2e" title="Move, Xóa, Copy" />
      <Goal>Biết mỗi lệnh sửa sector nào.</Goal>
      <Prereq links={[["bang-fat", "Bảng FAT"], ["entry", "Một entry 32 byte"]]} />
      <KeyPoints title="Mỗi lệnh sửa gì">
        <Table
          head={["Lệnh", "Bảng FAT", "Thư mục", "Data"]}
          rows={[
            [<b>MOVE</b>, "không đổi", "nguồn: E5 · đích: thêm entry", "không đổi"],
            [<b>XÓA</b>, "các ô của file → 0", "E5", "không đổi"],
            [<b>COPY</b>, "dùng ô trống, ghi chuỗi mới", "đích: thêm entry", "ghi nội dung mới"],
          ]}
        />
        <p>Bảng FAT có 2 bản, nên sửa FAT là sửa cả sector <b>6</b> (FAT1) và <b>8</b> (FAT2).</p>
      </KeyPoints>
      <SubSteps>
        <SubStep title="2c · MOVE HELLO.TXT vào DOCS">
          <p>Entry của HELLO.TXT ở thư mục gốc (sector 10) thành E5. DOCS (sector 16) thêm 1 entry. Nội dung không dời đi.</p>
          <Answer label="Xem đáp án 2c">
            <ImpactTable rdet={<><b>10</b> (entry 1420 → E5)</>} sdet={<><b>16</b> (thêm entry ở 2060)</>} />
          </Answer>
        </SubStep>
        <SubStep title="2d · XÓA NOTE.TXT">
          <p>NOTE.TXT nằm trong DOCS, chiếm các ô FAT 7, 9, 12. Xóa = đánh E5 + đưa các ô đó về 0.</p>
          <Answer label="Xem đáp án 2d">
            <ImpactTable fat={<><b>6</b> và <b>8</b> (ô 7, 9, 12 → 0)</>} sdet={<><b>16</b> (entry 2040 → E5)</>} />
          </Answer>
        </SubStep>
        <SubStep title="2e · COPY “Bai tap.doc” vào DOCS">
          <p>768 byte cần 1 cluster. Ô trống đầu tiên là 6. Tên dài nên cần 2 entry (tên dài + chính).</p>
          <Answer label="Xem đáp án 2e">
            <ImpactTable
              fat={<><b>6</b> và <b>8</b> (ô 6 → hết)</>}
              sdet={<><b>16</b> (thêm 2 entry ở 2060, 2080)</>}
              data={<><b>18 – 19</b> (cluster 6)</>}
            />
          </Answer>
        </SubStep>
      </SubSteps>
    </section>
  );
}
