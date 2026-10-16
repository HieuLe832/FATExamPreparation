// Splits a hex dump into labelled fields. Each segment's `calc` and `ent` are small HTML
// strings built only from the dump bytes; text taken from bytes goes through esc().
import { DATA_START, FAT_START_OFFSET, SECTORS_PER_CLUSTER } from "./dumps.js";

export const h2 = (n) => n.toString(16).toUpperCase().padStart(2, "0");
export const hx = (n, w = 1) => "0x" + n.toString(16).toUpperCase().padStart(w, "0");
export const num = (n) => n.toLocaleString("vi-VN");
export const le = (b, i, n) => { let v = 0; for (let k = n - 1; k >= 0; k--) v = v * 256 + b[i + k]; return v; };
const raw = (b, i, n) => Array.from({ length: n }, (_, k) => h2(b[i + k])).join(" ");
const rev = (b, i, n) => Array.from({ length: n }, (_, k) => h2(b[i + n - 1 - k])).join("");
const ascii = (b, i, n) => String.fromCharCode(...b.slice(i, i + n));
export const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const leCalc = (b, i, n) => `${raw(b, i, n)} → đảo → ${hx(le(b, i, n), n * 2)} = <b>${num(le(b, i, n))}</b>`;
const vnFixed = (x) => x.toFixed(2).replace(".", ",");

export function clusterSectors(k) {
  const s = DATA_START + (k - 2) * SECTORS_PER_CLUSTER;
  return `${s} – ${s + SECTORS_PER_CLUSTER - 1}`;
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
    const n = le(b, e + 12, 4), bytes = n * 512;
    const size = bytes >= 2 ** 30 ? `${vnFixed(bytes / 2 ** 30)} GB` : `${vnFixed(bytes / 2 ** 20)} MB`;
    s.push(
      seg(e, 1, "k-attr", P + "trạng thái (+0)", `${raw(b, e, 1)} → ${b[e] === 0x80 ? "<b>active, phân vùng khởi động</b>" : "không active"}`),
      seg(e + 1, 3, "k-mute", P + "CHS bắt đầu (+1, bỏ qua)"),
      seg(e + 4, 1, "k-name", P + "loại (+4)", `${raw(b, e + 4, 1)} → <b>${PARTITION_TYPES[b[e + 4]] ?? "?"}</b>`),
      seg(e + 5, 3, "k-mute", P + "CHS kết thúc (+5, bỏ qua)"),
      seg(e + 8, 4, "k-clus", P + "sector bắt đầu, LBA (+8)", leCalc(b, e + 8, 4)),
      seg(e + 12, 4, "k-size", P + "số sector (+C)", `${leCalc(b, e + 12, 4)} sector × 512 = ${num(bytes)} B ≈ <b>${size}</b>`),
    );
  }
  s.push(seg(0x4e, 2, "k-sig", "Chữ ký MBR", "55 AA → MBR hợp lệ"));
  return s;
}

// [offset, length, class, label, format]
const BOOT_FIELDS = [
  [0x00, 3, "k-mute", "Jump code"], [0x03, 8, "k-mute", "OEM ID", "str"],
  [0x0b, 2, "k-num", "Số byte / sector", "n"], [0x0d, 1, "k-num", "S<sub>C</sub>: số sector / cluster", "n"],
  [0x0e, 2, "k-num", "S<sub>B</sub>: số sector vùng Boot sector", "n"], [0x10, 1, "k-num", "N<sub>F</sub>: số bảng FAT", "n"],
  [0x11, 2, "k-mute", "Số entry RDET (FAT32 không dùng)", "n"], [0x13, 2, "k-mute", "Số sector volume 16 bit (FAT32 không dùng)", "n"],
  [0x15, 1, "k-mute", "Loại thiết bị (F8 = đĩa cứng)"], [0x16, 2, "k-mute", "Sector / bảng FAT 16 bit (FAT32 không dùng)", "n"],
  [0x18, 2, "k-mute", "Số sector / track", "n"], [0x1a, 2, "k-mute", "Số đầu đọc", "n"],
  [0x1c, 4, "k-mute", "Khoảng cách tới đầu volume", "n"], [0x20, 4, "k-num", "S<sub>V</sub>: kích thước volume (sector)", "n"],
  [0x24, 4, "k-num", "S<sub>F</sub>: số sector / bảng FAT", "n"], [0x28, 2, "k-mute", "Cờ bảng FAT active"],
  [0x2a, 2, "k-mute", "Version FAT32"], [0x2c, 4, "k-clus", "Cluster bắt đầu của RDET", "n"],
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
    if (o === 0x20) calc += ` × 512 = ${num(le(b, o, 4) * 512)} B ≈ ${vnFixed((le(b, o, 4) * 512) / 2 ** 20)} MB`;
    if (o === 0x24) calc += ` → Data = ${le(b, 0x0e, 2)} + ${b[0x10]} × ${le(b, o, 4)} = ${le(b, 0x0e, 2) + b[0x10] * le(b, o, 4)}`;
    if (o === 0x2c) calc += ` → sector ${clusterSectors(le(b, o, 4))}`;
    return seg(o, n, cls, label, calc);
  });
}

