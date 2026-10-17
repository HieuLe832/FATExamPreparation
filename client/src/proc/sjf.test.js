// Pins every hand-written schedule in exercises.js (Gantt segments, waiting times, the event lists) to the
// simulator in sjf.js, so a typo in an answer fails here instead of reaching the page.
import assert from "node:assert/strict";
import { test } from "node:test";
import { scheduleSJF } from "./sjf.js";
import { EXAMPLES } from "./exercises.js";

const sum = (xs) => xs.reduce((a, b) => a + b, 0);

for (const [name, ex] of Object.entries(EXAMPLES)) {
  const got = scheduleSJF(ex.procs);

  test(`${name}: CPU and device charts`, () => {
    assert.deepEqual(got.cpu, ex.cpu);
    assert.deepEqual(got.devices, ex.devices ?? {});
    assert.deepEqual(got.io, ex.io ?? {});
  });

  test(`${name}: waiting times`, () => {
    assert.deepEqual(got.waits, ex.waits);
    assert.deepEqual(got.wait, ex.wait);
    assert.deepEqual(got.finish, ex.finish);
    for (const [id, spans] of Object.entries(ex.waits)) assert.equal(sum(spans.map(([a, b]) => b - a)), ex.wait[id], id);
  });

  test(`${name}: WT = end − arrive − CPU − I/O − device queue`, () => {
    for (const p of ex.procs) {
      const cpu = sum(p.bursts.map((b) => b.cpu ?? 0)), io = sum(p.bursts.map((b) => b.io ?? 0));
      assert.equal(ex.finish[p.id] - p.arrive - cpu - io - (ex.queued?.[p.id] ?? 0), ex.wait[p.id], p.id);
    }
  });

  test(`${name}: each event picks the shortest and matches the chart`, () => {
    const at = (t) => got.cpu.find(([a, b]) => a <= t && t < b);
    for (const e of ex.events) {
      if (e.cpu === undefined) { assert.ok(!at(e.t) || at(e.t)[2] === null, `t=${e.t}`); continue; }
      assert.equal(at(e.t)?.[2] ?? null, e.cpu, `t=${e.t}`);
      if (e.cpu) assert.equal(Math.min(...e.cands.map(([, left]) => left)), e.cands.find(([id]) => id === e.cpu)[1], `t=${e.t}`);
      else assert.equal(e.cands.length, 0, `t=${e.t}`);
    }
    assert.deepEqual(ex.events.map((e) => e.t), [...new Set(ex.events.map((e) => e.t))].sort((a, b) => a - b));
  });
}
