// Baitap_QLTT, one block per exercise, shown at the end of its page: the exam quoted as text (<Exam>), then
// the worked answer. Every number comes from src/proc/exercises.js, which sjf.test.js checks against the
// simulator.
import { EventTable, Gantt, ProcTable, WaitTable, avgWait, exampleRows } from "../components/Schedule.jsx";
import { Calc, Exam, Final, Real, Result } from "../components/Study.jsx";
import { REAL_DEVICE, REAL_PLAIN } from "../proc/exercises.js";

export function RealPlain() {
  return (
    <Real>
      <Exam>
        <p><b>Bài tập 2:</b> Thực hiện điều phối theo chiến lược <b>SJF không độc quyền</b> cho các tiến trình sau:</p>
        <ProcTable kind="plain" rows={REAL_PLAIN.rows} />
        <ol type="a">
          <li>Trình bày quá trình điều phối và vẽ sơ đồ điều phối (sơ đồ Gant).</li>
          <li>Tính thời gian chờ cho các tiến trình.</li>
        </ol>
      </Exam>
      <p>Đề không ghi thiết bị, nên I/O của các tiến trình chạy cùng lúc, không ai chờ ai. Ô trống trong bảng: tiến trình không có lượt đó (P1, P3 kết thúc sau CPU lần 2).</p>

      <h3>a) Quá trình điều phối</h3>
      <EventTable events={REAL_PLAIN.events} />
      <Calc>t = 4: P2 đã chạy 3–4, còn 6 − 1 = 5 · P3 còn 4 · P4 còn 3 → P4</Calc>
      <Calc>t = 6: P4 đã chạy 4–6, còn 3 − 2 = 1 · P1 về với 3 · 3 &gt; 1 → P4 giữ CPU</Calc>
      <Calc>t = 19: P2 đã chạy 17–19, còn 5 − 2 = 3 · P3 về với 2 · 2 &lt; 3 → P3 giành CPU</Calc>

      <h3>a) Sơ đồ Gantt</h3>
      <Gantt label="Gantt bài 2: P1 0–2, rảnh 2–3, P2 3–4, P4 4–7, P1 7–10, P3 10–11, P4 11–12, P3 12–15, P4 15–17, P2 17–19, P3 19–21, P2 21–24, rảnh 24–27, P2 27–29, rảnh 29–32, P2 32–34"
        rows={exampleRows(REAL_PLAIN)} />
      <p className="note">Bài chỉ hỏi hàng CPU. Các hàng I/O vẽ thêm để thấy lúc mỗi tiến trình quay lại RL.</p>

      <h3>b) Thời gian chờ</h3>
      <WaitTable ex={REAL_PLAIN} />
      <Final title="Đáp án bài 2">
        <Result>WT: P1 = 1, P2 = 15, P3 = 7, P4 = 0. Trung bình = {avgWait(REAL_PLAIN)}.</Result>
      </Final>
    </Real>
  );
}

export function RealDevice() {
  return (
    <Real>
      <Exam>
        <p><b>Bài tập 1:</b> Xét tập các tiến trình sau</p>
        <ProcTable kind="device" rows={REAL_DEVICE.rows} />
        <p>Biết rằng mỗi loại thiết bị IO chỉ có 1 thể hiện, và trong mỗi chu kỳ IO, mỗi tiến trình yêu cầu 1 thể hiện duy nhất của một loại thiết bị.</p>
        <p>Hãy vẽ sơ đồ điều phối CPU (sử dụng chiến lược SJF không độc quyền), và tài nguyên R1 (sử dụng chiến lược FIFO) cho các tiến trình. Tính thời gian chờ (WT) mỗi tiến trình.</p>
      </Exam>
      <p>Thời gian 0 và thiết bị Null: không có lượt đó. P1 kết thúc ngay sau CPU lần 2; P4 kết thúc ngay sau IO lần 1.</p>

      <h3>Quá trình điều phối</h3>
      <EventTable events={REAL_DEVICE.events} />
      <Calc>t = 11: P3 đã chạy 10–11, còn 6 − 1 = 5 · P4 còn 3 · P2 về với 2 → P2</Calc>
      <Calc>t = 13: P2 cần R1, nhưng P1 dùng R1 9–14 → P2 xếp hàng, dùng R1 từ 14</Calc>
      <Calc>t = 14: P4 đã chạy 13–14, còn 3 − 1 = 2 · P1 về với 1 · 1 &lt; 2 → P1 giành CPU</Calc>

      <h3>Sơ đồ điều phối CPU và R1</h3>
      <Gantt label="Gantt bài 1. CPU: P1 0–2, P2 2–3, P1 3–9, rảnh 9–10, P3 10–11, P2 11–13, P4 13–14, P1 14–15, P4 15–17, P3 17–22, rảnh 22–27, P3 27–29. R1: P1 9–14, P2 14–19, P3 22–27. R2: P2 3–11, P4 17–37, P3 37–40"
        rows={exampleRows(REAL_DEVICE)} />
      <p className="note">Đề chỉ hỏi CPU và R1. Hàng R2 vẽ thêm để biết lúc P2, P4, P3 xong I/O.</p>

      <h3>Thời gian chờ</h3>
      <WaitTable ex={REAL_DEVICE} />
      <Calc>P3 xếp hàng chờ R2 từ 29 (lúc xin) đến 37 (lúc P4 trả) = 8 · P2 chờ R1 từ 13 đến 14 = 1</Calc>
      <Final title="Đáp án bài 1">
        <Result>WT: P1 = 1, P2 = 0, P3 = 6, P4 = 3. Trung bình = {avgWait(REAL_DEVICE)}.</Result>
      </Final>
    </Real>
  );
}