function annotateFat(b, base) {
  const s = [];
  for (let i = 0; i + 4 <= b.length; i += 4) {
    const k = (base - FAT_START_OFFSET + i) / 4, v = le(b, i, 4) & 0x0fffffff;
    let cls, mean;
    if (k < 2) { cls = "k-mute"; mean = `phần tử ${k} không dùng (cluster đánh số từ 2)`; }
    else if (v === 0) { cls = "k-free"; mean = "<b>trống</b>"; }
    else if (v >= 0x0ffffff8) { cls = "k-eof"; mean = `<b>EOF</b>: cluster ${k} là cluster cuối`; }
    else { cls = "k-clus"; mean = `sau cluster ${k} là <b>cluster ${v}</b>`; }
    s.push(seg(i, 4, cls, `Phần tử FAT ${k} (byte ${hx(4 * k, 2)} của bảng)`, `${raw(b, i, 4)} → đảo → ${rev(b, i, 4)} → ${mean}`));
  }
  return s;
}

export function attrText(a) {
  const on = [[0x20, "A"], [0x10, "D"], [0x08, "V"], [0x04, "S"], [0x02, "H"], [0x01, "R"]].filter(([m]) => a & m).map(([, c]) => c);
  const bin = a.toString(2).padStart(8, "0");
  return `${h2(a)} = ${bin.slice(0, 4)} ${bin.slice(4)} → ${on.join(" + ") || "không bit nào"}`;
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

function entrySummary(b, e, base) {
  const at = hx(base + e, 5), d = decodeEntry(b, e);
  if (d.kind === "empty") return `<b>Entry ${at}</b>: trống (byte đầu 00), hết bảng.`;
  let rows;
  if (d.kind === "lfn") {
    const seq = d.deleted ? "E5: <b>đã xóa</b>" : `${h2(b[e])} → entry phụ thứ ${d.seq}${d.last ? " (entry phụ cuối)" : ""}`;
    rows = [["Loại", "Entry phụ (tên dài), thuộc tính 0F"], ["Thứ tự", seq], ["Ký tự tên", `“${esc(d.chars)}”`]];
  } else {
    const kind = d.deleted ? "Entry chính <b>đã xóa</b> (E5): không đưa vào cây"
      : d.attr & 0x08 ? "Nhãn volume: không phải tập tin"
      : d.name === "." ? "Entry “.”: chính thư mục này"
      : d.name === ".." ? "Entry “..”: thư mục cha (cluster 0 = thư mục gốc)"
      : d.attr & 0x10 ? "Entry chính của <b>thư mục</b>" : "Entry chính của <b>tập tin</b>";
    rows = [
      ["Loại", kind], ["Tên 8.3", esc(d.name)], ["Thuộc tính", attrText(d.attr)],
      ["Cluster đầu", `${rev(b, e + 0x14, 2)} | ${rev(b, e + 0x1a, 2)} → ${num(d.cluster)}${d.cluster >= 2 ? " → sector " + clusterSectors(d.cluster) : ""}`],
      ["Kích thước", `${num(d.size)} B${d.attr & 0x10 ? " (thư mục: luôn 0)" : ""}`],
    ];
  }
  return `<b>Entry tại ${at}</b><dl>${rows.map(([t, v]) => `<dt>${t}</dt><dd>${v}</dd>`).join("")}</dl>`;
}

function annotateDir(b, base) {
  const s = [];
  for (let e = 0; e + 32 <= b.length; e += 32) {
    const b0 = b[e], attr = b[e + 11], ent = entrySummary(b, e, base);
    const push = (o, n, cls, what, calc) => s.push({ ...seg(e + o, n, cls, what, calc), ent });
    if (b0 === 0) { push(0, 32, "k-free", "Entry trống", "byte đầu 00"); continue; }
    if (attr === 0x0f) {
      push(0, 1, b0 === 0xe5 ? "k-del" : "k-num", "Thứ tự entry phụ (+0)", raw(b, e, 1));
      push(1, 10, "k-lfn", "5 ký tự UTF-16 (+1)", raw(b, e + 1, 10));
      push(11, 1, "k-attr", "Dấu hiệu entry phụ (+0B)", "0F → entry phụ");
      push(12, 2, "k-mute", "Loại và checksum (+0C, +0D)");
      push(14, 12, "k-lfn", "6 ký tự UTF-16 (+0E)", raw(b, e + 14, 12));
      push(26, 2, "k-mute", "Luôn 0000 (+1A)");
      push(28, 4, "k-lfn", "2 ký tự UTF-16 (+1C)", raw(b, e + 28, 4));
    } else {
      const name = `“${esc(ascii(b, e, 8))}”`;
      push(0, 1, b0 === 0xe5 ? "k-del" : "k-name", b0 === 0xe5 ? "Byte đầu E5: đã xóa" : "Tên chính (+0)", name);
      push(1, 7, "k-name", "Tên chính (+0)", name);
      push(8, 3, "k-name", "Tên mở rộng (+08)", `“${esc(ascii(b, e + 8, 3))}”`);
      push(11, 1, "k-attr", "Thuộc tính (+0B)", attrText(attr));
      push(12, 8, "k-mute", "Dành riêng, giờ/ngày tạo, ngày truy cập (+0C … +13)");
      push(20, 2, "k-clus", "Cluster bắt đầu, word cao (+14)", `${raw(b, e + 20, 2)} → ${rev(b, e + 20, 2)}`);
      push(22, 4, "k-mute", "Giờ/ngày sửa (+16, +18)");
      push(26, 2, "k-clus", "Cluster bắt đầu, word thấp (+1A)", leCalc(b, e + 26, 2));
      push(28, 4, "k-size", "Kích thước (+1C)", `${leCalc(b, e + 28, 4)} byte`);
    }
  }
  return s;
}

const ANNOTATORS = { mbr: annotateMbr, boot: annotateBoot, fat: annotateFat, dir: annotateDir };

export function annotate(kind, bytes, base) {
  return ANNOTATORS[kind](bytes, base);
}
