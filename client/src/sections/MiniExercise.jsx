import { Goal, SectionHead, Table } from "../components/Study.jsx";

export default function MiniExercise() {
  return (
    <section id="de-mini">
      <SectionHead tag="Đề mini" title="Đề mini hỏi gì" />
      <Goal>Biết đề mini hỏi gì và mỗi phần học ở đâu.</Goal>
      <p className="lead">
        Đề mini có cùng dạng câu hỏi với Baitap_HTTT, nhưng đĩa nhỏ và số tròn. Đề gồm 6 phần, mỗi bài sau giải một
        phần.
      </p>
      <Table
        head={["Phần", "Đề mini hỏi", "Học ở bài"]}
        rows={[
          ["1", "Ổ có mấy phân vùng, loại gì, dung lượng bao nhiêu, phân vùng nào khởi động?", <a href="#mbr">MBR</a>],
          ["2a", "Đọc 10 thông số của volume FAT32", <a href="#boot">Boot sector</a>],
          ["2b", "Vẽ cây thư mục; mỗi file nằm ở cluster nào, sector nào?", <><a href="#fat">Bảng FAT</a>, <a href="#dir">Thư mục</a></>],
          ["2c", "MOVE HELLO.TXT vào thư mục DOCS", <a href="#ops">Move, Xóa, Copy</a>],
          ["2d", "XÓA NOTE.TXT", <a href="#ops">Move, Xóa, Copy</a>],
          ["2e", "COPY “Bai tap.doc” vào DOCS", <a href="#ops">Move, Xóa, Copy</a>],
        ]}
      />
      <p className="note">Mỗi câu 2c, 2d, 2e làm riêng trên đĩa ban đầu.</p>
    </section>
  );
}
