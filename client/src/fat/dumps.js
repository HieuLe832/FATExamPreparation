// Volume constants shared by the decoders. The dumps themselves are served by the backend
// (GET /api/hex-dumps/{id}, data in server/Data/hex-dumps.json).

export const DATA_START = 1664; // first sector of the data area: SB + NF * SF = 38 + 2 * 813
export const SECTORS_PER_CLUSTER = 4;

export function parseHex(rows) {
  return rows.flatMap((r) => r.trim().split(/\s+/).map((x) => parseInt(x, 16)));
}
