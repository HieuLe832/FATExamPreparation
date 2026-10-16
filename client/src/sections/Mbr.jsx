import HexDump from "../components/HexDump.jsx";
import { Answer, Example, SectionHead, Slide, Table, Try } from "../components/Study.jsx";

const n = { cls: "n" };

export default function Mbr() {
  return (
    <section id="mbr">
      <SectionHead tag="Bài tập 1" title="MBR và bảng phân vùng" />
      <div className="slides-row">
        <Slide n={38} caption="tổ chức hệ thống tập tin trên đĩa"
          alt="Trích slide: MBR ở sector logic 0, 512 byte; phân vùng primary và extended, tối đa 4 phân vùng" />
        <Slide n={39} caption="Master Boot Record"
          alt="Trích slide: cấu trúc Master Boot Record, bảng phân vùng tại 1BE, chữ ký 55AA, các TYPE-ID" />
      </div>
      <div className="prose">
        <p>
          Bảng phân vùng nằm tại offset <code>1BE</code>, gồm 4 entry, mỗi entry 16 byte: <code>1BE</code>,{" "}
          <code>1CE</code>, <code>1DE</code>, <code>1EE</code>. Hai byte cuối <code>55 AA</code> là chữ ký MBR. Ảnh trong
          slide liệt kê tên các trường; cách các trường xếp trong 16 byte là:
        </p>
      </div>
      <Table
        wrapStyle={{ maxWidth: 720 }}
        head={["Offset trong entry", { label: "Số byte", cls: "n" }, "Ý nghĩa"]}
        rows={[
          [<span className="mono">+0</span>, 1, <><b>Trạng thái</b>: <code>80</code> = active (phân vùng khởi động), <code>00</code> = không</>],
          [<span className="mono">+1</span>, 3, "Địa chỉ CHS bắt đầu (bỏ qua)"],
          [<span className="mono">+4</span>, 1, <><b>Loại phân vùng</b> (TYPE-ID)</>],
          [<span className="mono">+5</span>, 3, "Địa chỉ CHS kết thúc (bỏ qua)"],
          [<span className="mono">+8</span>, 4, <><b>Sector bắt đầu</b> (LBA), little-endian</>],
          [<span className="mono">+C</span>, 4, <><b>Số sector</b> của phân vùng, little-endian. Dung lượng = số sector × 512 byte</>],
        ]}
      />
      <div className="prose">
        <p>
          TYPE-ID slide có nêu: <code>07</code> NTFS, <code>83</code> Linux, <code>00</code> không dùng. Đề còn có hai mã
          slide không nêu: <code>DE</code> là phân vùng tiện ích Dell (định dạng FAT) và <code>0F</code> là phân vùng{" "}
          <b>Extended</b> (LBA). Hai mã hay gặp khác: <code>0B</code>/<code>0C</code> FAT32, <code>05</code> Extended.
        </p>
      </div>

      <HexDump id="mbr" />

      <Example title="Phân vùng 1 (entry tại 1BE)">
        <p>Entry 1 là 16 byte từ <code>1BE</code> đến <code>1CD</code>. Trên ảnh hex, nó bắt đầu ở 2 byte cuối dòng <code>1B0</code>:</p>
        <p className="step">00 01 01 00 DE FE 3F 05 3F 00 00 00 47 78 01 00</p>
        <ol>
          <li>Byte +0 = <code>00</code> → không phải phân vùng khởi động.</li>
          <li>Byte +4 = <code>DE</code> → loại Dell Utility (FAT).</li>
          <li>Byte +8..+B = <code>3F 00 00 00</code> → đảo thứ tự: <code>0000003F</code> = 63. Phân vùng bắt đầu ở sector 63.</li>
          <li>Byte +C..+F = <code>47 78 01 00</code> → đảo: <code>00017847</code> = 96 327 sector.</li>
          <li>Dung lượng = 96 327 × 512 = 49 319 424 byte. Chia 1024 hai lần: ≈ <b>47,03 MB</b>.</li>
        </ol>
      </Example>
      <Try>
        <ol>
          <li>Làm y hệt cho 3 entry còn lại, bắt đầu ở <code>1CE</code>, <code>1DE</code>, <code>1EE</code>.</li>
          <li>Số lớn thì chia 1024 ba lần để ra GB.</li>
          <li>Kiểm tra: sector đầu phân vùng sau = sector đầu phân vùng trước + số sector của nó.</li>
        </ol>
      </Try>
      <Answer label="Xem đáp án bài 1">
        <Table
          head={["#", "Trạng thái", "Loại", { label: "Sector đầu", ...n }, { label: "Số sector", ...n }, { label: "Dung lượng", ...n }]}
          rows={[
            ["1", <code>00</code>, <><code>DE</code> Dell Utility (FAT)</>, "63", "96 327", "≈ 47,03 MB"],
            [<span className="hi">2</span>, <span className="hi"><code>80</code> active</span>, <><code>07</code> NTFS</>, "96 390", "36 869 175", "≈ 17,58 GB"],
            ["3", <code>00</code>, <><code>83</code> Linux</>, "36 965 565", "14 346 045", "≈ 6,84 GB"],
            ["4", <code>00</code>, <><code>0F</code> Extended (LBA)</>, "51 311 610", "62 958 735", "≈ 30,02 GB"],
          ]}
        />
        <p>
          Ổ cứng chia làm <b>4 phân vùng</b> (3 primary + 1 extended). <b>Phân vùng 2 (NTFS)</b> là phân vùng khởi động
          vì byte trạng thái là <code>80</code>.
        </p>
        <p>
          Ví dụ tính phân vùng 1: <code>47 78 01 00</code> → <code>0x00017847</code> = 96 327 sector × 512 = 49 319 424
          byte ÷ 1024² ≈ 47,03 MB. Kiểm tra liền mạch: 63 + 96 327 = 96 390 = sector đầu phân vùng 2.
        </p>
        <p>Phân vùng extended có thể chứa các phân vùng logic bên trong, nhưng đề chỉ cho MBR nên không thấy được chúng.</p>
      </Answer>
    </section>
  );
}
