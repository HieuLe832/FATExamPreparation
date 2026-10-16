// Pins the mini practice disk to the answers shown on the page. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseHex, DATA_START, SECTORS_PER_CLUSTER, FAT_START_OFFSET } from "./dumps.js";
import { annotate, decodeEntry, entryRows, fatCells, focusNotes, le, whereText } from "./annotate.js";

// The dumps are the backend's data; the decoders that read them live here.
const json = JSON.parse(readFileSync(new URL("../../../server/Data/hex-dumps.json", import.meta.url), "utf8"));
const DUMPS = Object.fromEntries(json.map((d) => [d.id, { kind: d.kind, base: d.baseOffset, pick: d.pickOffset, hex: d.rows }]));
const bytes = (k) => parseHex(DUMPS[k].hex);
const sectorOf = (k) => DATA_START + (k - 2) * SECTORS_PER_CLUSTER;

test("every dump is whole rows and every byte belongs to exactly one segment", () => {
  for (const [k, d] of Object.entries(DUMPS)) {
    const b = bytes(k);
    assert.equal(b.length % 16, 0, k);
    const owner = new Array(b.length).fill(0);
    for (const s of annotate(d.kind, b, d.base)) for (let i = 0; i < s.len; i++) owner[s.start + i]++;
    assert.ok(owner.every((n) => n === 1), `${k}: overlapping or uncovered bytes`);
    assert.ok(d.pick >= d.base && d.pick < d.base + b.length, `${k}: pick outside dump`);
  }
});

test("mini MBR: 2 partitions, #1 active NTFS 1 GB, #2 Linux 512 MB", () => {
  const b = bytes("mbr");
  const parts = [0, 1, 2, 3].map((p) => {
    const e = 0x0e + p * 16;
    return { active: b[e] === 0x80, type: b[e + 4], start: le(b, e + 8, 4), count: le(b, e + 12, 4) };
  });
  assert.deepEqual(parts.map((p) => p.type), [0x07, 0x83, 0, 0]);
  assert.deepEqual(parts.map((p) => p.active), [true, false, false, false]);
  assert.deepEqual(parts.map((p) => p.start), [2048, 2099200, 0, 0]);
  assert.equal(parts[0].count * 512, 2 ** 30);
  assert.equal(parts[1].count * 512, 2 ** 29);
  assert.deepEqual([b[0x4e], b[0x4f]], [0x55, 0xaa]);
});

test("mini boot sector: SB 6, NF 2, SF 2, SC 2, data at 10", () => {
  const b = bytes("boot");
  const SB = le(b, 0x0e, 2), NF = b[0x10], SF = le(b, 0x24, 4);
  assert.deepEqual([le(b, 0x0b, 2), b[0x0d], SB, NF, SF, le(b, 0x20, 4), le(b, 0x2c, 4)], [512, 2, 6, 2, 2, 64, 2]);
  assert.equal(String.fromCharCode(...b.slice(0x52, 0x57)), "FAT32");
  assert.equal(SB + NF * SF, DATA_START);
  assert.equal(SB * 512, FAT_START_OFFSET);
  assert.equal(SB + SF, 8); // FAT2
  assert.equal(DUMPS.rdet.base / 512, sectorOf(2));
  assert.equal(DUMPS.docs.base / 512, sectorOf(5));
});

test("mini FAT chains and first free cluster", () => {
  const b = bytes("fat");
  const fat = (k) => le(b, 4 * k, 4) & 0x0fffffff;
  const chain = (k) => { const out = [k]; while (fat(k) < 0x0ffffff8) out.push((k = fat(k))); return out; };
  assert.deepEqual(chain(3), [3, 4]);
  assert.deepEqual(chain(5), [5]);
  assert.deepEqual(chain(7), [7, 9, 12]);
  assert.deepEqual(chain(8), [8]);
  assert.equal(fat(6), 0); // OLD.TXT was deleted, so its cluster is free again
  const free = [];
  for (let k = 2; k < 16; k++) if (fat(k) === 0) free.push(k);
  assert.equal(free[0], 6);
});

test("mini directories decode to the tree on the page", () => {
  const live = (k) => {
    const b = bytes(k), out = [];
    for (let e = 0; e < b.length; e += 32) {
      const d = decodeEntry(b, e);
      if (d.kind === "main" && !d.deleted && !(d.attr & 0x08)) out.push([d.name, d.attr, d.cluster, d.size]);
    }
    return out;
  };
  assert.deepEqual(live("rdet"), [["HELLO.TXT", 0x20, 3, 1280], ["BAITAP~1.DOC", 0x20, 8, 768], ["DOCS", 0x10, 5, 0]]);
  assert.deepEqual(live("docs"), [[".", 0x10, 5, 0], ["..", 0x10, 0, 0], ["NOTE.TXT", 0x20, 7, 2560]]);
  const r = bytes("rdet");
  assert.equal(decodeEntry(r, 0x40).chars, "Bai tap.doc");
  assert.equal(decodeEntry(r, 0xa0).deleted, true);
  assert.deepEqual([sectorOf(3), sectorOf(7), sectorOf(9), sectorOf(12), sectorOf(6)], [12, 20, 24, 30, 18]);
});

test("static notes under the dumps: fields, entry table, FAT cells", () => {
  const r = bytes("rdet"), base = DUMPS.rdet.base;
  const hello = focusNotes(annotate("dir", r, base), [[0x1420, 12], [0x1434, 2], [0x143a, 6]], base);
  assert.deepEqual(hello.map((x) => [x.start.toString(16), x.len]), [["1420", 8], ["1428", 3], ["142b", 1], ["1434", 2], ["143a", 2], ["143c", 4]]);
  assert.match(hello[4].calc, /= <b>3<\/b>/);
  assert.match(hello[5].calc, /= <b>1\u00a0280<\/b> byte/);
  const lfn = focusNotes(annotate("dir", r, base), [[0x1440, 12], [0x144e, 12], [0x145c, 4]], base);
  assert.deepEqual(lfn.map((x) => x.calc.split("→").pop().trim()), ["entry phụ số 1 (có cộng 40: là mảnh cuối của tên)", "“Bai t”", "<b>entry phụ</b> (mảnh tên dài)", "“ap.doc”", "hết tên"]);
  assert.equal(whereText(0x143a, 2), "dòng 00001430 · cột A–B");
  assert.equal(whereText(0x144e, 12), "dòng 00001440 cột E → dòng 00001450 cột 9");
  const rows = entryRows(r, base);
  assert.deepEqual(rows.map((x) => [x.at.toString(16), x.skip]), [["1400", true], ["1420", false], ["1440", false], ["1460", false], ["1480", false], ["14a0", true], ["14c0", true]]);
  assert.deepEqual(entryRows(bytes("docs"), DUMPS.docs.base).map((x) => x.skip), [true, true, false, true]);
  const cells = fatCells(bytes("fat"), DUMPS.fat.base);
  assert.deepEqual(cells.slice(2, 13).map((c) => c.text), ["hết", "→ 4", "hết", "hết", "trống", "→ 9", "hết", "→ 12", "trống", "trống", "hết"]);
});
