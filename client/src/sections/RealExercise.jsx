import { Answer, Goal, ImpactTable, KeyPoints, SectionHead, Table } from "../components/Study.jsx";

const mono = (s) => <span className="mono">{s}</span>;
const n = (label) => ({ label, cls: "n" });

export default function RealExercise() {
  return (
    <section id="de-that">
      <SectionHead tag="Đề thật" title="Làm đề thật" />
      <Goal>Mở Baitap_HTTT.pdf và làm lại đúng các bước của đề mini.</Goal>
      <KeyPoints title="Chỉ khác ở các con số">
        <Table
          head={["", "Đề mini", "Đề thật"]}
          rows={[
            ["Sector vùng boot", "6", "38"],
            ["Sector / bảng FAT", "2", "813"],
            ["Data bắt đầu", "10", "38 + 2 × 813 = 1664"],
            ["Sector / cluster", "2", "4"],
            ["FAT1, FAT2", "6, 8", "38, 851"],
          ]}
        />
      </KeyPoints>
      <p className="note">Làm xong từng phần thì mở đáp án tương ứng để đối chiếu.</p>

      <Answer label="Đáp án bài 1">
        <Table
          head={["#", "Khởi động", "Loại", n("Dung lượng")]}
          rows={[
            ["1", "không", "DE · Dell (FAT)", "≈ 47,03 MB"],
            [<span className="hi">2</span>, <span className="hi">có</span>, "07 · NTFS", "≈ 17,58 GB"],
            ["3", "không", "83 · Linux", "≈ 6,84 GB"],
            ["4", "không", "0F · Extended", "≈ 30,02 GB"],
          ]}
        />
      </Answer>
      <Answer label="Đáp án 2a">
        <Table
          head={["Nội dung", n("Giá trị")]}
          rows={[
            ["Loại FAT", "FAT32"], ["Byte / sector", "512"], ["Sector vùng boot", "38"], ["Số bảng FAT", "2"],
            ["Sector / bảng FAT", "813"], ["Dung lượng", "417 627 × 512 B ≈ 203,92 MB"], ["Sector đầu FAT1", "38"],
            ["Sector đầu RDET", "1664"], ["Sector đầu Data", "1664"], ["Sector / cluster", "4"],
          ]}
        />
      </Answer>
      <Answer label="Đáp án 2b">
        <Table
          head={["Tên", "Loại", n("Kích thước"), "Sector"]}
          rows={[
            ["Ext Superblock.tpl", "file", "2 321 B", mono("1728 – 1735")],
            ["EXTERNAL.DLL", "file", "7 680 B", mono("1680 – 1695")],
            [<span className="hi">TMC1</span>, "thư mục", "0", mono("1736 – 1739")],
            ["  Sample script.whs", "file", "2 051 B", mono("1740 – 1747")],
            ["  TIMEZONE.DAT", "file", "2 400 B", mono("1748 – 1755")],
            [<span className="hi">TMC2</span>, "thư mục (rỗng)", "0", mono("1756 – 1759")],
          ]}
        />
      </Answer>
      <Answer label="Đáp án 2c · MOVE “.tpl” vào TMC2">
        <ImpactTable rdet={<b>1664</b>} sdet={<><b>1756</b> (TMC2)</>} />
      </Answer>
      <Answer label="Đáp án 2d · XÓA “.whs”">
        <ImpactTable fat={<><b>38</b> và <b>851</b></>} sdet={<><b>1736</b> (TMC1)</>} />
      </Answer>
      <Answer label="Đáp án 2e · COPY “.DAT” vào thư mục gốc">
        <ImpactTable fat={<><b>38</b> và <b>851</b></>} rdet={<b>1664</b>} data={<b>1700 – 1707</b>} />
      </Answer>
    </section>
  );
}
