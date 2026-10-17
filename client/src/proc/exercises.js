// The process tables of every worked example, and their hand-written answers. The pages draw the tables,
// Gantt charts and event lists from here; sjf.test.js checks every answer against the simulator in sjf.js.
//
// Answers: `cpu` and `devices` are Gantt segments [start, end, process] (null = CPU idle), `io` the private
// I/O of each process (Bài 2), `waits` the times each process sat in the Ready List, `wait` their sums (WT).
// `events` is the step-by-step list: t, what happens, the processes competing for the CPU with the CPU time
// they have left, and who gets the CPU (null = idle, undefined = nothing left to run).

/** Rows of a table shaped like Bài tập 1: [P, arrive, CPU1, IO1 time, IO1 device, CPU2, IO2 time, IO2 device]. */
const fromDeviceRows = (rows) => rows.map(([id, arrive, c1, t1, d1, c2, t2, d2]) => ({
  id, arrive,
  bursts: [{ cpu: c1 }, { io: t1, dev: d1 === "Null" ? null : d1 }, { cpu: c2 }, { io: t2, dev: d2 === "Null" ? null : d2 }],
}));

/** Rows of a table shaped like Bài tập 2: [P, arrive, CPU1, IO1, CPU2, IO2, CPU3]; blank cells are null. */
const fromPlainRows = (rows) => rows.map(([id, arrive, ...rest]) => ({
  id, arrive,
  bursts: rest.filter((x) => x !== null).map((x, i) => (i % 2 === 0 ? { cpu: x } : { io: x, dev: null })),
}));

// Basics page: the lecture's single-burst exercise (each process uses the CPU once).
const BASICS_ROWS = [["P1", 0, 20], ["P2", 1, 5], ["P3", 2, 3], ["P4", 12, 6]];
export const BASICS = {
  rows: BASICS_ROWS,
  procs: BASICS_ROWS.map(([id, arrive, cpu]) => ({ id, arrive, bursts: [{ cpu }] })),
  cpu: [[0, 1, "P1"], [1, 2, "P2"], [2, 5, "P3"], [5, 9, "P2"], [9, 12, "P1"], [12, 18, "P4"], [18, 34, "P1"]],
  waits: { P1: [[1, 9], [12, 18]], P2: [[2, 5]], P3: [], P4: [] },
  wait: { P1: 14, P2: 3, P3: 0, P4: 0 },
  finish: { P1: 34, P2: 9, P3: 5, P4: 18 },
  events: [
    { t: 0, what: "P1 vào RL", cands: [["P1", 20]], cpu: "P1" },
    { t: 1, what: "P2 vào RL", cands: [["P1", 19], ["P2", 5]], cpu: "P2" },
    { t: 2, what: "P3 vào RL", cands: [["P1", 19], ["P2", 4], ["P3", 3]], cpu: "P3" },
    { t: 5, what: "P3 xong", cands: [["P1", 19], ["P2", 4]], cpu: "P2" },
    { t: 9, what: "P2 xong", cands: [["P1", 19]], cpu: "P1" },
    { t: 12, what: "P4 vào RL", cands: [["P1", 16], ["P4", 6]], cpu: "P4" },
    { t: 18, what: "P4 xong", cands: [["P1", 16]], cpu: "P1" },
    { t: 34, what: "P1 xong", cands: [] },
  ],
};

