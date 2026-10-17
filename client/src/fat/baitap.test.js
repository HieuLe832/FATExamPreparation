// Pins the worked answers for the real exercise (sections/RealExercise.jsx) to the dumps transcribed from
// Baitap_HTTT.pdf (baitap.json, also quoted on the pages). Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseHex } from "./dumps.js";
import { decodeEntry, le } from "./annotate.js";

const json = JSON.parse(readFileSync(new URL("./baitap.json", import.meta.url), "utf8"));
const D = Object.fromEntries(json.map((d) => [d.id, { base: d.baseOffset, b: parseHex(d.rows) }]));
const at = (id, abs) => abs - D[id].base; // absolute offset in the PDF → index in the dump
const SB = 38, NF = 2, SF = 813, SC = 4, DATA = SB + NF * SF;
const sectors = (k) => [DATA + (k - 2) * SC, DATA + (k - 2) * SC + SC - 1];

test("dumps cover what the exam prints", () => {
  assert.equal(D.mbr.b.length, 512); // the whole sector, as in the PDF
  assert.deepEqual([D.mbr.b[510], D.mbr.b[511]], [0x55, 0xaa]);
  assert.deepEqual(json.map((d) => d.rows.length), [32, 7, 10, 22, 14, 6]);
  for (const d of json) assert.ok(d.rows.every((r) => r.split(" ").length === 16), d.id);
});

test("bài 1: 4 partitions, #2 active NTFS", () => {
  const { b } = D.mbr;
  const parts = [0x1be, 0x1ce, 0x1de, 0x1ee].map((o) => {
    const e = at("mbr", o);
    return { active: b[e], type: b[e + 4], count: le(b, e + 12, 4) };
  });
  assert.deepEqual(parts.map((p) => p.active), [0x00, 0x80, 0x00, 0x00]);
  assert.deepEqual(parts.map((p) => p.type), [0xde, 0x07, 0x83, 0x0f]);
  assert.deepEqual(parts.map((p) => p.count), [96327, 36869175, 14346045, 62958735]);
  const size = (c, unit) => ((c * 512) / unit).toFixed(2);
  assert.equal(size(96327, 2 ** 20), "47.03");
  assert.deepEqual(parts.slice(1).map((p) => size(p.count, 2 ** 30)), ["17.58", "6.84", "30.02"]);
});

test("2a: boot sector values and region starts", () => {
  const { b } = D.boot;
  assert.deepEqual([le(b, 0x0b, 2), b[0x0d], le(b, 0x0e, 2), b[0x10], le(b, 0x20, 4), le(b, 0x24, 4), le(b, 0x2c, 4)],
    [512, SC, SB, NF, 417627, SF, 2]);
  assert.equal(String.fromCharCode(...b.slice(0x52, 0x57)), "FAT32");
  assert.equal(((417627 * 512) / 2 ** 20).toFixed(2), "203.92");
  assert.deepEqual([SB, SB + SF, DATA], [38, 851, 1664]);
  assert.equal(D.fat.base, SB * 512);
  assert.deepEqual([D.rdet.base, D.tmc1.base, D.tmc2.base].map((o) => o / 512), [1664, sectors(20)[0], sectors(25)[0]]);
});

test("2b: FAT chains, sectors and free cells", () => {
  const { b } = D.fat;
  const fat = (k) => le(b, 4 * k, 4) & 0x0fffffff;
  const chain = (k) => { const out = [k]; while (fat(k) < 0x0ffffff8) out.push((k = fat(k))); return out; };
  assert.deepEqual([2, 6, 18, 20, 21, 23, 25].map(chain), [[2], [6, 7, 8, 9], [18, 19], [20], [21, 22], [23, 24], [25]]);
  assert.deepEqual([3, 4, 5, 10].map(fat), Array(4).fill(0x0fffffff));
  const free = [];
  for (let k = 2; k < 32; k++) if (fat(k) === 0) free.push(k);
  assert.deepEqual(free.slice(0, 7), [11, 12, 13, 14, 15, 16, 17]);
  assert.deepEqual([sectors(6)[0], sectors(9)[1], sectors(18)[0], sectors(19)[1], sectors(21)[0], sectors(22)[1]],
    [1680, 1695, 1728, 1735, 1740, 1747]);
  assert.deepEqual([...sectors(23), sectors(24)[1], ...sectors(25)], [1748, 1751, 1755, 1756, 1759]);
  assert.deepEqual([sectors(11)[0], sectors(12)[1]], [1700, 1707]);
  assert.deepEqual([0x4c18 - D.fat.base, b[0x18]], [4 * 6, 7]);
});

test("2b: directory entries as listed in the entry tables", () => {
  const list = (id) => {
    const { b, base } = D[id], out = [];
    for (let e = 0; e + 32 <= b.length; e += 32) {
      const d = decodeEntry(b, e), off = (base + e).toString(16).toUpperCase();
      if (d.kind === "empty") { out.push([off, "end"]); break; }
      out.push(d.kind === "lfn" ? [off, "lfn", b[e], d.deleted ? "deleted" : d.chars]
        : [off, d.deleted ? "deleted" : d.name, b[e + 11], d.cluster, d.size]);
    }
    return out;
  };
  assert.deepEqual(list("rdet"), [
    ["D0000", "NEW VOLUME", 0x08, 0, 0],
    ["D0020", "EXTERNAL.DLL", 0x20, 6, 7680],
    ["D0040", "lfn", 0xe5, "deleted"],
    ["D0060", "lfn", 0xe5, "deleted"],
    ["D0080", "deleted", 0x16, 3, 0],
    ["D00A0", "lfn", 0x42, "k.tpl"],
    ["D00C0", "lfn", 0x01, "Ext Superbloc"],
    ["D00E0", "EXTSUP~1.TPL", 0x20, 18, 2321],
    ["D0100", "TMC1", 0x10, 20, 0],
    ["D0120", "TMC2", 0x10, 25, 0],
    ["D0140", "end"],
  ]);
  assert.deepEqual(list("tmc1"), [
    ["D9000", ".", 0x10, 20, 0],
    ["D9020", "..", 0x10, 0, 0],
    ["D9040", "lfn", 0x42, ".whs"],
    ["D9060", "lfn", 0x01, "Sample script"],
    ["D9080", "SAMPLE~1.WHS", 0x20, 21, 2051],
    ["D90A0", "TIMEZONE.DAT", 0x20, 23, 2400],
    ["D90C0", "end"],
  ]);
  assert.deepEqual(list("tmc2").map((r) => r[1]), [".", "..", "end"]);
  assert.equal(D.rdet.b[at("rdet", 0xd002c)], 0x18); // byte 0C of EXTERNAL.DLL, which is not the attribute
});

test("2c–2e: offsets used in the answers", () => {
  assert.ok([0xd00a0, 0xd00ff].every((o) => Math.floor(o / 512) === 1664)); // .tpl entries
  assert.ok([0xdb840, 0xdb89f].every((o) => Math.floor(o / 512) === 1756)); // new entries in TMC2
  assert.ok([0xd9040, 0xd909f].every((o) => Math.floor(o / 512) === 1736)); // .whs entries
  assert.ok([4 * 21, 4 * 22, 4 * 11, 4 * 12].every((x) => x < 512)); // FAT cells in the first FAT sector
  assert.equal(Math.ceil(2400 / (SC * 512)), 2);
});
