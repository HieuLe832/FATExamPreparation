// Splits a hex dump into labelled fields. Each segment's `calc` is a small HTML string built only from
// the dump bytes; text taken from bytes goes through esc(). The page shows these as a static list under
// each dump (focusNotes), so learners never have to click a byte.
import { FAT_START_OFFSET } from "./dumps.js";

export const h2 = (n) => n.toString(16).toUpperCase().padStart(2, "0");
export const hx = (n, w = 1) => "0x" + n.toString(16).toUpperCase().padStart(w, "0");
/** Plain hex without 0x, as the lessons write it: hp(0x1be) = "1BE". */
export const hp = (n, w = 1) => n.toString(16).toUpperCase().padStart(w, "0");
/** Thousands grouped with no-break spaces, like the hand-written answers: 2 097 152. */
export const num = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
export const le = (b, i, n) => { let v = 0; for (let k = n - 1; k >= 0; k--) v = v * 256 + b[i + k]; return v; };
const raw = (b, i, n) => Array.from({ length: n }, (_, k) => h2(b[i + k])).join(" ");
const rev = (b, i, n) => Array.from({ length: n }, (_, k) => h2(b[i + n - 1 - k])).join("");
const ascii = (b, i, n) => String.fromCharCode(...b.slice(i, i + n));
export const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const leCalc = (b, i, n) => `${raw(b, i, n)} → đảo → ${hp(le(b, i, n), n * 2)} = <b>${num(le(b, i, n))}</b>`;
const vnFixed = (x) => x.toFixed(2).replace(".", ",");
/** Bytes in the largest unit that keeps the number ≥ 1: 1 GB, 512 MB, 32 KB. */
export function sizeText(bytes) {
  const units = [[2 ** 30, "GB"], [2 ** 20, "MB"], [2 ** 10, "KB"]];
  const [div, unit] = units.find(([d]) => bytes >= d) ?? [1, "byte"];
  const v = bytes / div;
  return `${Number.isInteger(v) ? v : vnFixed(v)} ${unit}`;
}

const seg = (start, len, cls, what, calc = "") => ({ start, len, cls, what, calc });

const PARTITION_TYPES = {
  0x00: "không dùng", 0x05: "Extended", 0x07: "NTFS", 0x0b: "FAT32", 0x0c: "FAT32 (LBA)",
  0x0f: "Extended (LBA)", 0x83: "Linux", 0xde: "Dell Utility (FAT)",
};

function annotateMbr(b) {
  const s = [
    seg(0, 8, "k-mute", "Cuối đoạn mã khởi động"),
    seg(8, 4, "k-mute", "Disk signature (không cần)"),
    seg(12, 2, "k-mute", "Thường là 0000"),
  ];
  for (let p = 0; p < 4; p++) {
    const e = 0x0e + p * 16, P = `Phân vùng ${p + 1} · `;
    if (b.slice(e, e + 16).every((x) => x === 0)) {
      s.push(seg(e, 16, "k-free", P + "trống", "16 byte toàn 00 → không có phân vùng này"));
      continue;
    }
    const n = le(b, e + 12, 4), bytes = n * 512, size = sizeText(bytes);
    s.push(
      seg(e, 1, "k-attr", P + "khởi động (+0)", `${raw(b, e, 1)} → ${b[e] === 0x80 ? "<b>có, phân vùng khởi động</b>" : "<b>không</b>"}`),
      seg(e + 1, 3, "k-mute", P + "CHS bắt đầu (+1, bỏ qua)"),
      seg(e + 4, 1, "k-name", P + "loại (+4)", `${raw(b, e + 4, 1)} → <b>${PARTITION_TYPES[b[e + 4]] ?? "?"}</b>`),
      seg(e + 5, 3, "k-mute", P + "CHS kết thúc (+5, bỏ qua)"),
      seg(e + 8, 4, "k-clus", P + "sector đầu (+8)", leCalc(b, e + 8, 4)),
      seg(e + 12, 4, "k-size", P + "số sector (+C)", `${leCalc(b, e + 12, 4)} sector × 512 = ${num(bytes)} byte = <b>${size}</b>`),
    );
  }
  s.push(seg(0x4e, 2, "k-sig", "Chữ ký MBR", "55 AA → MBR hợp lệ"));
  return s;
}

