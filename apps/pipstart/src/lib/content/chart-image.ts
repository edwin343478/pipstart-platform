// TA-b: identify an uploaded chart from its bytes, never from the browser's file name or type.
// Accepts PNG, JPEG and WebP only, and reads the pixel size from the image header.

export const CHART_MAX_BYTES = 4 * 1024 * 1024;
export const CHART_MIN_SIDE = 200;
export const CHART_MAX_SIDE = 10000;

/** The upload route's reply (TA-b). */
export type ChartUploadResult =
  | { kind: "uploaded"; path: string; width: number; height: number }
  | { kind: "invalid"; reason: string }
  | { kind: "denied" | "unavailable" };

export type ChartImage = {
  extension: "png" | "jpg" | "webp";
  contentType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
};

const u16be = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1];
const u32be = (b: Uint8Array, i: number) =>
  ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3];
const u16le = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8);
const u24le = (b: Uint8Array, i: number) =>
  b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
const ascii = (b: Uint8Array, i: number, text: string) =>
  [...text].every((c, k) => b[i + k] === c.charCodeAt(0));

function png(b: Uint8Array): [number, number] | null {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length < 33 || !signature.every((v, i) => b[i] === v)) return null;
  if (!ascii(b, 12, "IHDR")) return null;
  return [u32be(b, 16), u32be(b, 20)];
}

function jpeg(b: Uint8Array): [number, number] | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8 || b[2] !== 0xff)
    return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (
      marker === 0xd8 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      i += 2;
      continue;
    }
    const length = u16be(b, i + 2);
    if (length < 2) return null;
    // Start-of-frame markers carry the size; C4, C8 and CC are other tables.
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    )
      return [u16be(b, i + 7), u16be(b, i + 5)];
    if (marker === 0xda || marker === 0xd9) return null;
    i += 2 + length;
  }
  return null;
}

function webp(b: Uint8Array): [number, number] | null {
  if (b.length < 30 || !ascii(b, 0, "RIFF") || !ascii(b, 8, "WEBP"))
    return null;
  if (ascii(b, 12, "VP8 ")) {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return [u16le(b, 26) & 0x3fff, u16le(b, 28) & 0x3fff];
  }
  if (ascii(b, 12, "VP8L")) {
    if (b[20] !== 0x2f) return null;
    const b1 = b[22],
      b2 = b[23],
      b3 = b[24];
    return [
      1 + (((b1 & 0x3f) << 8) | b[21]),
      1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    ];
  }
  if (ascii(b, 12, "VP8X")) return [1 + u24le(b, 24), 1 + u24le(b, 27)];
  return null;
}

/** The chart's type and size, or a reason it is refused. */
export function readChartImage(
  bytes: Uint8Array,
): { ok: true; image: ChartImage } | { ok: false; reason: string } {
  if (bytes.length === 0 || bytes.length > CHART_MAX_BYTES)
    return { ok: false, reason: "Charts must be 4 MB or smaller" };
  const found: [
    ChartImage["extension"],
    ChartImage["contentType"],
    [number, number] | null,
  ][] = [
    ["png", "image/png", png(bytes)],
    ["jpg", "image/jpeg", jpeg(bytes)],
    ["webp", "image/webp", webp(bytes)],
  ];
  const match = found.find(([, , size]) => size !== null);
  if (!match) return { ok: false, reason: "Upload a PNG, JPEG or WebP image" };
  const [extension, contentType, size] = match;
  const [width, height] = size!;
  if (
    width < CHART_MIN_SIDE ||
    height < CHART_MIN_SIDE / 2 ||
    width > CHART_MAX_SIDE ||
    height > CHART_MAX_SIDE
  )
    return {
      ok: false,
      reason:
        "Charts must be at least 200 × 100 and at most 10000 pixels a side",
    };
  return { ok: true, image: { extension, contentType, width, height } };
}
