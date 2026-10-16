import { Answer, ImpactTable, SectionHead, Slide, Try } from "../components/Study.jsx";

export default function Operations() {
  return (
    <section id="ops">
      <SectionHead tag="Bài tập 2c, 2d, 2e" title="Di chuyển, xóa, sao chép" />
      <div className="prose">
        <p>
          Mỗi câu hỏi bốn vùng thay đổi ra sao. Trong volume này: <b>FAT</b> = sector 38–1663 (FAT1 38–850, FAT2
          851–1663); <b>RDET</b> = 1664–1667; <b>SDET</b> = bảng của TMC1 (1736–1739) hoặc TMC2 (1756–1759); <b>Data</b>{" "}
          = các cluster chứa nội dung tập tin. Cách làm: đọc thuật toán trong slide, liệt kê từng byte bị ghi, rồi đổi vị
          trí byte đó ra sector.
        </p>
      </div>

      <h3>c) MOVE “Ext Superblock.tpl” vào TMC2</h3>
      <Slide n={67} caption="di chuyển tập tin (MOVE)"
        alt="Trích slide: di chuyển tập tin: tìm entry trống ở thư mục đích, copy entry, xóa entry nguồn" />
      <Try>
        <p>
          Tập tin có mấy entry (tính cả entry phụ)? Chúng nằm ở offset nào trong sector 1664? Trong TMC2, entry trống đầu
          tiên ở đâu? MOVE có phải ghi bảng FAT hay nội dung không?
        </p>
      </Try>
      <Answer label="Xem đáp án câu c">
        <ImpactTable
          rdet={<><b>1664</b>: byte đầu của 3 entry ở offset <code>A0</code>, <code>C0</code>, <code>E0</code> thành <code>E5</code></>}
          sdet={<><b>1756</b> (TMC2): ghi 3 entry vào offset <code>40</code>, <code>60</code>, <code>80</code>, ngay sau “..”</>}
        />
        <p>
          Di chuyển trong cùng volume chỉ chuyển entry. Nội dung vẫn ở cluster 18–19 nên chuỗi FAT và vùng dữ liệu giữ
          nguyên.
        </p>
      </Answer>

      <h3>d) XÓA “Sample script.whs”</h3>
      <Slide n={64} caption="xóa tập tin (DELETE)"
        alt="Trích slide: xóa tập tin: đặt E5 vào byte đầu entry chính và các entry phụ, đặt các phần tử FAT về 0, không đổi nội dung" />
      <Try>
        <p>
          Entry của tập tin nằm ở sector nào, offset nào? Những phần tử FAT nào phải về 0, và chúng nằm ở byte nào của
          bảng FAT? Có mấy bảng FAT?
        </p>
      </Try>
      <Answer label="Xem đáp án câu d">
        <ImpactTable
          fat={<><b>38</b> (FAT1) và <b>851</b> (FAT2): phần tử 21, 22 (byte <code>54</code>–<code>5B</code> của bảng) thành <code>00000000</code></>}
          sdet={<><b>1736</b> (TMC1): byte đầu của 3 entry ở offset <code>40</code>, <code>60</code>, <code>80</code> thành <code>E5</code></>}
        />
        <p>
          Phần tử 21 nằm ở byte 21 × 4 = 84 = <code>0x54</code> của bảng FAT, vẫn trong sector đầu tiên của bảng. Nội
          dung ở sector 1740–1747 không bị xóa, nên mới có thể khôi phục tập tin.
        </p>
      </Answer>

      <h3>e) COPY “TIMEZONE.DAT” vào thư mục gốc</h3>
      <Slide n={66} caption="sao chép tập tin (COPY)"
        alt="Trích slide: sao chép tập tin: tìm entry trống, tìm cluster trống, copy entry, ghi chuỗi FAT và copy nội dung" />
      <Try>
        <p>
          Tập tin 2400 byte cần mấy cluster? Lấy những cluster trống nào (xem lại bảng FAT)? Các cluster đó là sector
          nào? Tên “TIMEZONE.DAT” có cần entry phụ không?
        </p>
      </Try>
      <Answer label="Xem đáp án câu e">
        <ImpactTable
          fat={<><b>38</b> (FAT1) và <b>851</b> (FAT2): phần tử 11 = <code>0000000C</code> (trỏ tới 12), phần tử 12 = <code>0FFFFFFF</code> (EOF)</>}
          rdet={<><b>1664</b>: thêm 1 entry chính, cluster bắt đầu = 11, kích thước 2400</>}
          data={<><b>1700 – 1707</b> (cluster 11 và 12)</>}
        />
        <p>
          2400 B / 2048 B → 2 cluster. Cluster trống đầu tiên là 11, kế đó 12. Cluster 11 → 1664 + 9 × 4 = 1700.
          “TIMEZONE.DAT” vừa khuôn 8.3 nên chỉ cần 1 entry. Entry mới vào chỗ trống đầu tiên của RDET: offset{" "}
          <code>40</code> nếu dùng lại entry <code>E5</code>, hoặc <code>140</code> nếu chỉ dùng entry <code>00</code>.
          Cách nào cũng nằm trong sector 1664. TMC1 là nguồn nên chỉ bị đọc, không bị ghi.
        </p>
      </Answer>
    </section>
  );
}
