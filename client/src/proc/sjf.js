// Preemptive SJF (shortest remaining time first) on one CPU, with FIFO I/O devices of one instance each.
// Used only by sjf.test.js to check the hand-written schedules in exercises.js; the pages never run it.
//
// A process is { id, arrive, bursts }, where bursts alternate CPU and I/O: [{ cpu: 8 }, { io: 5, dev: "R1" },
// { cpu: 1 }]. `dev: null` is I/O on the process's own device (no queue). Zero-length bursts are skipped.
// Rules, as the lecture applies them:
// - At each moment the CPU runs the ready process with the least CPU time left in its current burst.
// - A process entering the Ready List (new, or back from I/O) takes the CPU only if strictly shorter.
// - Equal times: the one already running keeps the CPU; otherwise the one that entered the RL first.
// - A device serves requests in the order they were made (FIFO); a busy device makes the process queue.
// - Waiting time (WT) = time spent in the Ready List, not running. I/O and device queues don't count.

/** Appends one time unit to a segment list, merging with the previous segment when it continues it. */
function extend(segs, t, id) {
  const last = segs[segs.length - 1];
  if (last && last[1] === t && last[2] === id) last[1] = t + 1;
  else segs.push([t, t + 1, id]);
}

export function scheduleSJF(procs) {
  const ps = procs.map((p, order) => ({ ...p, order, k: -1, left: 0, state: "new", since: 0, wait: 0, finish: null }));
  const cpuSegs = [], queues = {}, busy = {}, devices = {}, io = {}, waits = {};
  for (const p of procs) {
    waits[p.id] = [];
    for (const b of p.bursts) if (b.dev) { queues[b.dev] = []; busy[b.dev] = null; devices[b.dev] = []; }
  }
  let running = null, stamp = 0;

  const ready = (p, t) => { p.state = "ready"; p.since = t; p.stamp = stamp++; };
  // Moves p to its next non-empty burst at time t.
  const advance = (p, t) => {
    do p.k++; while (p.k < p.bursts.length && (p.bursts[p.k].cpu ?? p.bursts[p.k].io) === 0);
    const b = p.bursts[p.k];
    if (!b) { p.state = "done"; p.finish = t; return; }
    if (b.cpu) { p.left = b.cpu; ready(p, t); return; }
    p.left = b.io;
    if (b.dev) { p.state = "queued"; queues[b.dev].push(p); } else p.state = "io";
  };

  for (let t = 0; ps.some((p) => p.state !== "done"); t++) {
    if (t > 10000) throw new Error("schedule does not end");
    // 1. Bursts that ended at t: the CPU, then the devices, then private I/O.
    if (running && running.left === 0) { advance(running, t); running = null; }
    for (const d of Object.keys(busy)) {
      const p = busy[d];
      if (p && p.left === 0) { busy[d] = null; advance(p, t); }
    }
    for (const p of ps) if (p.state === "io" && p.left === 0) advance(p, t);
    // 2. Arrivals.
    for (const p of ps) if (p.state === "new" && p.arrive === t) advance(p, t);
    // 3. Free devices take the first process in their queue.
    for (const d of Object.keys(busy)) {
      if (!busy[d] && queues[d].length) { busy[d] = queues[d].shift(); busy[d].state = "device"; }
    }
    // 4. The CPU goes to the shortest ready process; a running one is preempted only by a strictly shorter one.
    const best = ps.filter((p) => p.state === "ready")
      .sort((a, b) => a.left - b.left || a.stamp - b.stamp)[0];
    if (best && (!running || best.left < running.left)) {
      if (running) ready(running, t);
      running = best;
      running.state = "running";
      if (running.since < t) waits[running.id].push([running.since, t]);
    }
    // 5. One time unit passes.
    extend(cpuSegs, t, running ? running.id : null);
    if (running) running.left--;
    for (const d of Object.keys(busy)) if (busy[d]) { extend(devices[d], t, busy[d].id); busy[d].left--; }
    for (const p of ps) {
      if (p.state === "ready") p.wait++;
      if (p.state === "io") { extend(io[p.id] ??= [], t, p.id); p.left--; }
    }
  }
  // Idle time after the last CPU burst is not part of the chart.
  while (cpuSegs.length && cpuSegs[cpuSegs.length - 1][2] === null) cpuSegs.pop();

  return {
    cpu: cpuSegs,
    devices,
    io,
    waits,
    wait: Object.fromEntries(ps.map((p) => [p.id, p.wait])),
    finish: Object.fromEntries(ps.map((p) => [p.id, p.finish])),
  };
}
