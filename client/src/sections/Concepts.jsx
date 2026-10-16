// "Kiến thức nền": one short page per part of the disk, answering what it is, what it is for and what it
// looks like. Examples here are generic (README.TXT, PHOTOS…) so they don't give away the mini exercise.
import HexDump from "../components/HexDump.jsx";
import { Check, DiskMap, Goal, KeyPoints, SectionHead, Table } from "../components/Study.jsx";

const TAG = "Kiến thức nền";

export function DiskConcept() {
  return (
    <section id="o-cung">
      <SectionHead tag={TAG} title="Ổ cứng, MBR và phân vùng" />
      <Goal>Biết phân vùng là gì và MBR ghi những gì.</Goal>

      <h3>Phân vùng</h3>
      <p>Một ổ cứng có thể chia thành vài phần riêng, gọi là <b>phân vùng</b>, giống ổ C và ổ D trong Windows. Mỗi phân vùng dùng một hệ thống tập tin riêng: NTFS, FAT32, Linux…</p>
      <div className="tablewrap">
        <div className="layout" role="img" aria-label="Ổ cứng: MBR ở sector 0, sau đó là phân vùng 1 và phân vùng 2">
          <div className="l-boot" style={{ flex: 1 }}><b>MBR</b><span>sector 0</span></div>
          <div className="l-data" style={{ flex: 4 }}><b>Phân vùng 1</b><span>NTFS (ổ C)</span></div>
          <div className="l-rdet" style={{ flex: 3 }}><b>Phân vùng 2</b><span>FAT32 (ổ D)</span></div>
        </div>
      </div>

      <h3>MBR</h3>
      <p><b>MBR</b> là sector đầu tiên của ổ cứng (sector 0). Nó chứa <b>bảng phân vùng</b> gồm <b>4 dòng</b>, mỗi dòng mô tả 1 phân vùng.</p>
      <KeyPoints title="Mỗi dòng ghi 4 thông tin">
        <Table head={["Thông tin", "Để biết"]} rows={[
          ["Khởi động", "Máy khởi động từ phân vùng nào (gọi là phân vùng “active”)"],
          ["Loại", "Phân vùng dùng hệ thống tập tin gì: NTFS, FAT32, Linux…"],
          ["Sector bắt đầu", "Phân vùng nằm từ đâu trên ổ"],
          ["Số sector", "Phân vùng dài bao nhiêu. Dung lượng = số sector × 512 byte"],
        ]} />
      </KeyPoints>
      <p className="note">Một phân vùng đã định dạng gọi là một <b>volume</b>. Bài 2 nhìn vào bên trong một volume FAT32.</p>
      <Check q="Bảng trong MBR có tối đa mấy phân vùng?">4, vì bảng chỉ có 4 dòng</Check>
    </section>
  );
}

export function VolumeConcept() {
  return (
    <section id="volume">
      <SectionHead tag={TAG} title="Bên trong một volume FAT32" />
      <Goal>Biết volume FAT32 có những vùng nào, mỗi vùng để làm gì.</Goal>
      <p>Một volume FAT32 luôn gồm 4 vùng, nối tiếp nhau theo đúng thứ tự này:</p>
      <div className="tablewrap">
        <div className="layout" role="img" aria-label="Volume FAT32: Boot sector, FAT1, FAT2, Data">
          <div className="l-boot" style={{ flex: 1 }}><b>Boot sector</b><span>thông số</span></div>
          <div className="l-fat" style={{ flex: 1 }}><b>FAT1</b><span>bảng FAT</span></div>
          <div className="l-fat" style={{ flex: 1 }}><b>FAT2</b><span>bản sao</span></div>
          <div className="l-data" style={{ flex: 4 }}><b>Data</b><span>nội dung file và thư mục</span></div>
        </div>
      </div>
      <Table head={["Vùng", "Để làm gì"]} rows={[
        [<b>Boot sector</b>, "Ghi các thông số của volume"],
        [<b>FAT1</b>, "Ghi mỗi file nằm ở những cluster nào"],
        [<b>FAT2</b>, "Bản sao của FAT1, dùng khi FAT1 hỏng"],
        [<b>Data</b>, "Chứa nội dung file và các bảng thư mục"],
      ]} />

      <h3>Vùng Data chia thành cluster</h3>
      <p>Vùng Data được chia thành các <b>cluster</b> bằng nhau, đánh số <b>từ 2</b> (không có cluster 0 và 1). Thư mục gốc thường nằm ở cluster 2.</p>
      <DiskMap label="Vùng Data: cluster 2 là thư mục gốc, các cluster sau chứa file và thư mục con" cells={[
        { k: "cluster 2", label: "thư mục gốc", next: "", cls: "dir" },
        { k: "cluster 3", label: "file", next: "", cls: "hello" },
        { k: "cluster 4", label: "file", next: "", cls: "hello" },
        { k: "cluster 5", label: "thư mục con", next: "", cls: "dir" },
        { k: "cluster 6", label: "trống", next: "", cls: "free" },
        { k: "cluster 7", label: "file", next: "", cls: "doc" },
        { k: "…", label: "…", next: "" },
      ]} />
      <Check q="Vì sao có 2 bảng FAT?">FAT2 là bản sao dự phòng. Khi bảng FAT thay đổi thì cả hai cùng được sửa.</Check>
    </section>
  );
}