// Bài 2 page, mini: several CPU bursts, I/O without a shared device.
const MINI_PLAIN_ROWS = [["P1", 0, 4, 3, 2], ["P2", 1, 2, 1, 1], ["P3", 2, 4]];
export const MINI_PLAIN = {
  rows: MINI_PLAIN_ROWS,
  procs: fromPlainRows(MINI_PLAIN_ROWS),
  cpu: [[0, 1, "P1"], [1, 3, "P2"], [3, 4, "P1"], [4, 5, "P2"], [5, 7, "P1"], [7, 11, "P3"], [11, 13, "P1"]],
  io: { P1: [[7, 10, "P1"]], P2: [[3, 4, "P2"]] },
  waits: { P1: [[1, 3], [4, 5], [10, 11]], P2: [], P3: [[2, 7]] },
  wait: { P1: 4, P2: 0, P3: 5 },
  finish: { P1: 13, P2: 5, P3: 11 },
  events: [
    { t: 0, what: "P1 vào RL", cands: [["P1", 4]], cpu: "P1" },
    { t: 1, what: "P2 vào RL", cands: [["P1", 3], ["P2", 2]], cpu: "P2" },
    { t: 2, what: "P3 vào RL", cands: [["P1", 3], ["P2", 1], ["P3", 4]], cpu: "P2" },
    { t: 3, what: "P2 xong CPU lần 1, đi I/O 1 (3–4)", cands: [["P1", 3], ["P3", 4]], cpu: "P1" },
    { t: 4, what: "P2 xong I/O, quay lại RL với CPU lần 2 = 1", cands: [["P1", 2], ["P3", 4], ["P2", 1]], cpu: "P2" },
    { t: 5, what: "P2 xong CPU lần 2: kết thúc", cands: [["P1", 2], ["P3", 4]], cpu: "P1" },
    { t: 7, what: "P1 xong CPU lần 1, đi I/O 3 (7–10)", cands: [["P3", 4]], cpu: "P3" },
    { t: 10, what: "P1 xong I/O, quay lại RL với CPU lần 2 = 2", cands: [["P3", 1], ["P1", 2]], cpu: "P3" },
    { t: 11, what: "P3 kết thúc", cands: [["P1", 2]], cpu: "P1" },
    { t: 13, what: "P1 kết thúc", cands: [] },
  ],
};

// Bài 1 page, mini: the lecture's example with devices (CPU: SJF, devices: FIFO).
const MINI_DEVICE_ROWS = [
  ["P1", 0, 5, 2, "R1", 2, 2, "R2"],
  ["P2", 2, 1, 10, "R1", 1, 4, "R1"],
  ["P3", 10, 8, 1, "R2", 0, 0, "Null"],
];
export const MINI_DEVICE = {
  rows: MINI_DEVICE_ROWS,
  procs: fromDeviceRows(MINI_DEVICE_ROWS),
  cpu: [[0, 2, "P1"], [2, 3, "P2"], [3, 6, "P1"], [6, 10, null], [10, 13, "P3"], [13, 14, "P2"], [14, 15, "P3"], [15, 17, "P1"], [17, 21, "P3"]],
  devices: { R1: [[3, 13, "P2"], [13, 15, "P1"], [15, 19, "P2"]], R2: [[17, 19, "P1"], [21, 22, "P3"]] },
  waits: { P1: [[2, 3]], P2: [], P3: [[13, 14], [15, 17]] },
  wait: { P1: 1, P2: 0, P3: 3 },
  finish: { P1: 19, P2: 19, P3: 22 },
  // Time spent queuing for a busy device, for the check WT = end − arrive − CPU − I/O − device queue.
  queued: { P1: 7, P2: 1, P3: 0 },
  events: [
    { t: 0, what: "P1 vào RL", cands: [["P1", 5]], cpu: "P1" },
    { t: 2, what: "P2 vào RL", cands: [["P1", 3], ["P2", 1]], cpu: "P2" },
    { t: 3, what: "P2 xong CPU lần 1, cần R1. R1 rảnh: P2 dùng R1 3–13", cands: [["P1", 3]], cpu: "P1" },
    { t: 6, what: "P1 xong CPU lần 1, cần R1. R1 bận đến 13: P1 xếp hàng chờ R1", cands: [], cpu: null },
    { t: 10, what: "P3 vào RL", cands: [["P3", 8]], cpu: "P3" },
    { t: 13, what: "P2 xong R1, quay lại RL với CPU lần 2 = 1. R1 chuyển cho P1: 13–15", cands: [["P3", 5], ["P2", 1]], cpu: "P2" },
    { t: 14, what: "P2 xong CPU lần 2, cần R1. R1 bận đến 15: P2 xếp hàng", cands: [["P3", 5]], cpu: "P3" },
    { t: 15, what: "P1 xong R1, quay lại RL với CPU lần 2 = 2. R1 chuyển cho P2: 15–19", cands: [["P3", 4], ["P1", 2]], cpu: "P1" },
    { t: 17, what: "P1 xong CPU lần 2, cần R2. R2 rảnh: P1 dùng R2 17–19", cands: [["P3", 4]], cpu: "P3" },
    { t: 19, what: "P1 xong R2: kết thúc. P2 xong R1: kết thúc", cands: [["P3", 2]], cpu: "P3" },
    { t: 21, what: "P3 xong CPU lần 1, cần R2. R2 rảnh: P3 dùng R2 21–22", cands: [] },
    { t: 22, what: "P3 xong R2: kết thúc", cands: [] },
  ],
};

