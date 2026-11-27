import { describe, expect, it } from "vitest";
import { CHART_MAX_BYTES, readChartImage } from "./chart-image";

const pngOf = (w: number, h: number) => {
  const b = new Uint8Array(64);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
  b.set(
    [..."IHDR"].map((c) => c.charCodeAt(0)),
    12,
  );
  new DataView(b.buffer).setUint32(16, w);
  new DataView(b.buffer).setUint32(20, h);
  return b;
};
const jpegOf = (w: number, h: number) => {
  // SOI, an APP0 segment of 16 bytes, then SOF0 with the size.
  const b = new Uint8Array(64);
  b.set([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10], 0);
  const sof = 2 + 2 + 16;
  b.set([0xff, 0xc0, 0x00, 0x11, 0x08], sof);
  new DataView(b.buffer).setUint16(sof + 5, h);
  new DataView(b.buffer).setUint16(sof + 7, w);
  return b;
};
const webpX = (w: number, h: number) => {
  const b = new Uint8Array(64);
  const put = (s: string, i: number) =>
    b.set(
      [...s].map((c) => c.charCodeAt(0)),
      i,
    );
  put("RIFF", 0);
  put("WEBP", 8);
  put("VP8X", 12);
  const dv = new DataView(b.buffer);
  dv.setUint16(24, (w - 1) & 0xffff, true);
  b[26] = ((w - 1) >> 16) & 0xff;
  dv.setUint16(27, (h - 1) & 0xffff, true);
  b[29] = ((h - 1) >> 16) & 0xff;
  return b;
};

describe("chart image identification (TA-b)", () => {
  it("reads PNG, JPEG and WebP sizes from the bytes", () => {
    expect(readChartImage(pngOf(1600, 900))).toEqual({
      ok: true,
      image: {
        extension: "png",
        contentType: "image/png",
        width: 1600,
        height: 900,
      },
    });
    expect(readChartImage(jpegOf(1280, 720))).toMatchObject({
      ok: true,
      image: { extension: "jpg", width: 1280, height: 720 },
    });
    expect(readChartImage(webpX(1920, 1080))).toMatchObject({
      ok: true,
      image: { extension: "webp", width: 1920, height: 1080 },
    });
  });

  it("refuses other formats whatever the file is called", () => {
    const svg = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    );
    const gif = new TextEncoder().encode("GIF89a.........................");
    for (const bytes of [svg, gif, new Uint8Array(0)])
      expect(readChartImage(bytes).ok).toBe(false);
  });

  it("refuses tiny, huge and oversized images", () => {
    expect(readChartImage(pngOf(120, 80)).ok).toBe(false);
    expect(readChartImage(pngOf(20000, 900)).ok).toBe(false);
    const big = new Uint8Array(CHART_MAX_BYTES + 1);
    big.set(pngOf(1600, 900));
    expect(readChartImage(big)).toEqual({
      ok: false,
      reason: "Charts must be 4 MB or smaller",
    });
  });
});
