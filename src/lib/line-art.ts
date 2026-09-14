"use client";

import { SIZE_PX, type ExportFormat, type ExportSize } from "./design";

export type LineArtOptions = {
  weight: number;
  ink: string;
  style: string;
  background: string;
  size: ExportSize;
};

/** Darkness threshold — "เส้นทึบ" keeps more of the soft edges, "เส้นเดี่ยว" only the core stroke. */
const threshold = (style: string) => (style === "เส้นทึบ" ? 100 : 150);

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("โหลดลายเส้นไม่สำเร็จ"));
    image.src = url;
  });
}

function canvasOf(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Turns the AI output (black strokes on white) into an alpha mask where the strokes are opaque,
 * thickened by the chosen line weight.
 */
async function buildMask(url: string, options: LineArtOptions, longestEdge: number) {
  const image = await loadImage(url);
  const scale = longestEdge / Math.max(image.naturalWidth, image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const source = canvasOf(width, height);
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("เบราว์เซอร์ไม่รองรับการปรับแต่งลายเส้น");
  sourceContext.drawImage(image, 0, 0, width, height);

  const pixels = sourceContext.getImageData(0, 0, width, height);
  const data = pixels.data;
  const limit = threshold(options.style);
  const binary = new Uint8Array(width * height);

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const opaque = data[i + 3] > 32;
    binary[p] = opaque && luminance < limit ? 1 : 0;
  }

  const radius = Math.max(0, Math.round(((options.weight - 1) / 4) * (longestEdge / 700)));
  const grown = radius > 0 ? dilate(binary, width, height, radius) : binary;

  return { binary: grown, width, height };
}

function dilate(binary: Uint8Array, width: number, height: number, radius: number) {
  const out = new Uint8Array(binary.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!binary[y * width + x]) continue;
      for (let dy = -radius; dy <= radius; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -radius; dx <= radius; dx += 1) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          if (dx * dx + dy * dy <= radius * radius) out[ny * width + nx] = 1;
        }
      }
    }
  }
  return out;
}

function maskToCanvas(
  mask: { binary: Uint8Array; width: number; height: number },
  options: LineArtOptions,
) {
  const canvas = canvasOf(mask.width, mask.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("เบราว์เซอร์ไม่รองรับการปรับแต่งลายเส้น");

  if (options.background === "สีขาว") {
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, mask.width, mask.height);
  }

  const strokes = context.createImageData(mask.width, mask.height);
  const [r, g, b] = hexToRgb(options.ink);
  for (let p = 0, i = 0; p < mask.binary.length; p += 1, i += 4) {
    if (!mask.binary[p]) continue;
    strokes.data[i] = r;
    strokes.data[i + 1] = g;
    strokes.data[i + 2] = b;
    strokes.data[i + 3] = 255;
  }

  const layer = canvasOf(mask.width, mask.height);
  layer.getContext("2d")?.putImageData(strokes, 0, 0);
  context.drawImage(layer, 0, 0);

  return canvas;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.replace(/(.)/g, "$1$1") : value;
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ];
}

/** Renders the adjusted line art for on-screen preview. */
export async function renderPreview(url: string, options: LineArtOptions, longestEdge = 900) {
  const mask = await buildMask(url, options, longestEdge);
  return maskToCanvas(mask, options);
}

// ---------------------------------------------------------------- vector output

const DIRECTIONS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

/** Moore-neighbour boundary tracing — every stroke outline becomes one closed polygon. */
function traceContours(binary: Uint8Array, width: number, height: number) {
  const at = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height ? binary[y * width + x] : 0;
  const visited = new Uint8Array(binary.length);
  const contours: [number, number][][] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!at(x, y) || visited[y * width + x]) continue;
      const isBoundary = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1);
      if (!isBoundary) continue;

      const contour: [number, number][] = [];
      let cx = x;
      let cy = y;
      let direction = 4; // came from the left
      const startX = x;
      const startY = y;
      let steps = 0;

      do {
        visited[cy * width + cx] = 1;
        contour.push([cx, cy]);

        let moved = false;
        for (let i = 1; i <= 8; i += 1) {
          const next = (direction + i) % 8;
          const nx = cx + DIRECTIONS[next][0];
          const ny = cy + DIRECTIONS[next][1];
          if (at(nx, ny)) {
            cx = nx;
            cy = ny;
            direction = (next + 5) % 8;
            moved = true;
            break;
          }
        }
        if (!moved) break;
        steps += 1;
      } while ((cx !== startX || cy !== startY) && steps < 200000);

      if (contour.length > 6) contours.push(contour);
    }
  }

  return contours;
}

