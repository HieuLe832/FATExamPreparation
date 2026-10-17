import { EventTable, Gantt, ProcTable, WaitTable, avgWait, exampleRows } from "../components/Schedule.jsx";
import { Calc, Final, Must, PageHead, Recipe, Result, Step, Steps, Table, Traps } from "../components/Study.jsx";
import { BASICS } from "../proc/exercises.js";

const link = (id, text) => <a href={`#${id}`}>{text}</a>;

export default function ProcBasics() {
  return (
    <section>
      <PageHead
        tag="Quản lý tiến trình"
        title="SJF không độc quyền và sơ đồ Gantt"
        lead="Cả hai bài trong Baitap_QLTT hỏi cùng một việc: theo SJF không độc quyền, CPU chạy tiến trình nào từ lúc nào đến lúc nào, rồi tính thời gian chờ."
      />

      <h2>Đề gồm những gì</h2>
      <Table
        head={["Bài", "Đề cho", "Phải làm", "Học ở"]}
        rows={[
          [<b>Bài 2</b>, "4 tiến trình, mỗi tiến trình dùng CPU nhiều lần, xen giữa là I/O (không ghi thiết bị)",
            "Trình bày quá trình điều phối, vẽ sơ đồ Gantt, tính thời gian chờ", link("tt-bai-2", "Bài 2")],
          [<b>Bài 1</b>, "Như bài 2, nhưng I/O dùng thiết bị R1, R2; mỗi thiết bị chỉ có 1 cái",
            "Vẽ sơ đồ CPU (SJF) và R1 (FIFO), tính thời gian chờ", link("tt-bai-1", "Bài 1")],
        ]}
      />
      <p className="note">Học bài 2 trước: bài 1 là bài 2 cộng thêm hàng chờ thiết bị.</p>

      <h2>Hiểu nhanh</h2>
      <p><b>Tiến trình</b> (P1, P2…) là một chương trình đang chạy. CPU giống một quầy thu ngân duy nhất: mỗi lúc chỉ phục vụ 1 tiến trình, các tiến trình khác đứng chờ trong hàng.</p>
      <Table
        head={["Từ trong đề", "Nghĩa"]}
        rows={[
          [<b>Ready List (RL)</b>, "Hàng chờ CPU. Tiến trình trong RL đã sẵn sàng, chỉ thiếu CPU."],
          [<b>Thời điểm vào RL</b>, "Lúc tiến trình xuất hiện và bắt đầu chờ CPU."],
          [<><b>CPU</b> (CPU burst)</>, "Số đơn vị thời gian tiến trình cần CPU trong lượt đó."],
          [<b>Sơ đồ Gantt</b>, "Thanh thời gian: ô nào ghi tiến trình nào dùng CPU, số dưới ô là lúc bắt đầu, kết thúc."],
          [<b>Thời gian chờ (WT)</b>, "Tổng thời gian tiến trình nằm trong RL mà chưa được CPU."],
        ]}
      />
      <p><b>SJF</b> (Shortest Job First) chọn tiến trình cần CPU ít nhất. <b>Không độc quyền</b>: tiến trình đang chạy có thể bị giành CPU giữa chừng nếu có tiến trình ngắn hơn vào RL.</p>

      <h2>Cách giải</h2>
      <Recipe skip="FCFS, Round Robin, độ ưu tiên, thời gian lưu lại hệ thống (turnaround): đề không hỏi.">
        <li>Liệt kê các thời điểm có việc xảy ra: một tiến trình <b>vào RL</b>, hoặc tiến trình đang chạy <b>xong</b>.</li>
        <li>Tại mỗi thời điểm, ghi mọi tiến trình đang cần CPU (cả tiến trình đang chạy) với <b>thời gian còn lại</b>. <Must>CPU cho tiến trình còn lại ít nhất</Must>.</li>
        <li><Must>Chỉ giành CPU khi ngắn hơn hẳn</Must>. Bằng nhau thì tiến trình đang chạy giữ CPU; nếu CPU đang rảnh, chọn tiến trình vào RL trước.</li>
        <li>Cho tiến trình được chọn chạy đến thời điểm có việc kế tiếp, trừ thời gian còn lại của nó. Lặp lại đến khi mọi tiến trình xong.</li>
        <li>Vẽ Gantt theo cột “CPU”. <Must>WT = tổng các khoảng nằm trong RL</Must>. Kiểm tra: <Must>WT = lúc kết thúc − lúc vào − tổng CPU</Must>.</li>
      </Recipe>

      <h2>Làm mẫu trên đề mini</h2>
      <p className="note">Bài tập trong bài giảng: mỗi tiến trình chỉ dùng CPU 1 lần.</p>
      <Steps>
        <Step title="Đọc bảng">
          <ProcTable kind="basic" rows={BASICS.rows} />
        </Step>
        <Step title="Đi theo từng thời điểm">
          <p>Ô xanh là tiến trình được chọn: thời gian còn lại nhỏ nhất. Thời gian còn lại = CPU ban đầu − phần đã chạy.</p>
          <EventTable events={BASICS.events} />
          <Calc>t = 1: P1 đã chạy 0–1, còn 20 − 1 = 19 · P2 còn 5 · 5 &lt; 19 → P2 giành CPU</Calc>
        </Step>
        <Step title="Vẽ sơ đồ Gantt">
          <p>Chép cột “CPU” thành các ô liền nhau, ghi thời điểm dưới mỗi ranh giới.</p>
          <Gantt label="Gantt CPU: P1 0–1, P2 1–2, P3 2–5, P2 5–9, P1 9–12, P4 12–18, P1 18–34" rows={exampleRows(BASICS)} />
        </Step>
        <Step title="Tính thời gian chờ">
          <p>P1 vào RL lúc 0, chạy 0–1, rồi chờ 1–9 và 12–18.</p>
          <WaitTable ex={BASICS} />
        </Step>
      </Steps>
      <Final title="Đáp án đề mini">
        <Result>WT: P1 = 14, P2 = 3, P3 = 0, P4 = 0. Trung bình = {avgWait(BASICS)}.</Result>
      </Final>

      <h2>Dễ sai</h2>
      <Traps items={[
        "So thời gian CPU ban đầu thay vì thời gian còn lại: lúc 2, P2 còn 4 chứ không phải 5.",
        "Quên xét lại khi có tiến trình mới vào RL: SJF không độc quyền cho phép giành CPU ngay lúc đó.",
        "Cho giành CPU khi bằng nhau: chỉ giành khi ngắn hơn hẳn.",
        "Tính WT từ lúc 0 thay vì từ thời điểm tiến trình vào RL.",
      ]} />
    </section>
  );
}
