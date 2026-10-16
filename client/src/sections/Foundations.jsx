import { Example, SectionHead } from "../components/Study.jsx";

const HEX_DIGITS = [
  ["A", 10], ["B", 11], ["C", 12], ["D", 13], ["E", 14], ["F", 15],
];

/** Starts from zero: bit, byte, hex, sector, cluster, and what FAT does, before any exercise. */
export default function Foundations() {
  return (
    <section id="co-ban">
      <SectionHead tag="Chưa vững thì bắt đầu ở đây" title="Kiến thức nền: từ bit đến FAT" />
      <div className="prose">
        <p>
          Phần này không cần biết trước gì. Nếu bạn đã quen hệ 16 và biết sector là gì, có thể nhảy thẳng xuống bước 0.
        </p>
      </div>

      <h3>1. Bit và byte</h3>
      <div className="prose">
        <p>
          Máy tính lưu mọi thứ bằng các <b>bit</b>, mỗi bit chỉ là 0 hoặc 1. Gom 8 bit lại thành 1 <b>byte</b>. Một byte
          biểu diễn được 256 giá trị, từ 0 đến 255. Mọi con số trong đề (tên file, kích thước, số cluster…) đều là một
          hoặc vài byte ghép lại.
        </p>
      </div>

      <h3>2. Hệ 16 (hex): cách đề viết các byte</h3>
      <div className="prose">
        <p>
          Viết một byte bằng 8 chữ số 0/1 thì quá dài, nên người ta dùng <b>hệ 16</b>. Hệ 16 có 16 chữ số: 0 đến 9 như
          bình thường, rồi thêm 6 chữ cái:
        </p>
      </div>
      <div className="tablewrap">
        <table className="t hexdigits">
          <tbody>
            <tr><th>Hex</th>{HEX_DIGITS.map(([h]) => <td key={h} className="mono">{h}</td>)}</tr>
            <tr><th>Thập phân</th>{HEX_DIGITS.map(([h, d]) => <td key={h}>{d}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <div className="prose">
        <p>
          Một byte luôn viết đúng <b>2 chữ số hex</b>: <code>00</code> là 0, <code>FF</code> là 255. Để phân biệt với số
          thường, số hex hay có tiền tố <code>0x</code> hoặc hậu tố <code>h</code>: <code>0x26</code>, <code>26h</code>.
        </p>
      </div>
      <Example title="Đổi hex ra thập phân">
        <p>Mỗi chữ số nhân với một “trọng số”, tính từ phải sang trái: 1, 16, 256, 4096… (mỗi lần nhân thêm 16).</p>
        <ul>
          <li><code>0x26</code> = 2 × 16 + 6 = <b>38</b></li>
          <li><code>0x1E00</code> = 1 × 4096 + 14 × 256 + 0 × 16 + 0 = <b>7680</b></li>
          <li><code>0x32D</code> = 3 × 256 + 2 × 16 + 13 = <b>813</b> (D = 13)</li>
        </ul>
        <p>Ô “Hex ↔ thập phân ↔ nhị phân” ở bước 0 làm phép đổi này giúp bạn để kiểm tra.</p>
      </Example>
      <div className="prose">
        <p>
          <b>Hex sang nhị phân</b> còn dễ hơn: mỗi chữ số hex đúng bằng 4 bit. Ví dụ <code>0x16</code>: <code>1</code> =
          {" "}<code>0001</code>, <code>6</code> = <code>0110</code>, nên <code>0x16</code> = <code>0001 0110</code>. Bạn
          cần cách này để đọc byte thuộc tính của file, nơi mỗi bit là một cờ (ẩn, thư mục, hệ thống…).
        </p>
      </div>

      <h3>3. Ổ đĩa giống một cuốn vở rất dày</h3>
      <div className="prose">
        <p>
          Hãy tưởng tượng ổ đĩa là một cuốn vở. Mỗi <b>trang</b> chứa đúng 512 byte; trang đó gọi là <b>sector</b>. Các
          trang được đánh số từ 0: sector 0, sector 1, sector 2…
        </p>
      </div>
      <div className="tablewrap">
        <div className="disk" role="img" aria-label="Sector là trang 512 byte; cluster là nhóm 4 sector liền nhau">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div key={s} className={"disk-sector" + (s >= 4 ? " c2" : "")}><b>sector {1664 + s}</b><span>512 byte</span></div>
          ))}
          <div className="disk-brace" style={{ gridColumn: "1 / span 4" }}>cluster 2 = 4 sector</div>
          <div className="disk-brace" style={{ gridColumn: "5 / span 4" }}>cluster 3 = 4 sector</div>
        </div>
      </div>
      <div className="prose">
        <ul>
          <li>
            <b>Cluster</b> là một nhóm vài sector liền nhau (trong đề là 4 sector = 2048 byte). Hệ điều hành cấp chỗ cho
            file theo từng cluster, giống như mỗi lần phát cho bạn 4 trang vở liền nhau chứ không phát lẻ từng trang.
          </li>
          <li>
            <b>Offset</b> là “byte thứ mấy tính từ đầu đĩa”. Vì mỗi sector có 512 byte, lấy offset chia 512 là ra số
            sector. Cột Offset trong ảnh hex của đề chính là con số này, viết ở hệ 16.
          </li>
          <li>
            Một ổ cứng có thể chia thành nhiều <b>phân vùng</b> (ổ C, ổ D…). Mỗi phân vùng đã định dạng gọi là một{" "}
            <b>volume</b>. Bài 1 hỏi về cách chia phân vùng; bài 2 hỏi bên trong một volume FAT32.
          </li>
        </ul>
      </div>

      <h3>4. FAT làm gì: mục lục và sổ “trang tiếp theo”</h3>
      <div className="prose">
        <p>
          Một file lớn chiếm nhiều cluster, và các cluster đó không nhất thiết nằm cạnh nhau. Hệ thống FAT cần nhớ hai
          thứ:
        </p>
        <ol>
          <li>
            <b>Bảng thư mục</b> (RDET cho thư mục gốc, SDET cho thư mục con) giống <b>trang mục lục</b>: mỗi dòng ghi tên
            một file, kích thước, và <b>cluster bắt đầu</b>.
          </li>
          <li>
            <b>Bảng FAT</b> giống một <b>cuốn sổ ghi “sau cluster này là cluster nào”</b>. Đi theo sổ cho đến khi gặp chữ
            “hết” (EOF) là biết file nằm ở những cluster nào.
          </li>
        </ol>
      </div>
      <Example title="Ví dụ thật trong đề: tìm file EXTERNAL.DLL">
        <div className="chain" role="img" aria-label="Mục lục: EXTERNAL.DLL bắt đầu ở cluster 6; bảng FAT: 6 → 7 → 8 → 9 → EOF">
          <div className="chain-entry"><span>Mục lục (RDET)</span><b>EXTERNAL.DLL · bắt đầu cluster 6</b></div>
          <div className="chain-links">
            {["6", "7", "8", "9"].map((c) => <span key={c} className="chain-node">cluster {c}</span>)}
            <span className="chain-node end">EOF · hết</span>
          </div>
        </div>
        <p>
          Mục lục nói file bắt đầu ở cluster 6. Tra bảng FAT: ô số 6 ghi “7”, ô số 7 ghi “8”, ô số 8 ghi “9”, ô số 9 ghi
          “hết”. Vậy file nằm ở 4 cluster 6, 7, 8, 9. Đổi ra sector là xong. Toàn bộ bài 2 chỉ là làm đi làm lại việc này
          trên hex dump.
        </p>
      </Example>

      <h3>5. Bản đồ đề bài</h3>
      <div className="tablewrap" style={{ maxWidth: 900 }}>
        <table className="t">
          <thead><tr><th>Câu</th><th>Hỏi gì</th><th>Cần học phần</th></tr></thead>
          <tbody>
            <tr><td>Bài 1</td><td>Ổ chia mấy phân vùng, loại, dung lượng, phân vùng khởi động</td><td><a href="#mbr">MBR</a></td></tr>
            <tr><td>2a</td><td>10 thông số của volume</td><td><a href="#boot">Boot sector</a></td></tr>
            <tr><td>2b</td><td>Cây thư mục, thuộc tính, kích thước, sector của từng file</td><td><a href="#fat">Bảng FAT</a> + <a href="#dir">RDET, SDET</a></td></tr>
            <tr><td>2c, 2d, 2e</td><td>Di chuyển, xóa, sao chép làm thay đổi sector nào</td><td><a href="#ops">Move, Xóa, Copy</a></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
