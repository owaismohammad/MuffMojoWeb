#!/usr/bin/env node
// Rebuilds assets/js/emojis.js from the extension's keyword list, so the
// website's word list always matches what Muff-Mojo actually supports.
//
// Usage:
//   node scripts/generate-emojis.js <path-to-extension>/content5.js
//
// It reads the object returned by getEmojiList() and uses the "// Category"
// comments inside it to group words. The first entry for a word wins.

const fs = require("fs");
const path = require("path");

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/generate-emojis.js <path-to-extension>/content5.js");
  process.exit(1);
}

const OUT = path.join(__dirname, "..", "assets", "js", "emojis.js");

// comment in the extension source -> category shown on the website
const CATEGORIES = {
  "Popular emojis": "Popular",
  "Face emojis": "Faces",
  "Hand emojis": "Hands",
  "Food emojis": "Food",
  "Gen Z emojis": "Gen Z",
  "Miscellaneous Gen Z additions": "Gen Z",
  "Water": "Water",
  "Fantasy": "Fantasy",
  "Animals": "Animals",
  "Nature": "Nature",
};

const rows = [];
const seen = new Set();
let inList = false;
let category = null;

for (const line of fs.readFileSync(src, "utf8").split("\n")) {
  if (line.includes("function getEmojiList")) inList = true;
  if (!inList) continue;
  if (line.includes("function getCaretCoordinates")) break;

  const comment = line.match(/^\s*\/\/\s*(.+?)\s*$/);
  if (comment) {
    if (CATEGORIES[comment[1]]) category = CATEGORIES[comment[1]];
    continue;
  }

  const entry = line.match(/^\s*([A-Za-z_]+)\s*:\s*'([^']+)'/);
  if (entry && category && !seen.has(entry[1])) {
    seen.add(entry[1]);
    rows.push([entry[1], entry[2], category]);
  }
}

const body = rows.map(r => "  " + JSON.stringify(r).replace(/","/g, '", "')).join(",\n");
fs.writeFileSync(
  OUT,
  "// Generated from the extension's keyword list (content5.js). [keyword, emoji, category]\n" +
  "// Rebuild with: node scripts/generate-emojis.js <path-to-extension>/content5.js\n" +
  `window.MOJO_EMOJIS = [\n${body}\n];\n`
);

const counts = rows.reduce((m, [, , c]) => ((m[c] = (m[c] || 0) + 1), m), {});
console.log(`Wrote ${rows.length} words to ${path.relative(process.cwd(), OUT)}`, counts);
