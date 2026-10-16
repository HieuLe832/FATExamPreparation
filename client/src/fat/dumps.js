// Hex dumps transcribed from the screenshots in Baitap_HTTT.pdf (originals in public/de/).
// `pick` is the absolute offset selected when the dump first renders.

export const DATA_START = 1664; // first sector of the data area: SB + NF * SF = 38 + 2 * 813
export const SECTORS_PER_CLUSTER = 4;

export const DUMPS = {
  mbr: {
    title: "MBR · sector 0 của ổ cứng",
    note: "phần cuối sector, từ 1B0 (trước đó là mã khởi động)",
    base: 0x1b0, kind: "mbr", pick: 0x1c6, original: "de/mbr.png",
    hex: [
      "00 00 00 00 00 2C 44 63 8C 73 F4 D0 00 00 00 01",
      "01 00 DE FE 3F 05 3F 00 00 00 47 78 01 00 80 00",
      "01 06 07 FE FF FF 86 78 01 00 37 94 32 02 00 FE",
      "FF FF 83 FE FF FF BD 0C 34 02 3D E7 DA 00 00 FE",
      "FF FF 0F FE FF FF FA F3 0E 03 8F AC C0 03 55 AA",
    ],
  },
  boot: {
    title: "Sector 0 · Boot sector",
    note: "phần đầu sector",
    base: 0, kind: "boot", pick: 0x0e, original: "de/sector-0.png",
    hex: [
      "EB 58 90 4D 53 44 4F 53 35 2E 30 00 02 04 26 00",
      "02 00 00 00 00 F8 00 00 3F 00 FF 00 3F 00 00 00",
      "5B 5F 06 00 2D 03 00 00 00 00 00 00 02 00 00 00",
      "01 00 06 00 00 00 00 00 00 00 00 00 00 00 00 00",
      "80 00 29 6F CB E7 40 4E 4F 20 4E 41 4D 45 20 20",
      "20 20 46 41 54 33 32 20 20 20 33 C9 8E D1 BC F4",
      "7B 8E C1 8E D9 BD 00 7C 88 4E 02 8A 56 40 B4 08",
    ],
  },
  fat: {
    title: "Sector 38 · đầu bảng FAT1",
    note: "mỗi phần tử 4 byte",
    base: 0x4c00, kind: "fat", pick: 0x4c18, original: "de/sector-38.png",
    hex: [
      "F8 FF FF 0F FF FF FF FF FF FF FF 0F FF FF FF 0F",
      "FF FF FF 0F FF FF FF 0F 07 00 00 00 08 00 00 00",
      "09 00 00 00 FF FF FF 0F FF FF FF 0F 00 00 00 00",
      "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
      "00 00 00 00 00 00 00 00 13 00 00 00 FF FF FF 0F",
      "FF FF FF 0F 16 00 00 00 FF FF FF 0F 18 00 00 00",
      "FF FF FF 0F FF FF FF 0F 00 00 00 00 00 00 00 00",
      "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
    ],
  },
  rdet: {
    title: "Sector 1664 · RDET",
    note: "cluster 2",
    base: 0xd0000, kind: "dir", pick: 0xd003a, original: "de/sector-1664.png",
    hex: [
      "4E 45 57 20 56 4F 4C 55 4D 45 20 08 00 00 00 00",
      "00 00 00 00 00 00 5D 62 4A 59 00 00 00 00 00 00",
      "45 58 54 45 52 4E 41 4C 44 4C 4C 20 18 AC 34 69",
      "4A 59 4A 59 00 00 A0 08 61 35 06 00 00 1E 00 00",
      "E5 20 00 49 00 6E 00 66 00 6F 00 0F 00 72 72 00",
      "6D 00 61 00 74 00 69 00 6F 00 00 00 6E 00 00 00",
      "E5 53 00 79 00 73 00 74 00 65 00 0F 00 72 6D 00",
      "20 00 56 00 6F 00 6C 00 75 00 00 00 6D 00 65 00",
      "E5 59 53 54 45 4D 7E 31 20 20 20 16 00 B0 34 69",
      "4A 59 4A 59 00 00 35 69 4A 59 03 00 00 00 00 00",
      "42 6B 00 2E 00 74 00 70 00 6C 00 0F 00 55 00 00",
      "FF FF FF FF FF FF FF FF FF FF 00 00 FF FF FF FF",
      "01 45 00 78 00 74 00 20 00 53 00 0F 00 55 75 00",
      "70 00 65 00 72 00 62 00 6C 00 00 00 6F 00 63 00",
      "45 58 54 53 55 50 7E 31 54 50 4C 20 00 B0 42 69",
      "4A 59 4A 59 00 00 A0 08 61 35 12 00 11 09 00 00",
      "54 4D 43 31 20 20 20 20 20 20 20 10 00 71 65 69",
      "4A 59 4A 59 00 00 66 69 4A 59 14 00 00 00 00 00",
      "54 4D 43 32 20 20 20 20 20 20 20 10 00 0C 68 69",
      "4A 59 4A 59 00 00 69 69 4A 59 19 00 00 00 00 00",
      "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
      "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
    ],
  },
  tmc1: {
    title: "Sector 1736 · SDET của TMC1",
    note: "cluster 20",
    base: 0xd9000, kind: "dir", pick: 0xd909a, original: "de/sector-1736.png",
    hex: [
      "2E 20 20 20 20 20 20 20 20 20 20 10 00 71 65 69",
      "4A 59 4A 59 00 00 66 69 4A 59 14 00 00 00 00 00",
      "2E 2E 20 20 20 20 20 20 20 20 20 10 00 71 65 69",
      "4A 59 4A 59 00 00 66 69 4A 59 00 00 00 00 00 00",
      "42 2E 00 77 00 68 00 73 00 00 00 0F 00 C5 FF FF",
      "FF FF FF FF FF FF FF FF FF FF 00 00 FF FF FF FF",
      "01 53 00 61 00 6D 00 70 00 6C 00 0F 00 C5 65 00",
      "20 00 73 00 63 00 72 00 69 00 00 00 70 00 74 00",
      "53 41 4D 50 4C 45 7E 31 57 48 53 20 00 71 65 69",
      "4A 59 4A 59 00 00 A0 08 61 35 15 00 03 08 00 00",
      "54 49 4D 45 5A 4F 4E 45 44 41 54 20 18 71 65 69",
      "4A 59 4A 59 00 00 A0 08 61 35 17 00 60 09 00 00",
      "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
      "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
    ],
  },
  tmc2: {
    title: "Sector 1756 · SDET của TMC2",
    note: "cluster 25",
    base: 0xdb800, kind: "dir", pick: 0xdb81a, original: "de/sector-1756.png",
    hex: [
      "2E 20 20 20 20 20 20 20 20 20 20 10 00 0C 68 69",
      "4A 59 4A 59 00 00 69 69 4A 59 19 00 00 00 00 00",
      "2E 2E 20 20 20 20 20 20 20 20 20 10 00 0C 68 69",
      "4A 59 4A 59 00 00 69 69 4A 59 00 00 00 00 00 00",
      "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
      "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
    ],
  },
};

export function parseHex(rows) {
  return rows.flatMap((r) => r.trim().split(/\s+/).map((x) => parseInt(x, 16)));
}
