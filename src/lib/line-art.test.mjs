/**
 * Threshold check for normalizeLineArt — run with `node src/lib/line-art.test.mjs`.
 *
 * The canvas work itself needs a browser, but the part that decides whether the
 * archive gets black-and-white line art is this one comparison. A coloured motif
 * the model filled in must land on ink, and the paper must stay paper.
 */
import assert from "node:assert/strict";

/** Keep in sync with NORMALIZE_THRESHOLD in line-art.ts. */
const NORMALIZE_THRESHOLD = 170;

const luminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const isInk = (r, g, b) => luminance(r, g, b) < NORMALIZE_THRESHOLD;

// Colours the model has actually returned when it ignored the monochrome
// instruction, sampled from a cherry motif it coloured in.
const INK = [
  ["cherry green", 76, 175, 80],
  ["dark green", 27, 94, 32],
  ["black seed", 0, 0, 0],
  ["red stem", 211, 47, 47],
  ["gold", 201, 161, 91],
  ["mid grey", 158, 158, 158],
];

const PAPER = [
  ["white", 255, 255, 255],
  ["faint grid", 224, 224, 224],
  ["near white", 245, 242, 236],
];

for (const [name, r, g, b] of INK) {
  assert.equal(isInk(r, g, b), true, `${name} should become black ink`);
}
for (const [name, r, g, b] of PAPER) {
  assert.equal(isInk(r, g, b), false, `${name} should stay white`);
}

// Ink and paper must not meet: a motif colour sitting exactly on the cutoff
// would flip with any re-encoding, so keep a margin below the lightest ink.
const lightestInk = Math.max(...INK.map(([, r, g, b]) => luminance(r, g, b)));
const darkestPaper = Math.min(...PAPER.map(([, r, g, b]) => luminance(r, g, b)));
assert.ok(
  lightestInk < NORMALIZE_THRESHOLD && darkestPaper > NORMALIZE_THRESHOLD,
  `threshold ${NORMALIZE_THRESHOLD} must separate ink (max ${lightestInk.toFixed(0)}) from paper (min ${darkestPaper.toFixed(0)})`,
);

console.log("line-art threshold: ok");
