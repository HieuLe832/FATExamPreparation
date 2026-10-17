import { Must, PageHead, Table } from "../components/Study.jsx";

const link = (id, text) => <a href={`#${id}`}>{text}</a>;

export default function Start({ groups = [], lessons = [], done = new Set() }) {
  const shown = groups.filter((g) => g.name !== "Bắt đầu");
  return (
    <section>
      <PageHead
        tag="Bắt đầu"
        title="Đề thi gồm những gì"
        lead="Hai dạng bài kiểm tra: Baitap_HTTT cho hex dump của một ổ đĩa FAT32 và hỏi 6 câu; Baitap_QLTT cho bảng tiến trình và hỏi lịch dùng CPU. Câu nào cũng có một cách giải cố định."
      />

      <h2>Tập tin: 6 câu trong Baitap_HTTT</h2>
      <Table
        head={["Câu", "Đề cho", "Phải tìm", "Học ở"]}
        rows={[
          [<b>1</b>, "Sector 0 của ổ cứng (MBR)", "Số phân vùng, loại, dung lượng; phân vùng nào khởi động", link("cau-1", "Câu 1")],
          [<b>2a</b>, "Sector 0 của volume (boot sector)", "Bảng 10 thông số của volume", link("cau-2a", "Câu 2a")],
          [<b>2b</b>, "Bảng FAT, thư mục gốc, thư mục con", "Cây thư mục; thuộc tính, kích thước, các sector của từng mục",
            <>{link("cau-2b-fat", "Bảng FAT")}, {link("cau-2b-cay", "Cây thư mục")}</>],
          [<b>2c, 2d, 2e</b>, "Như câu 2b", "Sau lệnh MOVE, XÓA, COPY: vùng FAT, RDET, SDET, Data đổi ở sector nào", link("cau-2cde", "Câu 2c–e")],
        ]}
      />

      <h2>Câu trước cho số, câu sau dùng</h2>
      <div className="flow" role="img" aria-label="Câu 2a cho vị trí các vùng, câu 2b dùng để tìm sector của từng mục, câu 2c đến 2e dùng kết quả của 2b">
        <div className="flow-node"><b>2a · Boot sector</b><span>S<sub>B</sub>, N<sub>F</sub>, S<sub>F</sub>, S<sub>C</sub></span></div>
        <div className="flow-arrow">vị trí FAT1, FAT2, Data</div>
        <div className="flow-node"><b>2b · FAT và thư mục</b><span>cây thư mục</span></div>
        <div className="flow-arrow">sector của từng mục, ô FAT trống</div>
        <div className="flow-node"><b>2c · 2d · 2e</b><span>MOVE, XÓA, COPY</span></div>
      </div>
      <p className="note">Sai một số ở câu 2a thì các câu sau sai theo. Câu 1 làm riêng, không cần số của bài 2.</p>

      <h2>Tiến trình: 2 bài trong Baitap_QLTT</h2>
      <Table
        head={["Bài", "Đề cho", "Phải làm", "Học ở"]}
        rows={[
          [<b>Bài 2</b>, "Bảng 4 tiến trình, nhiều lần CPU và I/O", "Quá trình điều phối SJF không độc quyền, sơ đồ Gantt, thời gian chờ", link("tt-bai-2", "Bài 2")],
          [<b>Bài 1</b>, "Như bài 2, I/O dùng thiết bị R1, R2", "Sơ đồ CPU (SJF) và R1 (FIFO), thời gian chờ", link("tt-bai-1", "Bài 1")],
        ]}
      />
      <p className="note">Bắt đầu ở trang {link("tt-sjf", "SJF và sơ đồ Gantt")}. Phần này không cần gì từ phần FAT.</p>

      <h2>Cách đọc các trang</h2>
      <ul className="legend">
        <li><Must>Chữ tô vàng</Must> là phần phải thuộc: vị trí byte, công thức, mã. Tất cả được gom lại ở trang {link("phai-thuoc", "Bảng phải thuộc")}.</li>
        <li><span className="skip-tag">Bỏ qua</span> là phần có trong hex dump nhưng đề không hỏi, không cần học.</li>
        <li><b>Đề mini</b> là một bài nhỏ có số tròn (ổ đĩa nhỏ, hoặc ví dụ trong bài giảng), dùng để làm mẫu. Ngay sau đó, cùng trang, là lời giải <b>đề thật</b> (Baitap_HTTT.pdf, Baitap_QLTT.pdf) theo đúng các bước ấy.</li>
      </ul>

      <h2>Thứ tự học</h2>
      <div className="roadmap-groups">
        {shown.map((g) => (
          <div key={g.name}>
            <p className="outline-label">{g.name}</p>
            <ol className="roadmap">
              {g.steps.map((s) => {
                const no = lessons.findIndex((l) => l.id === s.id) + 1;
                return (
                  <li key={s.id} className={done.has(s.id) ? "done" : undefined}>
                    <a href={`#${s.id}`}>
                      <span className="roadmap-no">{done.has(s.id) ? "✓" : no || "·"}</span>
                      <span>{s.label}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
