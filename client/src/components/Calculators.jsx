import { useState } from "react";
import { hx, le, num } from "../fat/annotate.js";

function leResult(text) {
  const parts = text.trim().split(/[\s,]+/).filter(Boolean);
  if (!parts.length || parts.length > 6 || parts.some((p) => !/^[0-9a-fA-F]{1,2}$/.test(p)))
    return "Nhập 1–6 byte hex, cách nhau bằng dấu cách, ví dụ: 26 00";
  const b = parts.map((p) => parseInt(p, 16)), v = le(b, 0, b.length);
  return <>đảo → {hx(v, b.length * 2)} = <b>{num(v)}</b></>;
}

function offsetResult(text) {
  const v = text.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{1,10}$/.test(v)) return "Nhập offset hex, ví dụ: D9000";
  const n = parseInt(v, 16);
  return <>{hx(n)} ÷ 0x200 = sector <b>{num(Math.floor(n / 512))}</b>, byte {hx(n % 512)} trong sector</>;
}

function clusterResult(dText, sText, kText) {
  const D = parseInt(dText, 10), S = parseInt(sText, 10), k = parseInt(kText, 10);
  if (!(D >= 0 && S > 0 && k >= 2)) return "Cần Data ≥ 0, Sc > 0 và cluster k ≥ 2";
  const s = D + (k - 2) * S;
  return <>{D} + ({k} − 2) × {S} = sector <b>{num(s)}{S > 1 ? ` – ${num(s + S - 1)}` : ""}</b></>;
}

export default function Calculators() {
  const [leIn, setLeIn] = useState("5B 5F 06 00");
  const [offIn, setOffIn] = useState("D9000");
  const [data, setData] = useState("1664");
  const [sc, setSc] = useState("4");
  const [k, setK] = useState("20");
  return (
    <div className="tools">
      <div className="tool">
        <label htmlFor="le-in">Byte little-endian → số</label>
        <input id="le-in" value={leIn} onChange={(e) => setLeIn(e.target.value)} spellCheck={false} autoComplete="off" />
        <output htmlFor="le-in">{leResult(leIn)}</output>
      </div>
      <div className="tool">
        <label htmlFor="off-in">Offset (hex) → sector</label>
        <input id="off-in" value={offIn} onChange={(e) => setOffIn(e.target.value)} spellCheck={false} autoComplete="off" />
        <output htmlFor="off-in">{offsetResult(offIn)}</output>
      </div>
      <div className="tool">
        <label htmlFor="cl-k">Cluster → sector (S<sub>data</sub>, S<sub>C</sub>, k)</label>
        <div className="inrow">
          <input id="cl-d" value={data} onChange={(e) => setData(e.target.value)} inputMode="numeric" aria-label="Sector đầu vùng dữ liệu" />
          <input id="cl-s" value={sc} onChange={(e) => setSc(e.target.value)} inputMode="numeric" aria-label="Số sector mỗi cluster" />
          <input id="cl-k" value={k} onChange={(e) => setK(e.target.value)} inputMode="numeric" aria-label="Chỉ số cluster" />
        </div>
        <output>{clusterResult(data, sc, k)}</output>
      </div>
    </div>
  );
}
