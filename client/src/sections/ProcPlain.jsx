import { EventTable, Gantt, ProcTable, WaitTable, avgWait, exampleRows } from "../components/Schedule.jsx";
import { Ask, Calc, Final, Must, PageHead, Recipe, Result, Step, Steps, Table, Traps } from "../components/Study.jsx";
import { MINI_PLAIN } from "../proc/exercises.js";
import { RealPlain } from "./ProcReal.jsx";

export default function ProcPlain() {
  return (
    <section>
      <PageHead tag="Tiến trình · Bài 2" title="Bài 2: SJF với nhiều lần dùng CPU" />
      <Ask
        given="Bảng 4 tiến trình: thời điểm vào RL, CPU lần 1, I/O lần 1, CPU lần 2, I/O lần 2, CPU lần 3."
        asks="a) Trình bày quá trình điều phối và vẽ sơ đồ Gantt (SJF không độc quyền). b) Tính thời gian chờ cho các tiến trình."
      />

      <h2>Hiểu nhanh</h2>
      <p>Mỗi dòng của bảng đọc từ trái sang phải: dùng CPU, đi làm I/O, quay lại dùng CPU… Trong lúc làm I/O, tiến trình không cần CPU và không nằm trong RL.</p>
      <Table
        head={["P2 trong đề thật", "CPU 6", "I/O 3", "CPU 2", "I/O 3", "CPU 2"]}
        rows={[["Ở đâu", "RL / CPU", "đi I/O", "RL / CPU", "đi I/O", "RL / CPU"]]}
      />
      <p>Xong I/O, tiến trình <b>quay lại RL</b> với lượt CPU kế tiếp. Lúc đó nó được so như một tiến trình mới đến, nên có thể giành CPU.</p>

      <h2>Cách giải</h2>
      <Recipe skip="Thời gian lưu lại hệ thống (turnaround). Thời gian chờ trung bình chỉ ghi thêm nếu đề hỏi.">
        <li>Thời điểm có việc xảy ra: vào RL lần đầu, xong lượt CPU, và <Must>xong I/O: quay lại RL với lượt CPU kế tiếp</Must>.</li>
        <li>Xong lượt CPU: nếu bảng còn cột I/O thì đi I/O, ghi giờ về = bây giờ + thời gian I/O; hết cột thì tiến trình kết thúc.</li>
        <li>Mỗi thời điểm chọn như trang trước: <Must>còn lại ít nhất trong lượt CPU hiện tại</Must>, chỉ giành khi ngắn hơn hẳn.</li>
        <li><Must>Đề không ghi thiết bị: I/O các tiến trình chạy song song, không chờ nhau</Must>.</li>
        <li>Vẽ Gantt CPU. Lúc không ai cần CPU, vẽ một ô trống.</li>
        <li>WT = tổng các khoảng nằm trong RL; <Must>thời gian I/O không tính vào WT</Must>. Kiểm tra: <Must>WT = kết thúc − vào − tổng CPU − tổng I/O</Must>.</li>
      </Recipe>

      <h2>Làm mẫu trên đề mini</h2>
      <Steps>
        <Step title="Đọc bảng">
          <ProcTable kind="plain" rows={MINI_PLAIN.rows} />
          <p>P1: CPU 4 → I/O 3 → CPU 2. P2: CPU 2 → I/O 1 → CPU 1. P3: CPU 4.</p>
        </Step>
        <Step title="Đi theo từng thời điểm">
          <EventTable events={MINI_PLAIN.events} />
          <Calc>t = 4: P1 đã chạy 0–1 và 3–4, còn 4 − 2 = 2 · P2 về với 1 · 1 &lt; 2 → P2 giành CPU</Calc>
          <Calc>t = 10: P3 đã chạy 7–10, còn 4 − 3 = 1 · P1 về với 2 · 2 &gt; 1 → P3 giữ CPU</Calc>
        </Step>
        <Step title="Vẽ sơ đồ Gantt">
          <Gantt label="Gantt CPU: P1 0–1, P2 1–3, P1 3–4, P2 4–5, P1 5–7, P3 7–11, P1 11–13" rows={exampleRows(MINI_PLAIN)} />
          <p className="note">Hàng I/O không bắt buộc; vẽ ra để thấy lúc tiến trình quay lại RL.</p>
        </Step>
        <Step title="Tính thời gian chờ">
          <WaitTable ex={MINI_PLAIN} />
        </Step>
      </Steps>
      <Final title="Đáp án đề mini">
        <Result>WT: P1 = 4, P2 = 0, P3 = 5. Trung bình = {avgWait(MINI_PLAIN)}.</Result>
      </Final>

      <h2>Làm trên đề thật</h2>
      <RealPlain />

      <h2>Dễ sai</h2>
      <Traps items={[
        "Quên xét lại khi tiến trình xong I/O quay về RL: nó cũng có thể giành CPU.",
        "So lượt CPU sau với tổng CPU của cả tiến trình: chỉ so lượt hiện tại.",
        "Cộng thời gian I/O vào WT.",
        "Vẽ liền các ô khi CPU rảnh: phải có ô trống (đề thật: 2–3, 24–27, 29–32).",
        "Cho I/O của bài 2 xếp hàng chờ nhau: đề không ghi thiết bị, I/O chạy song song.",
      ]} />
    </section>
  );
}