export function BootConcept() {
  return (
    <section id="boot-sector">
      <SectionHead tag={TAG} title="Boot sector" />
      <Goal>Biết boot sector chứa gì và vì sao cần nó.</Goal>
      <p><b>Boot sector</b> là sector đầu tiên của volume. Nó ghi các con số mô tả volume. Nhờ các số này mới tính được bảng FAT, thư mục gốc và từng cluster nằm ở đâu.</p>
      <KeyPoints title="Những số quan trọng">
        <Table head={["Thông số", "Ý nghĩa"]} rows={[
          ["Số byte / sector", "Thường là 512"],
          [<>S<sub>C</sub>: số sector / cluster</>, "1 cluster gồm mấy sector"],
          [<>S<sub>B</sub>: số sector vùng boot</>, "Vùng boot dài bao nhiêu; FAT1 bắt đầu ngay sau nó"],
          [<>N<sub>F</sub>: số bảng FAT</>, "Thường là 2"],
          [<>S<sub>F</sub>: số sector / bảng FAT</>, "Mỗi bảng FAT dài bao nhiêu"],
          [<>S<sub>V</sub>: tổng số sector</>, "Kích thước cả volume"],
          ["Cluster thư mục gốc", "Thư mục gốc bắt đầu ở cluster nào"],
          ["Loại FAT", "Chữ “FAT32”"],
        ]} />
      </KeyPoints>
      <h3>Trong hex dump</h3>
      <p>Nhìn cột chữ bên phải: có chữ “MSDOS5.0” ở dòng đầu và “FAT32” ở dòng <code>50</code>. Đó là dấu hiệu nhận ra boot sector FAT32. Hai byte cuối sector luôn là <code>55 AA</code>.</p>
      <HexDump id="boot" focus={[[0x03, 8], [0x52, 8]]} />
      <Check q="Muốn tính vùng Data bắt đầu ở đâu cần những số nào?">S<sub>B</sub>, N<sub>F</sub> và S<sub>F</sub> (Data = S<sub>B</sub> + N<sub>F</sub> × S<sub>F</sub>)</Check>
    </section>
  );
}

const FAT_CELLS = [
  { k: "ô 0", label: "dự trữ", next: "", cls: "rsv" },
  { k: "ô 1", label: "dự trữ", next: "", cls: "rsv" },
  { k: "ô 2", label: "thư mục gốc", next: "hết", cls: "eof" },
  { k: "ô 3", label: "file A", next: "→ 4", cls: "next" },
  { k: "ô 4", label: "file A", next: "→ 5", cls: "next" },
  { k: "ô 5", label: "file A", next: "hết", cls: "eof" },
  { k: "ô 6", label: "", next: "trống", cls: "free" },
  { k: "ô 7", label: "file B", next: "→ 9", cls: "next" },
  { k: "ô 8", label: "", next: "trống", cls: "free" },
  { k: "ô 9", label: "file B", next: "hết", cls: "eof" },
];