// Baitap_QLTT, Bài tập 1, as printed.
export const REAL_DEVICE_ROWS = [
  ["P1", 0, 8, 5, "R1", 1, 0, "Null"],
  ["P2", 2, 1, 8, "R2", 2, 5, "R1"],
  ["P3", 10, 6, 5, "R1", 2, 3, "R2"],
  ["P4", 11, 3, 20, "R2", 0, 0, "Null"],
];
export const REAL_DEVICE = {
  rows: REAL_DEVICE_ROWS,
  procs: fromDeviceRows(REAL_DEVICE_ROWS),
  cpu: [[0, 2, "P1"], [2, 3, "P2"], [3, 9, "P1"], [9, 10, null], [10, 11, "P3"], [11, 13, "P2"], [13, 14, "P4"], [14, 15, "P1"],
    [15, 17, "P4"], [17, 22, "P3"], [22, 27, null], [27, 29, "P3"]],
  devices: { R1: [[9, 14, "P1"], [14, 19, "P2"], [22, 27, "P3"]], R2: [[3, 11, "P2"], [17, 37, "P4"], [37, 40, "P3"]] },
  waits: { P1: [[2, 3]], P2: [], P3: [[11, 17]], P4: [[11, 13], [14, 15]] },
  wait: { P1: 1, P2: 0, P3: 6, P4: 3 },
  finish: { P1: 15, P2: 19, P3: 40, P4: 37 },
  queued: { P1: 0, P2: 1, P3: 8, P4: 0 },
  events: [
    { t: 0, what: "P1 vào RL", cands: [["P1", 8]], cpu: "P1" },
    { t: 2, what: "P2 vào RL", cands: [["P1", 6], ["P2", 1]], cpu: "P2" },
    { t: 3, what: "P2 xong CPU lần 1, cần R2. R2 rảnh: P2 dùng R2 3–11", cands: [["P1", 6]], cpu: "P1" },
    { t: 9, what: "P1 xong CPU lần 1, cần R1. R1 rảnh: P1 dùng R1 9–14", cands: [], cpu: null },
    { t: 10, what: "P3 vào RL", cands: [["P3", 6]], cpu: "P3" },
    { t: 11, what: "P4 vào RL. P2 xong R2, quay lại RL với CPU lần 2 = 2", cands: [["P3", 5], ["P4", 3], ["P2", 2]], cpu: "P2" },
    { t: 13, what: "P2 xong CPU lần 2, cần R1. R1 bận đến 14: P2 xếp hàng chờ R1", cands: [["P3", 5], ["P4", 3]], cpu: "P4" },
    { t: 14, what: "P1 xong R1, quay lại RL với CPU lần 2 = 1. R1 chuyển cho P2: 14–19", cands: [["P3", 5], ["P4", 2], ["P1", 1]], cpu: "P1" },
    { t: 15, what: "P1 xong CPU lần 2; IO lần 2 = 0: kết thúc", cands: [["P3", 5], ["P4", 2]], cpu: "P4" },
    { t: 17, what: "P4 xong CPU lần 1, cần R2. R2 rảnh: P4 dùng R2 17–37", cands: [["P3", 5]], cpu: "P3" },
    { t: 19, what: "P2 xong R1: kết thúc", cands: [["P3", 3]], cpu: "P3" },
    { t: 22, what: "P3 xong CPU lần 1, cần R1. R1 rảnh: P3 dùng R1 22–27", cands: [], cpu: null },
    { t: 27, what: "P3 xong R1, quay lại RL với CPU lần 2 = 2", cands: [["P3", 2]], cpu: "P3" },
    { t: 29, what: "P3 xong CPU lần 2, cần R2. R2 bận đến 37: P3 xếp hàng chờ R2", cands: [] },
    { t: 37, what: "P4 xong R2; CPU lần 2 = 0: kết thúc. R2 chuyển cho P3: 37–40", cands: [] },
    { t: 40, what: "P3 xong R2: kết thúc", cands: [] },
  ],
};

