import { Example, Goal, KeyPoints, SectionHead } from "../components/Study.jsx";

const HEX_DIGITS = [["A", 10], ["B", 11], ["C", 12], ["D", 13], ["E", 14], ["F", 15]];

/** The four words everything else uses: byte, hex, sector, cluster. */
export default function Foundations() {
  return (
    <section id="co-ban">
      <SectionHead tag="Chưa vững thì đọc bước này" title="Kiến thức nền" />
      <Goal>Hiểu 4 chữ: byte, hex, sector, cluster.</Goal>

      <KeyPoints title="Byte và hex">
        <ul>
          <li>1 byte được viết bằng <b>2 ký tự hex</b>, từ <code>00</code> (= 0) đến <code>FF</code> (= 255).</li>
          <li>Hex dùng 0–9 và thêm 6 chữ cái:</li>
        </ul>
        <div className="tablewrap">
          <table className="t hexdigits">
            <tbody>
              <tr><th>Hex</th>{HEX_DIGITS.map(([h]) => <td key={h} className="mono">{h}</td>)}</tr>
              <tr><th>Số</th>{HEX_DIGITS.map(([h, d]) => <td key={h}>{d}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </KeyPoints>
      <Example title="Đổi hex ra số">
        <ul>
          <li><code>26</code> = 2 × 16 + 6 = <b>38</b></li>
          <li><code>32D</code> = 3 × 256 + 2 × 16 + 13 = <b>813</b></li>
        </ul>
      </Example>

      <KeyPoints title="Sector và cluster">
        <ul>
          <li><b>Sector</b> = 1 ô 512 byte trên đĩa. Đánh số 0, 1, 2…</li>
          <li><b>Cluster</b> = 4 sector liền nhau (trong đề). File được cấp chỗ theo cluster.</li>
        </ul>
      </KeyPoints>
      <div className="tablewrap">
        <div className="disk" role="img" aria-label="Cluster 2 gồm sector 1664 đến 1667, cluster 3 gồm sector 1668 đến 1671">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div key={s} className={"disk-sector" + (s >= 4 ? " c2" : "")}><b>sector {1664 + s}</b><span>512 byte</span></div>
          ))}
          <div className="disk-brace" style={{ gridColumn: "1 / span 4" }}>cluster 2</div>
          <div className="disk-brace" style={{ gridColumn: "5 / span 4" }}>cluster 3</div>
        </div>
      </div>

      <KeyPoints title="FAT tìm file thế nào">
        <ul>
          <li><b>Thư mục</b> ghi: tên file + cluster đầu tiên.</li>
          <li><b>Bảng FAT</b> ghi: sau cluster này là cluster nào, cho đến chữ “hết”.</li>
        </ul>
      </KeyPoints>
      <Example title="File EXTERNAL.DLL trong đề">
        <div className="chain" role="img" aria-label="EXTERNAL.DLL bắt đầu ở cluster 6; bảng FAT: 6 → 7 → 8 → 9 → hết">
          <div className="chain-entry"><span>Thư mục</span><b>EXTERNAL.DLL · cluster 6</b></div>
          <div className="chain-links">
            {["6", "7", "8", "9"].map((c) => <span key={c} className="chain-node">cluster {c}</span>)}
            <span className="chain-node end">hết</span>
          </div>
        </div>
        <p>Vậy file nằm ở cluster 6, 7, 8, 9. Cả bài 2 chỉ là làm lại việc này trên hex dump.</p>
      </Example>
    </section>
  );
}