export function FatConcept() {
  return (
    <section id="bang-fat">
      <SectionHead tag={TAG} title="Bảng FAT" />
      <Goal>Biết bảng FAT trông ra sao và mỗi ô nghĩa là gì.</Goal>
      <p><b>Bảng FAT</b> là một dãy ô đánh số 0, 1, 2… Ô số k nói về cluster số k: sau cluster k là cluster nào. Với FAT32, mỗi ô dài 4 byte.</p>
      <DiskMap cells={FAT_CELLS} label="Ví dụ bảng FAT: file A ở ô 3, 4, 5; file B ở ô 7 và 9" />
      <p className="note">File A chiếm 3 → 4 → 5. File B chiếm 7 → 9, nhảy qua ô 8 đang trống.</p>
      <KeyPoints title="Giá trị trong một ô">
        <Table head={["Giá trị", "Nghĩa"]} rows={[
          [<code>0</code>, "Cluster trống"],
          ["Một số: 2, 3, 4…", "Cluster tiếp theo của file"],
          [<code>0FFFFFFF</code>, "Hết: đây là cluster cuối của file (EOF)"],
          [<code>0FFFFFF7</code>, "Cluster bị hỏng"],
        ]} />
        <ul>
          <li>Ô 0 và ô 1 không dùng cho file, vì cluster đánh số từ 2.</li>
          <li>Volume có 2 bảng FAT giống hệt nhau (FAT1, FAT2).</li>
        </ul>
      </KeyPoints>
      <h3>Trong hex dump</h3>
      <p>Trong hex dump, cứ 4 byte là 1 ô (mỗi màu là 1 ô). Hay gặp nhất là <code>FF FF FF 0F</code>: đọc ngược là <code>0FFFFFFF</code> = hết.</p>
      <HexDump id="fat" bands={Array.from({ length: 16 }, (_, k) => [6 * 512 + 4 * k, 4])} />
      <Check q="Ô 5 ghi 0FFFFFFF nghĩa là gì?">Cluster 5 là cluster cuối của một file</Check>
    </section>
  );
}

export function DirConcept() {
  return (
    <section id="thu-muc">
      <SectionHead tag={TAG} title="Thư mục: RDET và SDET" />
      <Goal>Biết bảng thư mục là gì và trông ra sao.</Goal>
      <p>Mỗi thư mục là một <b>bảng</b>. Mỗi dòng của bảng, gọi là <b>entry</b>, dài 32 byte và mô tả 1 file hoặc 1 thư mục con: tên, loại, cluster đầu, kích thước.</p>
      <KeyPoints title="Có 2 loại bảng">
        <ul>
          <li><b>RDET</b>: bảng của thư mục gốc. FAT32 đặt nó ở cluster 2.</li>
          <li><b>SDET</b>: bảng của một thư mục con, nằm ở cluster của thư mục đó. Luôn mở đầu bằng 2 dòng “.” (chính nó) và “..” (thư mục cha).</li>
        </ul>
      </KeyPoints>
      <div className="dirpair" role="img" aria-label="RDET có README.TXT, GAME.EXE và thư mục PHOTOS ở cluster 9; bảng SDET của PHOTOS ở cluster 9 có ., .. và CAT.JPG">
        <div className="toc">
          <div className="toc-title">RDET (thư mục gốc)</div>
          <div><span>README.TXT</span><span>cluster 3</span></div>
          <div><span>GAME.EXE</span><span>cluster 7</span></div>
          <div><span>PHOTOS (thư mục)</span><span>cluster 9</span></div>
        </div>
        <div className="dirpair-arrow">PHOTOS ở cluster 9 → mở bảng ở cluster 9</div>
        <div className="toc">
          <div className="toc-title">SDET của PHOTOS</div>
          <div><span>.</span><span>cluster 9</span></div>
          <div><span>..</span><span>cluster 0 (gốc)</span></div>
          <div><span>CAT.JPG</span><span>cluster 10</span></div>
        </div>
      </div>
      <p>Muốn vào thư mục con: lấy cluster của nó trong bảng cha, rồi đọc bảng nằm ở cluster đó.</p>
      <h3>Trong hex dump</h3>
      <p>Mỗi entry chiếm đúng 2 dòng hex (mỗi màu là 1 entry). Tên file đọc được ở cột chữ bên phải.</p>
      <HexDump id="rdet" bands={Array.from({ length: 7 }, (_, k) => [10 * 512 + 32 * k, 32])} />
      <Check q="Dòng “..” trong SDET chỉ đến đâu?">Thư mục cha (cluster 0 nghĩa là thư mục gốc)</Check>
    </section>
  );
}