// [offset, length, class, label, format]
const BOOT_FIELDS = [
  [0x00, 3, "k-mute", "Jump code"], [0x03, 8, "k-mute", "OEM ID", "str"],
  [0x0b, 2, "k-num", "Số byte / sector", "n"], [0x0d, 1, "k-num", "S<sub>C</sub>: số sector / cluster", "n"],
  [0x0e, 2, "k-num", "S<sub>B</sub>: số sector vùng boot", "n"], [0x10, 1, "k-num", "N<sub>F</sub>: số bảng FAT", "n"],
  [0x11, 2, "k-mute", "Số entry RDET (FAT32 không dùng)", "n"], [0x13, 2, "k-mute", "Số sector volume 16 bit (FAT32 không dùng)", "n"],
  [0x15, 1, "k-mute", "Loại thiết bị (F8 = đĩa cứng)"], [0x16, 2, "k-mute", "Sector / bảng FAT 16 bit (FAT32 không dùng)", "n"],
  [0x18, 2, "k-mute", "Số sector / track", "n"], [0x1a, 2, "k-mute", "Số đầu đọc", "n"],
  [0x1c, 4, "k-mute", "Khoảng cách tới đầu volume", "n"], [0x20, 4, "k-num", "S<sub>V</sub>: tổng số sector của volume", "n"],
  [0x24, 4, "k-num", "S<sub>F</sub>: số sector / bảng FAT", "n"], [0x28, 2, "k-mute", "Cờ bảng FAT active"],
  [0x2a, 2, "k-mute", "Version FAT32"], [0x2c, 4, "k-clus", "Cluster đầu của RDET", "n"],
  [0x30, 2, "k-mute", "Sector FSInfo", "n"], [0x32, 2, "k-mute", "Sector bản sao Boot sector", "n"],
  [0x34, 12, "k-mute", "Dành riêng"], [0x40, 1, "k-mute", "Ký hiệu vật lý (80 = đĩa cứng)"],
  [0x41, 1, "k-mute", "Dành riêng"], [0x42, 1, "k-mute", "Ký hiệu nhận diện HĐH"],
  [0x43, 4, "k-mute", "Serial number"], [0x47, 11, "k-mute", "Volume label", "str"],
  [0x52, 8, "k-name", "Loại FAT", "str"], [0x5a, 22, "k-mute", "Đoạn mã khởi động"],
];

function annotateBoot(b) {
  return BOOT_FIELDS.map(([o, n, cls, label, fmt]) => {
    let calc;
    if (fmt === "n") calc = n === 1 ? `${raw(b, o, 1)} = <b>${b[o]}</b>` : leCalc(b, o, n);
    else if (fmt === "str") calc = `“${esc(ascii(b, o, n))}” (chuỗi: đọc xuôi)`;
    else calc = raw(b, o, Math.min(n, 8)) + (n > 8 ? " …" : "");
    if (o === 0x0e) calc += ` → FAT1 bắt đầu ở sector ${le(b, o, 2)}`;
    if (o === 0x20) calc += ` × 512 = ${num(le(b, o, 4) * 512)} byte = ${sizeText(le(b, o, 4) * 512)}`;
    if (o === 0x24) calc += ` → Data = ${le(b, 0x0e, 2)} + ${b[0x10]} × ${le(b, o, 4)} = ${le(b, 0x0e, 2) + b[0x10] * le(b, o, 4)}`;
    return seg(o, n, cls, label, calc);
  });
}

function annotateFat(b, base) {
  const s = [];
  for (let i = 0; i + 4 <= b.length; i += 4) {
    const k = (base - FAT_START_OFFSET + i) / 4, v = le(b, i, 4) & 0x0fffffff;
    let cls, mean;
    if (k < 2) { cls = "k-mute"; mean = `ô ${k} không dùng (cluster đánh số từ 2)`; }
    else if (v === 0) { cls = "k-free"; mean = "<b>trống</b>"; }
    else if (v >= 0x0ffffff8) { cls = "k-eof"; mean = `<b>hết</b>: cluster ${k} là cluster cuối`; }
    else { cls = "k-clus"; mean = `sau cluster ${k} là <b>cluster ${v}</b>`; }
    s.push(seg(i, 4, cls, `Ô FAT ${k} (byte 4 × ${k} = ${4 * k} = ${hp(4 * k)} của bảng)`, `${raw(b, i, 4)} → đảo → ${rev(b, i, 4)} → ${mean}`));
  }
  return s;
}

