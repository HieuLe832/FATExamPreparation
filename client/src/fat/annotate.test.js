// Pins the transcribed dumps to the answers shown on the page. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DUMPS, parseHex, DATA_START } from "./dumps.js";
import { annotate, decodeEntry, le } from "./annotate.js";

const bytes = (k) => parseHex(DUMPS[k].hex);

test("every dump is whole rows and every byte belongs to exactly one segment", () => {
  for (const [k, d] of Object.entries(DUMPS)) {
    const b = bytes(k);
    assert.equal(b.length % 16, 0, k);
    const owner = new Array(b.length).fill(0);
    for (const s of annotate(d.kind, b, d.base)) for (let i = 0; i < s.len; i++) owner[s.start + i]++;
    assert.ok(owner.every((n) => n === 1), `${k}: overlapping or uncovered bytes`);
    const pick = d.pick - d.base;
    assert.ok(pick >= 0 && pick < b.length, `${k}: pick outside dump`);
  }
});

test("MBR: 4 contiguous partitions, #2 is active NTFS", () => {
  const b = bytes("mbr");
  const parts = [0, 1, 2, 3].map((p) => {
    const e = 0x0e + p * 16;
    return { active: b[e] === 0x80, type: b[e + 4], start: le(b, e + 8, 4), count: le(b, e + 12, 4) };
  });
  assert.deepEqual(parts.map((p) => p.type), [0xde, 0x07, 0x83, 0x0f]);
  assert.deepEqual(parts.map((p) => p.active), [false, true, false, false]);
  assert.deepEqual(parts.map((p) => p.count), [96327, 36869175, 14346045, 62958735]);
  for (let i = 1; i < 4; i++) assert.equal(parts[i].start, parts[i - 1].start + parts[i - 1].count);
  assert.deepEqual([b[0x4e], b[0x4f]], [0x55, 0xaa]);
});

test("boot sector: layout answers of 2a", () => {
  const b = bytes("boot");
  const SB = le(b, 0x0e, 2), NF = b[0x10], SF = le(b, 0x24, 4);
  assert.equal(le(b, 0x0b, 2), 512);
  assert.equal(b[0x0d], 4);
  assert.equal(SB, 38);
  assert.equal(NF, 2);
  assert.equal(SF, 813);
  assert.equal(le(b, 0x20, 4), 417627);
  assert.equal(le(b, 0x2c, 4), 2);
  assert.equal(String.fromCharCode(...b.slice(0x52, 0x57)), "FAT32");
  assert.equal(SB + NF * SF, DATA_START);
});

test("FAT chains and first free cluster", () => {
  const b = bytes("fat");
  const fat = (k) => le(b, 4 * k, 4) & 0x0fffffff;
  const chain = (k) => { const out = [k]; while (fat(k) < 0x0ffffff8) out.push((k = fat(k))); return out; };
  assert.deepEqual(chain(6), [6, 7, 8, 9]);
  assert.deepEqual(chain(18), [18, 19]);
  assert.deepEqual(chain(20), [20]);
  assert.deepEqual(chain(21), [21, 22]);
  assert.deepEqual(chain(23), [23, 24]);
  assert.deepEqual(chain(25), [25]);
  const free = [];
  for (let k = 2; k < 32 && free.length < 2; k++) if (fat(k) === 0) free.push(k);
  assert.deepEqual(free, [11, 12]);
});

test("directory entries decode to the tree of 2b", () => {
  const live = (k) => {
    const b = bytes(k), out = [];
    for (let e = 0; e < b.length; e += 32) {
      const d = decodeEntry(b, e);
      if (d.kind === "main" && !d.deleted && !(d.attr & 0x08)) out.push([d.name, d.attr, d.cluster, d.size]);
    }
    return out;
  };
  assert.deepEqual(live("rdet"), [
    ["EXTERNAL.DLL", 0x20, 6, 7680], ["EXTSUP~1.TPL", 0x20, 18, 2321], ["TMC1", 0x10, 20, 0], ["TMC2", 0x10, 25, 0],
  ]);
  assert.deepEqual(live("tmc1"), [[".", 0x10, 20, 0], ["..", 0x10, 0, 0], ["SAMPLE~1.WHS", 0x20, 21, 2051], ["TIMEZONE.DAT", 0x20, 23, 2400]]);
  assert.deepEqual(live("tmc2"), [[".", 0x10, 25, 0], ["..", 0x10, 0, 0]]);

  const r = bytes("rdet"), t = bytes("tmc1");
  assert.equal(decodeEntry(r, 0xc0).chars + decodeEntry(r, 0xa0).chars, "Ext Superblock.tpl");
  assert.equal(decodeEntry(t, 0x60).chars + decodeEntry(t, 0x40).chars, "Sample script.whs");
  assert.equal(DATA_START + (20 - 2) * 4, DUMPS.tmc1.base / 512);
  assert.equal(DATA_START + (25 - 2) * 4, DUMPS.tmc2.base / 512);
});