// Baitap_QLTT, Bài tập 2, as printed (blank cells are null).
export const REAL_PLAIN_ROWS = [
  ["P1", 0, 2, 4, 3, null, null],
  ["P2", 3, 6, 3, 2, 3, 2],
  ["P3", 4, 4, 4, 2, null, null],
  ["P4", 4, 3, 4, 1, 3, 2],
];
export const REAL_PLAIN = {
  rows: REAL_PLAIN_ROWS,
  procs: fromPlainRows(REAL_PLAIN_ROWS),
  cpu: [[0, 2, "P1"], [2, 3, null], [3, 4, "P2"], [4, 7, "P4"], [7, 10, "P1"], [10, 11, "P3"], [11, 12, "P4"], [12, 15, "P3"],
    [15, 17, "P4"], [17, 19, "P2"], [19, 21, "P3"], [21, 24, "P2"], [24, 27, null], [27, 29, "P2"], [29, 32, null], [32, 34, "P2"]],
  io: { P1: [[2, 6, "P1"]], P2: [[24, 27, "P2"], [29, 32, "P2"]], P3: [[15, 19, "P3"]], P4: [[7, 11, "P4"], [12, 15, "P4"]] },
  waits: { P1: [[6, 7]], P2: [[4, 17], [19, 21]], P3: [[4, 10], [11, 12]], P4: [] },
  wait: { P1: 1, P2: 15, P3: 7, P4: 0 },
  finish: { P1: 10, P2: 34, P3: 21, P4: 17 },
  events: [
    { t: 0, what: "P1 vào RL", cands: [["P1", 2]], cpu: "P1" },
    { t: 2, what: "P1 xong CPU lần 1, đi I/O 4 (2–6)", cands: [], cpu: null },
    { t: 3, what: "P2 vào RL", cands: [["P2", 6]], cpu: "P2" },
    { t: 4, what: "P3 và P4 vào RL", cands: [["P2", 5], ["P3", 4], ["P4", 3]], cpu: "P4" },
    { t: 6, what: "P1 xong I/O, quay lại RL với CPU lần 2 = 3", cands: [["P2", 5], ["P3", 4], ["P4", 1], ["P1", 3]], cpu: "P4" },
    { t: 7, what: "P4 xong CPU lần 1, đi I/O 4 (7–11)", cands: [["P2", 5], ["P3", 4], ["P1", 3]], cpu: "P1" },
    { t: 10, what: "P1 xong CPU lần 2: kết thúc", cands: [["P2", 5], ["P3", 4]], cpu: "P3" },
    { t: 11, what: "P4 xong I/O, quay lại RL với CPU lần 2 = 1", cands: [["P2", 5], ["P3", 3], ["P4", 1]], cpu: "P4" },
    { t: 12, what: "P4 xong CPU lần 2, đi I/O 3 (12–15)", cands: [["P2", 5], ["P3", 3]], cpu: "P3" },
    { t: 15, what: "P3 xong CPU lần 1, đi I/O 4 (15–19). P4 xong I/O, quay lại RL với CPU lần 3 = 2", cands: [["P2", 5], ["P4", 2]], cpu: "P4" },
    { t: 17, what: "P4 xong CPU lần 3: kết thúc", cands: [["P2", 5]], cpu: "P2" },
    { t: 19, what: "P3 xong I/O, quay lại RL với CPU lần 2 = 2", cands: [["P2", 3], ["P3", 2]], cpu: "P3" },
    { t: 21, what: "P3 xong CPU lần 2: kết thúc", cands: [["P2", 3]], cpu: "P2" },
    { t: 24, what: "P2 xong CPU lần 1, đi I/O 3 (24–27)", cands: [], cpu: null },
    { t: 27, what: "P2 xong I/O, quay lại RL với CPU lần 2 = 2", cands: [["P2", 2]], cpu: "P2" },
    { t: 29, what: "P2 xong CPU lần 2, đi I/O 3 (29–32)", cands: [], cpu: null },
    { t: 32, what: "P2 xong I/O, quay lại RL với CPU lần 3 = 2", cands: [["P2", 2]], cpu: "P2" },
    { t: 34, what: "P2 xong CPU lần 3: kết thúc", cands: [] },
  ],
};

export const EXAMPLES = { BASICS, MINI_PLAIN, MINI_DEVICE, REAL_DEVICE, REAL_PLAIN };