// Fields of a main entry: [offset, length, name, example bytes, skip?]. Example: README.TXT, cluster 3, 1200 bytes.
const ENTRY_FIELDS = [
  ["00", 8, "tên chính", "README"], ["08", 3, "đuôi", "TXT"], ["0B", 1, "thuộc tính", "20"],
  ["0C", 8, "ngày giờ tạo", "bỏ qua", true], ["14", 2, "cluster (cao)", "00 00"],
  ["16", 4, "ngày giờ sửa", "bỏ qua", true], ["1A", 2, "cluster (thấp)", "03 00"], ["1C", 4, "kích thước", "B0 04 00 00"],
];
const ATTR_BITS = [["7", "", "không dùng"], ["6", "", "không dùng"], ["5", "A", "lưu trữ"], ["4", "D", "thư mục"],
  ["3", "V", "tên ổ"], ["2", "S", "hệ thống"], ["1", "H", "ẩn"], ["0", "R", "chỉ đọc"]];

export function EntryConcept() {
  return (
    <section id="entry">
      <SectionHead tag={TAG} title="Một entry 32 byte" />
      <Goal>Biết một entry chứa gì và cách nhận ra loại entry.</Goal>
      <p>Entry chính của một file chia thành các ô sau (vị trí viết hex). Ví dụ: README.TXT, cluster 3, 1200 byte.</p>
      <div className="tablewrap">
        <div className="rowsplit dense" role="img" aria-label="Entry 32 byte: tên 8, đuôi 3, thuộc tính 1, ngày giờ tạo 8, cluster cao 2, ngày giờ sửa 4, cluster thấp 2, kích thước 4">
          {ENTRY_FIELDS.map(([o, len, name, ex, skip]) => (
            <div key={o} className={"rs-cell" + (skip ? " skip" : "")} style={{ flex: skip ? 2 : len + 1 }}>
              <span className="rs-off">{o} · {len} byte</span>
              <b className="mono">{ex}</b>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="note">Cluster đầu = phần cao ghép phần thấp; với volume nhỏ, phần cao thường là <code>00 00</code>. Số nhiều byte vẫn đọc ngược: <code>B0 04 00 00</code> = <code>4B0</code> = 1200.</p>

      <KeyPoints title="Nhận ra loại entry">
        <Table head={["Nhìn vào", "Thấy", "Là"]} rows={[
          ["Byte đầu", <code>00</code>, "Trống, bảng hết ở đây"],
          ["Byte đầu", <code>E5</code>, "File đã bị xóa"],
          ["Byte 0B", <code>0F</code>, "Mảnh tên dài (entry phụ)"],
          ["Byte 0B", <code>08</code>, "Tên ổ (volume label)"],
          ["Byte 0B", <code>10</code>, "Thư mục"],
          ["Byte 0B", <code>20</code>, "File"],
        ]} />
      </KeyPoints>

      <h3>Tên dài</h3>
      <p>Entry chính chỉ chứa tên ngắn: 8 ký tự + 3 ký tự đuôi, viết hoa, ví dụ <code>BAOCAO~1.DOC</code>. Tên dài như “Bao cao tuan 1.docx” được cất thêm trong <b>entry phụ</b> nằm ngay trên entry chính. Mỗi entry phụ chứa 13 ký tự, mỗi ký tự 2 byte.</p>

      <h3>Thuộc tính</h3>
      <p>Byte <code>0B</code> là thuộc tính. Đổi ra 8 bit, mỗi bit là một cờ:</p>
      <div className="tablewrap">
        <div className="bits" role="img" aria-label="8 bit thuộc tính: bit 5 A lưu trữ, bit 4 D thư mục, bit 3 V tên ổ, bit 2 S hệ thống, bit 1 H ẩn, bit 0 R chỉ đọc">
          {ATTR_BITS.map(([n, letter, meaning]) => (
            <div key={n} className={"bit" + (letter ? "" : " off")}>
              <span>bit {n}</span><b>{letter || "0"}</b><span>{meaning}</span>
            </div>
          ))}
        </div>
      </div>
      <p><code>20</code> = <code>0010 0000</code> → chỉ bật A → file thường. <code>10</code> = <code>0001 0000</code> → D → thư mục.</p>
      <Check q="Byte 0B = 12 là gì?">12 = 0001 0010 → D + H: thư mục ẩn</Check>
    </section>
  );
}
