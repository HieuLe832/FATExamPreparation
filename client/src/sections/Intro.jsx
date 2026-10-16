import Calculators from "../components/Calculators.jsx";
import { SectionHead } from "../components/Study.jsx";

export function Hero({ lessons = [], done = new Set() }) {
  return (
    <header className="hero" id="pham-vi">
      <div className="hero-strip" aria-hidden="true">
        <span>EB 58 90 4D 53 44 4F 53 35 2E 30 00 02 04 26 00</span>
        <span className="hero-strip-asc">ëX.MSDOS5.0...&amp;.</span>
      </div>
      <p className="eyebrow">Hệ điều hành · Quản lý tập tin · FAT32</p>
      <h1>FAT vừa đủ làm bài</h1>
      <p className="lead">
        Trang này chỉ dạy phần bài giảng cần để giải hết <b>Baitap_HTTT.pdf</b>: đọc bảng phân vùng trong MBR (bài 1)
        và đọc một volume FAT32 từ hex dump (bài 2). Không cần biết trước gì: nếu bạn chưa vững hệ 16 hay chưa rõ
        sector là gì, bắt đầu từ phần <a href="#co-ban">Kiến thức nền</a>.
      </p>
      <p className="lead">
        Mỗi bước đi theo thứ tự: trích slide, giải thích, một ví dụ <b>làm mẫu</b> từng bước, phần <b>tự làm</b> trên
        chính hex dump của đề, rồi mới đến đáp án. Gặp chữ lạ thì tra <a href="#tu-dien">Từ điển</a>.
      </p>
      <ol className="roadmap" aria-label="Lộ trình học">
        {lessons.slice(1).map((s, i) => (
          <li key={s.id} className={done.has(s.id) ? "done" : undefined}>
            <a href={`#${s.id}`}>
              <span className="roadmap-no">{done.has(s.id) ? "✓" : i + 1}</span>
              <span className="roadmap-text"><small>{s.group}</small>{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="scope">
        <div className="need">
          <h3>Cần học</h3>
          <ul>
            <li>Đọc số little-endian, đổi offset ra sector</li>
            <li>MBR và bảng 4 phân vùng</li>
            <li>Boot sector FAT32 và vị trí các vùng</li>
            <li>Bảng FAT: chuỗi cluster</li>
            <li>Entry 32 byte: entry chính, entry phụ (tên dài), E5</li>
            <li>Xóa, sao chép, di chuyển ảnh hưởng vùng nào</li>
          </ul>
        </div>
        <div className="skip">
          <h3>Bỏ qua được</h3>
          <ul>
            <li>Cấu tạo vật lý đĩa, đổi sector CHS ↔ logic</li>
            <li>Các phương pháp cấp phát, quản lý đĩa trống</li>
            <li>NTFS, i-node của Unix/Linux</li>
            <li>Boot sector FAT12/16, truy xuất phần tử FAT12</li>
            <li>Tính kích thước bảng FAT khi format, phân mảnh</li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export function HexBasics() {
  return (
    <section id="hex">
      <SectionHead tag="Bước 0 · nền tảng cho mọi câu" title="Đọc hex dump" />
      <div className="prose">
        <p>
          Đề cho các ảnh chụp từ trình xem hex. Mỗi dòng là 16 byte. Cột <b>Offset</b> là vị trí byte đầu dòng, viết
          hệ 16, tính từ đầu volume (bài 2) hoặc đầu ổ cứng (bài 1).
        </p>
        <ul>
          <li>
            <b>Offset → sector:</b> chia cho 512 = <code>0x200</code>. Ví dụ <code>0xD0000 ÷ 0x200 = 0x680 = 1664</code>.
            Đó là lý do đề ghi “sector 1664” cho ảnh có offset <code>000D0000</code>.
          </li>
          <li>
            <b>Little-endian:</b> số dài nhiều byte được lưu byte thấp trước. Muốn đọc giá trị thì <b>viết ngược</b> thứ
            tự byte: <code>26 00</code> → <code>0x0026</code> = 38; <code>5B 5F 06 00</code> → <code>0x00065F5B</code> = 417 627.
          </li>
          <li>Chuỗi ký tự (tên tập tin, “FAT32”) thì đọc xuôi, không đảo.</li>
          <li>Đề chỉ chụp “phần đầu” mỗi sector; phần không chụp coi như toàn <code>00</code>.</li>
          <li>
            <b>Tìm một byte trên ảnh:</b> offset <code>0E</code> nghĩa là dòng <code>00000000</code> (dòng đầu), cột{" "}
            <code>E</code>. Offset <code>1C</code> nghĩa là dòng <code>00000010</code>, cột <code>C</code>: chữ số cuối là
            cột, phần còn lại là dòng.
          </li>
        </ul>
      </div>
      <Calculators />
      <div className="prose">
        <p>
          Các hex dump bên dưới bấm được: bấm vào một byte để xem nó thuộc trường nào và giá trị đã đổi ra. Hãy tự đọc
          trước, rồi bấm để kiểm tra.
        </p>
      </div>
    </section>
  );
}
