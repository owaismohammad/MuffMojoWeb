#!/usr/bin/env node
// Copies the extension's emoji dictionary into the website, so the word list,
// the categories and the playground match exactly what Muff-Mojo supports.
//
// Usage:
//   node scripts/generate-emojis.js <path-to-extension>
//
// It copies two files from the extension (v3 and later):
//   emoji-data.js  -> assets/js/emoji-data.js   (the data: globalThis.MuffMojoEmojiData)
//   emojis.js      -> assets/js/emojis.js       (the matching rules: globalThis.MuffMojoEmojis)
// The website uses MuffMojoEmojis.exact() / .search() / .CATEGORIES directly, so typing
// "Thumbs_Up" on the site matches the same way it does in the extension.
//
// After running it, bump the ?v= numbers in index.html so browsers fetch the new files.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ext = process.argv[2];
if (!ext) {
  console.error("Usage: node scripts/generate-emojis.js <path-to-extension>");
  process.exit(1);
}

const OUT_DIR = path.join(__dirname, "..", "assets", "js");
const FILES = ["emoji-data.js", "emojis.js"];

for (const f of FILES) {
  if (!fs.existsSync(path.join(ext, f))) {
    console.error(`Can't find ${f} in ${ext}. Is that the v3 extension folder?`);
    process.exit(1);
  }
}

// Load both files the way a browser would, to make sure they work before copying.
const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ext, f), "utf8"), sandbox, { filename: f });
const E = sandbox.MuffMojoEmojis;
if (!E || !E.ALL || !E.ALL.length) {
  console.error("The extension files loaded but MuffMojoEmojis is empty.");
  process.exit(1);
}

for (const f of FILES) fs.copyFileSync(path.join(ext, f), path.join(OUT_DIR, f));

const words = new Set(E.ALL.flatMap(e => e.norm));
console.log(`Copied ${FILES.join(" + ")} to ${path.relative(process.cwd(), OUT_DIR)}`);
console.log(`${E.ALL.length} emoji, ${words.size} trigger words, ${E.ALL.filter(e => e.curated).length} hand-picked`);
console.log(E.CATEGORIES.map(c => `${c.icon} ${c.label}: ${c.entries.length}`).join("\n"));
console.log("Now bump the ?v= numbers in index.html.");
