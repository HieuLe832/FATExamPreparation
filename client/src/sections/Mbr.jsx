import HexDump from "../components/HexDump.jsx";
import { Answer, Example, Goal, KeyPoints, SectionHead, Slide, SlideStrip, Table, Try } from "../components/Study.jsx";

const n = { cls: "n" };
const mono = (s) => <span className="mono">{s}</span>;

export default function Mbr() {
  return (
    <section id="mbr">
      <SectionHead tag="Bài tập 1" title="MBR và phân vùng" />
      <Goal>Đọc ra 4 phân vùng của ổ cứng.</Goal>
      <SlideStrip>
        <Slide n={39} caption="Master Boot Record"
          alt="Trích slide: cấu trúc Master Boot Record, bảng phân vùng tại 1BE, chữ ký 55AA, các TYPE-ID" />
        <Slide n={38} caption="tổ chức hệ thống tập tin trên đĩa"
          alt="Trích slide: MBR ở sector logic 0, 512 byte; phân vùng primary và extended, tối đa 4 phân vùng" />
      </SlideStrip>

      <KeyPoints>
        <p>Bảng phân vùng bắt đầu ở <code>1BE</code>: 4 dòng, mỗi dòng 16 byte (<code>1BE</code>, <code>1CE</code>, <code>1DE</code>, <code>1EE</code>). Mỗi dòng chỉ cần đọc 4 chỗ:</p>
        <Table
          head={["Byte", "Nghĩa"]}
          rows={[
            [mono("+0"), <><code>80</code> = phân vùng khởi động, <code>00</code> = không</>],
            [mono("+4"), <>Loại: <code>07</code> NTFS · <code>83</code> Linux · <code>0F</code> Extended · <code>DE</code> Dell (FAT)</>],
            [mono("+8"), "Sector bắt đầu (4 byte, đọc ngược)"],
            [mono("+C"), "Số sector (4 byte, đọc ngược). Dung lượng = số sector × 512"],
          ]}
        />
      </KeyPoints>

      <HexDump id="mbr" />

      <Example title="Phân vùng 1 (dòng 1BE)">
        <p className="step">00 01 01 00 DE FE 3F 05 3F 00 00 00 47 78 01 00</p>
        <ol>
          <li>+0 = <code>00</code> → không khởi động. +4 = <code>DE</code> → Dell (FAT).</li>
          <li>+8 = <code>3F 00 00 00</code> → <code>3F</code> = sector 63.</li>
          <li>+C = <code>47 78 01 00</code> → <code>17847</code> = 96 327 sector.</li>
          <li>96 327 × 512 ÷ 1024 ÷ 1024 ≈ <b>47,03 MB</b>.</li>
        </ol>
      </Example>
      <Try><p>Làm 3 phân vùng còn lại (dòng <code>1CE</code>, <code>1DE</code>, <code>1EE</code>). Số lớn thì chia 1024 ba lần để ra GB.</p></Try>
      <Answer label="Xem đáp án bài 1">
        <Table
          head={["#", "Khởi động", "Loại", { label: "Sector đầu", ...n }, { label: "Số sector", ...n }, { label: "Dung lượng", ...n }]}
          rows={[
            ["1", "không", "DE · Dell (FAT)", "63", "96 327", "≈ 47,03 MB"],
            [<span className="hi">2</span>, <span className="hi">có (80)</span>, "07 · NTFS", "96 390", "36 869 175", "≈ 17,58 GB"],
            ["3", "không", "83 · Linux", "36 965 565", "14 346 045", "≈ 6,84 GB"],
            ["4", "không", "0F · Extended", "51 311 610", "62 958 735", "≈ 30,02 GB"],
          ]}
        />
        <p><b>4 phân vùng.</b> Phân vùng khởi động là <b>số 2 (NTFS)</b>.</p>
      </Answer>
    </section>
  );
}
