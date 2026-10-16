import { DiskMap, DiskStrip, Layout, PageHead, Table } from "../components/Study.jsx";

// Clusters 2–7 of the mini disk: what each holds and which sectors it covers (data starts at 10, 2 sectors each).
const CLUSTERS = [
  { k: "cluster 2", label: "RDET", next: "sector 10–11", cls: "dir" },
  { k: "cluster 3", label: "HELLO.TXT", next: "sector 12–13", cls: "file" },
  { k: "cluster 4", label: "HELLO.TXT", next: "sector 14–15", cls: "file" },
  { k: "cluster 5", label: "SDET của DOCS", next: "sector 16–17", cls: "dir" },
  { k: "cluster 6", label: "trống", next: "sector 18–19", cls: "free" },
  { k: "cluster 7", label: "NOTE.TXT", next: "sector 20–21", cls: "file" },
];

// Reading one file of the mini disk: the four places, in order.
const PATH = [
  ["Boot sector", "2a", "Vùng Data bắt đầu ở sector 10, mỗi cluster có 2 sector."],
  ["RDET (thư mục gốc)", "2b", "Như mục lục: dòng HELLO.TXT ghi cluster đầu là 3."],
  ["Bảng FAT", "2b", "Như linked list: ô 3 ghi 4, ô 4 ghi “hết”. HELLO.TXT nằm ở cluster 3, 4."],
  ["Vùng Data", "2b", "Cluster 3, 4 là sector 12–15: đây là nội dung HELLO.TXT."],
];

export default function DiskOverview() {
  return (
    <section>
      <PageHead
        tag="Nền tảng"
        title="Ổ đĩa được chia thế nào"
        lead="Mỗi câu trong đề đọc một phần của ổ đĩa. Dưới mỗi phần là câu hỏi dùng đến nó."
      />
      <DiskStrip on={["mbr", "boot", "fat1", "fat2", "rdet", "sdet", "file"]} showQ />

      <h2>1. Ổ cứng chia thành phân vùng</h2>
      <p>Ổ cứng có thể chia thành tối đa 4 <b>phân vùng</b>, như ổ C và ổ D. <b>MBR</b> là sector 0 của ổ cứng, chứa danh sách các phân vùng.</p>
      <Layout label="Ổ cứng: MBR ở sector 0, sau đó là phân vùng 1 và phân vùng 2" parts={[
        { label: "MBR", sub: "sector 0", cls: "l-boot" },
        { label: "Phân vùng 1", sub: "ví dụ NTFS (ổ C)", cls: "l-data", flex: 4 },
        { label: "Phân vùng 2", sub: "ví dụ FAT32 (ổ D)", cls: "l-rdet", flex: 3 },
      ]} />
      <p className="note">Câu 1 đọc MBR.</p>

      <h2>2. Một phân vùng FAT32 gồm 4 vùng</h2>
      <p>Phân vùng đã định dạng gọi là <b>volume</b>. Trong bài 2, sector được đánh số từ đầu volume: boot sector là sector 0.</p>
      <Layout label="Volume FAT32: Boot sector, FAT1, FAT2, Data" parts={[
        { label: "Boot sector", cls: "l-boot" },
        { label: "FAT1", cls: "l-fat" },
        { label: "FAT2", cls: "l-fat" },
        { label: "Data", sub: "thư mục và nội dung file", cls: "l-data", flex: 4 },
      ]} />
      <Table head={["Vùng", "Chứa gì", "Câu"]} rows={[
        [<b>Boot sector</b>, "Kích thước các vùng. Từ đó tính ra mỗi vùng bắt đầu ở đâu", "2a"],
        [<b>FAT1, FAT2</b>, "Bảng ghi mỗi tập tin nằm ở những cluster nào. FAT2 là bản sao của FAT1", "2b, 2d, 2e"],
        [<b>Data</b>, "Các bảng thư mục (RDET, SDET) và nội dung tập tin", "2b–2e"],
      ]} />

      <h2>3. Vùng Data chia thành cluster</h2>
      <p><b>Cluster</b> là vài sector liền nhau; tập tin được cấp chỗ theo từng cluster. Cluster đánh số <b>từ 2</b>, và cluster 2 chứa thư mục gốc (RDET).</p>
      <DiskMap label="Vùng Data của đề mini: cluster 2 là RDET, cluster 3 và 4 là HELLO.TXT" cells={CLUSTERS} />
      <p className="note">Đề mini: mỗi cluster 2 sector, vùng Data bắt đầu ở sector 10.</p>

      <h2>4. Tìm một tập tin: đi qua 4 chỗ</h2>
      <ol className="path">
        {PATH.map(([where, q, what]) => (
          <li key={where}>
            <div className="path-head"><b>{where}</b><span>câu {q}</span></div>
            <p>{what}</p>
          </li>
        ))}
      </ol>
      <p>MOVE, XÓA, COPY (câu 2c–e) sửa đúng các chỗ 2, 3, 4: dòng trong thư mục, ô trong bảng FAT, cluster trong Data.</p>
    </section>
  );
}