function simplify(points: [number, number][], epsilon: number): [number, number][] {
  if (points.length < 3) return points;

  const distance = (p: [number, number], a: [number, number], b: [number, number]) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lengthSq = dx * dx + dy * dy;
    if (!lengthSq) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSq));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  };

  let index = 0;
  let maxDistance = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const d = distance(points[i], points[0], points[points.length - 1]);
    if (d > maxDistance) {
      index = i;
      maxDistance = d;
    }
  }

  if (maxDistance <= epsilon) return [points[0], points[points.length - 1]];
  return [
    ...simplify(points.slice(0, index + 1), epsilon).slice(0, -1),
    ...simplify(points.slice(index), epsilon),
  ];
}

export async function renderSvg(url: string, options: LineArtOptions) {
  const traceEdge = Math.min(SIZE_PX[options.size], 1400);
  const mask = await buildMask(url, options, traceEdge);
  const scale = SIZE_PX[options.size] / Math.max(mask.width, mask.height);
  const width = Math.round(mask.width * scale);
  const height = Math.round(mask.height * scale);

  const paths = traceContours(mask.binary, mask.width, mask.height)
    .map((contour) => simplify(contour, 0.9))
    .filter((contour) => contour.length > 3)
    .map(
      (contour) =>
        `M${contour
          .map(([x, y]) => `${(x * scale).toFixed(1)} ${(y * scale).toFixed(1)}`)
          .join("L")}Z`,
    )
    .join("");

  const background =
    options.background === "สีขาว" ? `<rect width="${width}" height="${height}" fill="#FFFFFF"/>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${background}<path d="${paths}" fill="${options.ink}" fill-rule="evenodd"/></svg>`;
}

export async function exportLineArt(url: string, options: LineArtOptions, format: ExportFormat) {
  const longestEdge = SIZE_PX[options.size];

  if (format === "SVG") {
    const svg = await renderSvg(url, options);
    return { blob: new Blob([svg], { type: "image/svg+xml" }), extension: "svg" };
  }

  const mask = await buildMask(url, options, longestEdge);
  const canvas = maskToCanvas(mask, options);

  if (format === "PNG") {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("สร้างไฟล์ PNG ไม่สำเร็จ");
    return { blob, extension: "png" };
  }

  const { jsPDF } = await import("jspdf");
  const orientation = canvas.width >= canvas.height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [canvas.width, canvas.height] });
  pdf.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    canvas.width,
    canvas.height,
    undefined,
    "FAST",
  );
  return { blob: pdf.output("blob"), extension: "pdf" };
}

// ---------------------------------------------------------------- normalization

/**
 * Forces the AI's output to pure black-on-white before it is stored.
 *
 * The prompt asks for monochrome, but the model still returns coloured or
 * grey-shaded motifs often enough that the archive cannot rely on it. Every
 * pixel darker than the threshold becomes black and the rest white, so what
 * lands in storage — and in the reviewer's queue — is always line art.
 */
export async function normalizeLineArt(dataUrl: string): Promise<Blob> {
  const image = await loadImage(dataUrl);
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const canvas = canvasOf(width, height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("เบราว์เซอร์ไม่รองรับการปรับแต่งลายเส้น");

  // White first, so any transparency in the model's PNG lands on paper.
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0);

  const pixels = context.getImageData(0, 0, width, height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const ink = luminance < NORMALIZE_THRESHOLD ? 0 : 255;
    data[i] = ink;
    data[i + 1] = ink;
    data[i + 2] = ink;
    data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("แปลงลายเส้นเป็นขาวดำไม่สำเร็จ");
  return blob;
}

/**
 * Mid-high so a coloured motif the model filled in (mid-luminance green, red,
 * gold) still resolves to ink rather than dropping out to white.
 */
const NORMALIZE_THRESHOLD = 170;
