// Layout of the mini practice disk the lessons use. The dumps themselves are served by the backend
// (GET /api/hex-dumps/{id}, data in server/Data/hex-dumps.json).

export const DATA_START = 10; // first sector of the data area: SB + NF * SF = 6 + 2 * 2
export const SECTORS_PER_CLUSTER = 2;
export const FAT_START_OFFSET = 6 * 512; // FAT1 begins at sector SB = 6

export function parseHex(rows) {
  return rows.flatMap((r) => r.trim().split(/\s+/).map((x) => parseInt(x, 16)));
}