const FLAGS = [[0x20, "A", "lưu trữ"], [0x10, "D", "thư mục"], [0x08, "V", "tên ổ"], [0x04, "S", "hệ thống"], [0x02, "H", "ẩn"], [0x01, "R", "chỉ đọc"]];

/** Attribute byte as a sum of flags: 22 = 20 + 02 → A + H. */
export function attrText(a) {
  const on = FLAGS.filter(([m]) => a & m);
  if (!on.length) return `${h2(a)} → không cờ nào`;
  if (on.length === 1) return `${h2(a)} → ${on[0][1]} (${on[0][2]})`;
  return `${h2(a)} = ${on.map(([m]) => h2(m)).join(" + ")} → ${on.map(([, c]) => c).join(" + ")}`;
}

/** Characters of a long-name piece: 2 bytes each, stopping at 0000 or FFFF. */
function ucs(b, i, n) {
  let out = "";
  for (let k = 0; k + 1 < n; k += 2) {
    const code = le(b, i + k, 2);
    if (code === 0 || code === 0xffff) break;
    out += String.fromCharCode(code);
  }
  return out;
}

export function lfnChars(b, e) {
  let out = "";
  for (const [from, count] of [[1, 5], [14, 6], [28, 2]]) {
    for (let c = 0; c < count; c++) {
      const code = le(b, e + from + c * 2, 2);
      if (code === 0 || code === 0xffff) return out;
      out += String.fromCharCode(code);
    }
  }
  return out;
}

export function decodeEntry(b, e) {
  const b0 = b[e], attr = b[e + 11];
  if (b0 === 0) return { kind: "empty" };
  if (attr === 0x0f) return { kind: "lfn", deleted: b0 === 0xe5, seq: b0 & 0x1f, last: !!(b0 & 0x40), chars: lfnChars(b, e) };
  let name = ascii(b, e, 8).replace(/ +$/, ""), ext = ascii(b, e + 8, 3).replace(/ +$/, "");
  if (b0 === 0xe5) name = "?" + name.slice(1);
  if (attr & 0x08) { name = ascii(b, e, 11).replace(/ +$/, ""); ext = ""; }
  return {
    kind: "main", deleted: b0 === 0xe5, attr, name: name + (ext ? "." + ext : ""),
    cluster: le(b, e + 0x14, 2) * 65536 + le(b, e + 0x1a, 2), size: le(b, e + 0x1c, 4),
  };
}

function annotateDir(b) {
  const s = [];
  for (let e = 0; e + 32 <= b.length; e += 32) {
    const b0 = b[e], attr = b[e + 11];
    const push = (o, n, cls, what, calc) => s.push(seg(e + o, n, cls, what, calc));
    if (b0 === 0) { push(0, 32, "k-free", "Entry trống", "byte đầu 00"); continue; }
    if (attr === 0x0f) {
      const chars = (o, n) => { const t = ucs(b, e + o, n); return `${raw(b, e + o, n)} → ${t ? `“${esc(t)}”` : "hết tên"}`; };
      const seq = b0 === 0xe5 ? "E5 → <b>đã xóa</b>"
        : `${h2(b0)} → entry phụ số ${b0 & 0x1f}${b0 & 0x40 ? " (có cộng 40: là mảnh cuối của tên)" : ""}`;
      push(0, 1, b0 === 0xe5 ? "k-del" : "k-num", "Thứ tự mảnh tên (+00)", seq);
      push(1, 10, "k-lfn", "Chữ 1–5 của mảnh (+01)", chars(1, 10));
      push(11, 1, "k-attr", "Thuộc tính (+0B)", "0F → <b>entry phụ</b> (mảnh tên dài)");
      push(12, 2, "k-mute", "Loại và checksum (+0C, +0D)");
      push(14, 12, "k-lfn", "Chữ 6–11 của mảnh (+0E)", chars(14, 12));
      push(26, 2, "k-mute", "Luôn 0000 (+1A)");
      push(28, 4, "k-lfn", "Chữ 12–13 của mảnh (+1C)", chars(28, 4));
    } else {
      const name = `“${esc(ascii(b, e, 8))}”`;
      push(0, 1, b0 === 0xe5 ? "k-del" : "k-name", b0 === 0xe5 ? "Byte đầu E5: đã xóa" : "Tên (+00)", b0 === 0xe5 ? "E5 → <b>đã xóa</b>" : name);
      push(1, 7, "k-name", "Tên (+00)", name);
      push(8, 3, "k-name", "Đuôi (+08)", `“${esc(ascii(b, e + 8, 3))}”`);
      push(11, 1, "k-attr", "Thuộc tính (+0B)", attrText(attr));
      push(12, 8, "k-mute", "Ngày giờ tạo, truy cập (+0C … +13)");
      push(20, 2, "k-clus", "Cluster đầu, 2 byte cao (+14)", `${raw(b, e + 20, 2)} → đảo → ${rev(b, e + 20, 2)}`);
      push(22, 4, "k-mute", "Ngày giờ sửa (+16 … +19)");
      push(26, 2, "k-clus", "Cluster đầu, 2 byte thấp (+1A)", leCalc(b, e + 26, 2));
      push(28, 4, "k-size", "Kích thước (+1C)", `${leCalc(b, e + 28, 4)} byte`);
    }
  }
  return s;
}

