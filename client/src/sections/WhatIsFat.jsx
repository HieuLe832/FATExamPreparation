import { Check, DiskMap, Goal, KeyPoints, SectionHead, SubStep, SubSteps } from "../components/Study.jsx";

// Clusters 2–13 of the mini disk, with what the FAT says comes next.
const CELLS = [
  { k: 2, label: "thư mục gốc", next: "hết", cls: "dir" },
  { k: 3, label: "HELLO", next: "→ 4", cls: "hello" },
  { k: 4, label: "HELLO", next: "hết", cls: "hello" },
  { k: 5, label: "DOCS", next: "hết", cls: "dir" },
  { k: 6, label: "trống", next: "0" },
  { k: 7, label: "NOTE", next: "→ 9", cls: "note" },
  { k: 8, label: "Bai tap", next: "hết", cls: "doc" },
  { k: 9, label: "NOTE", next: "→ 12", cls: "note" },
  { k: 10, label: "trống", next: "0" },
  { k: 11, label: "trống", next: "0" },
  { k: 12, label: "NOTE", next: "hết", cls: "note" },
  { k: 13, label: "trống", next: "0" },
];

export default function WhatIsFat() {
  return (
    <section id="fat-la-gi">
      <SectionHead tag="Kiến thức nền" title="FAT là gì?" />
      <Goal>Hiểu FAT tìm một file như thế nào.</Goal>
      <SubSteps>
        <SubStep title="Sector và cluster">
          <p>Ổ đĩa được chia thành các ô 512 byte gọi là <b>sector</b>. Vài sector liền nhau gộp thành một <b>cluster</b>; file được cất theo từng cluster.</p>
        </SubStep>
        <SubStep title="Thư mục là mục lục">
          <p>Giống mục lục sách: mỗi dòng ghi <b>tên file</b> và <b>cluster đầu tiên</b> của file.</p>
          <div className="toc" aria-label="Ví dụ mục lục">
            <div><span>HELLO.TXT</span><span>cluster 3</span></div>
            <div><span>Bai tap.doc</span><span>cluster 8</span></div>
            <div><span>DOCS (thư mục)</span><span>cluster 5</span></div>
          </div>
        </SubStep>
        <SubStep title="Bảng FAT là một linked list">
          <p>
            Mục lục chỉ cho biết cluster <i>đầu tiên</i>; các cluster sau ghi trong <b>bảng FAT</b>, ô số k ghi “sau
            cluster k là cluster nào”. Lần theo từng ô như truy tìm kho báu, đến ô ghi “hết” thì dừng.
          </p>
          <DiskMap cells={CELLS} />
          <p className="note">Dòng dưới mỗi ô là giá trị bảng FAT ghi cho ô đó. NOTE.TXT (nằm trong DOCS, viền xanh) bị rải rác: 7 → 9 → 12.</p>
          <Check q="NOTE.TXT nằm ở những cluster nào?">7, 9, 12 (bảng FAT: 7 → 9 → 12 → hết)</Check>
        </SubStep>
      </SubSteps>
      <KeyPoints title="Đọc một file gồm 3 bước">
        <ol>
          <li>Tra <b>mục lục</b> (thư mục) → lấy cluster đầu.</li>
          <li>Đi theo <b>linked list</b> trong bảng FAT → lấy tất cả cluster.</li>
          <li>Đổi cluster ra <b>sector</b>.</li>
        </ol>
      </KeyPoints>
    </section>
  );
}
