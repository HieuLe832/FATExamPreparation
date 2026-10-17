import { EventTable, Gantt, ProcTable, WaitTable, avgWait, exampleRows } from "../components/Schedule.jsx";
import { Ask, Calc, Final, Must, PageHead, Recipe, Result, Step, Steps, Table, Traps } from "../components/Study.jsx";
import { MINI_DEVICE } from "../proc/exercises.js";
import { RealDevice } from "./ProcReal.jsx";

export default function ProcDevice() {
  return (
    <section>
      <PageHead tag="Tiến trình · Bài 1" title="Bài 1: CPU theo SJF, thiết bị R1 theo FIFO" />
      <Ask
        given="Bảng 4 tiến trình; mỗi lần IO ghi thời gian và thiết bị (R1, R2 hoặc Null). Mỗi loại thiết bị chỉ có 1 thể hiện."
        asks="Vẽ sơ đồ điều phối CPU (SJF không độc quyền) và tài nguyên R1 (FIFO). Tính thời gian chờ (WT) mỗi tiến trình."
      />

      <h2>Hiểu nhanh</h2>
      <p>Giống bài 2, chỉ khác một điều: <b>mỗi thiết bị chỉ có 1 cái</b>. Thiết bị đang có tiến trình dùng thì tiến trình đến sau phải xếp hàng chờ.</p>
      <Table
        head={["", "CPU", "Thiết bị R1, R2"]}
        rows={[
          [<b>Chiến lược</b>, "SJF không độc quyền", "FIFO"],
          [<b>Chọn ai</b>, "còn lại ít nhất", "xin trước thì dùng trước"],
          [<b>Bị giành giữa chừng</b>, "có, khi có tiến trình ngắn hơn hẳn", "không"],
          [<b>Hàng chờ</b>, "Ready List", "hàng chờ riêng của thiết bị"],
          [<b>Tính vào WT</b>, "có", "không"],
        ]}
      />

      <h2>Cách giải</h2>
      <Recipe skip="Thời gian xếp hàng chờ thiết bị: chỉ dùng để kiểm tra WT, đề không hỏi riêng.">
        <li>Làm như bài 2, ghi thêm cho mỗi thiết bị: ai đang dùng, đến lúc nào, ai đang xếp hàng.</li>
        <li>Xong lượt CPU, cần thiết bị R: <Must>R rảnh → dùng ngay; R bận → xếp cuối hàng chờ R</Must>.</li>
        <li>Tiến trình xong thiết bị thì quay lại RL, và <Must>thiết bị chuyển ngay cho tiến trình đầu hàng</Must>.</li>
        <li><Must>Thời gian 0 hoặc Null: không có lượt đó</Must>, tiến trình đi thẳng sang cột kế tiếp hoặc kết thúc.</li>
        <li>Vẽ Gantt CPU và một hàng cho R1. Vẽ thêm R2 để biết lúc tiến trình quay lại.</li>
        <li><Must>WT chỉ đếm thời gian nằm trong RL</Must>. Kiểm tra: <Must>WT = kết thúc − vào − tổng CPU − tổng I/O − thời gian xếp hàng chờ thiết bị</Must>.</li>
      </Recipe>

      <h2>Làm mẫu trên đề mini</h2>
      <p className="note">Ví dụ trong bài giảng (CPU: SJF, IO: FCFS, tức FIFO).</p>
      <Steps>
        <Step title="Đọc bảng">
          <ProcTable kind="device" rows={MINI_DEVICE.rows} />
          <p>P1: CPU 5 → R1 2 → CPU 2 → R2 2. P2: CPU 1 → R1 10 → CPU 1 → R1 4. P3: CPU 8 → R2 1.</p>
        </Step>
        <Step title="Đi theo từng thời điểm">
          <EventTable events={MINI_DEVICE.events} />
          <Calc>t = 6: P1 cần R1, nhưng P2 dùng R1 3–13 → P1 chờ đến 13, CPU không có ai → rảnh 6–10</Calc>
          <Calc>t = 15: P3 đã chạy 10–13 và 14–15, còn 8 − 4 = 4 · P1 về với 2 → P1 giành CPU</Calc>
        </Step>
        <Step title="Vẽ sơ đồ CPU, R1, R2">
          <Gantt label="Gantt. CPU: P1 0–2, P2 2–3, P1 3–6, rảnh 6–10, P3 10–13, P2 13–14, P3 14–15, P1 15–17, P3 17–21. R1: P2 3–13, P1 13–15, P2 15–19. R2: P1 17–19, P3 21–22"
            rows={exampleRows(MINI_DEVICE)} />
        </Step>
        <Step title="Tính thời gian chờ">
          <WaitTable ex={MINI_DEVICE} />
          <Calc>P1 xếp hàng chờ R1 từ 6 đến 13 = 7 · P2 chờ R1 từ 14 đến 15 = 1 · P3 không chờ thiết bị</Calc>
        </Step>
      </Steps>
      <Final title="Đáp án đề mini">
        <Result>WT: P1 = 1, P2 = 0, P3 = 3. Trung bình = {avgWait(MINI_DEVICE)}.</Result>
      </Final>

      <h2>Làm trên đề thật</h2>
      <RealDevice />

      <h2>Dễ sai</h2>
      <Traps items={[
        "Cho tiến trình dùng thiết bị khi thiết bị đang bận: mỗi thiết bị chỉ có 1 cái, phải xếp hàng.",
        "Cộng thời gian xếp hàng chờ thiết bị vào WT: WT chỉ tính thời gian nằm trong RL.",
        "Quên chuyển thiết bị cho người đầu hàng ngay lúc người trước xong.",
        "Coi “0 Null” là một lượt I/O: không có lượt đó, tiến trình kết thúc luôn.",
        "Chỉ vẽ CPU: đề hỏi cả sơ đồ R1.",
      ]} />
    </section>
  );
}