const ANNOTATORS = { mbr: annotateMbr, boot: annotateBoot, fat: annotateFat, dir: annotateDir };

export function annotate(kind, bytes, base) {
  return ANNOTATORS[kind](bytes, base);
}

/** Where a byte range sits in the dump, as the lessons say it: "dòng 00000000 · cột E–F". */
export function whereText(start, len) {
  const end = start + len - 1, row = (o) => hp(o & ~0xf, 8), col = (o) => hp(o & 0xf);
  if (row(start) === row(end)) return `dòng ${row(start)} · cột ${col(start)}${len > 1 ? `–${col(end)}` : ""}`;
  return `dòng ${row(start)} cột ${col(start)} → dòng ${row(end)} cột ${col(end)}`;
}

/**
 * The fields a step points at, for the static list under a dump. `focus` holds absolute [offset, length]
 * ranges; segments that touch them are returned in order, minus filler bytes, with neighbours that share
 * a label merged (a name is split into its first byte and the rest).
 */
export function focusNotes(segs, focus, base) {
  const hit = (s) => focus.some(([o, n]) => base + s.start < o + n && o < base + s.start + s.len);
  const out = [];
  for (const s of segs) {
    if (!hit(s) || s.cls === "k-mute") continue;
    const last = out[out.length - 1];
    if (last && last.what === s.what && last.start + last.len === base + s.start) { last.len += s.len; continue; }
    out.push({ start: base + s.start, len: s.len, what: s.what, calc: s.calc });
  }
  return out;
}

/** One row per directory entry up to the first empty one, in plain words for the entry table. */
export function entryRows(b, base) {
  const rows = [];
  for (let e = 0; e + 32 <= b.length; e += 32) {
    const d = decodeEntry(b, e), at = base + e, first = h2(b[e]), attr = h2(b[e + 11]);
    let text, skip = true;
    if (d.kind === "empty") text = "hết bảng";
    else if (d.kind === "lfn") text = d.deleted ? "mảnh tên dài đã xóa" : `mảnh tên dài số ${d.seq}: “${d.chars}”`, skip = d.deleted;
    else if (d.deleted) text = `đã xóa (${d.name})`;
    else if (d.attr & 0x08) text = `tên ổ “${d.name}”`;
    else if (d.name === ".") text = "“.”: chính thư mục này";
    else if (d.name === "..") text = "“..”: thư mục cha";
    else {
      skip = false;
      text = d.attr & 0x10 ? `thư mục ${d.name} · cluster ${d.cluster}` : `tập tin ${d.name} · cluster ${d.cluster} · ${num(d.size)} byte`;
    }
    rows.push({ at, first, attr: d.kind === "empty" ? "" : attr, text, skip });
    if (d.kind === "empty") break;
  }
  return rows;
}

/** FAT32 cells of a dump: number and what it says, for the strip under the FAT dump. */
export function fatCells(b, base) {
  const cells = [];
  for (let i = 0; i + 4 <= b.length; i += 4) {
    const k = (base - FAT_START_OFFSET + i) / 4, v = le(b, i, 4) & 0x0fffffff;
    const text = k < 2 ? "không dùng" : v === 0 ? "trống" : v >= 0x0ffffff8 ? "hết" : `→ ${v}`;
    cells.push({ k, start: base + i, text, kind: k < 2 ? "rsv" : v === 0 ? "free" : v >= 0x0ffffff8 ? "eof" : "next" });
  }
  return cells;
}
