# Muff-Mojo website 🧁

The landing page for [Muff-Mojo](https://chromewebstore.google.com/detail/muff-mojo-%F0%9F%A7%81/pbngdkapkjlkimhjhbkdcfppegcknjke), a Chrome extension that turns words into emojis while you type in WhatsApp Web and Instagram. Type `party` and 🎉 pops up above the cursor. Press <kbd>Tab</kbd> and it's in.

The site has a live demo, a playground that behaves like the extension, and a searchable list of all 1,914 emoji and the words that trigger them.

## Project structure

```
index.html                 the page
assets/
  css/styles.css           all styles
  js/main.js               demo chat, playground, word list, animations
  js/emoji-data.js         the extension's emoji dictionary (copied, see below)
  js/emojis.js             the extension's matching rules (copied, see below)
  img/                     favicon, photo
  img/emoji-3d/            3D emoji images (Microsoft Fluent Emoji, MIT)
scripts/
  generate-emojis.js       copies the dictionary over from the extension
store/
  store.html               Chrome Web Store screenshots and promo tiles
  render.py                renders store.html to PNG
  out/                     the finished store images
```

It's plain HTML, CSS and JavaScript with no build step. Animations use [GSAP](https://gsap.com/) from a CDN; if it fails to load, the page still works, just without motion.

## Running it locally

Any static file server works, for example:

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Updating the word list

The site uses the extension's own dictionary (`emoji-data.js`) and matching code (`emojis.js`), so the word list, the categories and the playground always match what the extension does. That includes ignoring capitals, `_` and `-`, so `Thumbs_Up`, `thumbs-up` and `thumbsup` all give 👍.

After changing the dictionary in the extension (Muff-Mojo v3 or later), copy it over:

```bash
node scripts/generate-emojis.js ../MuffMojo
```

The script checks that both files load, copies them into `assets/js/` and prints the emoji, word and category counts. The numbers on the page are filled in from the data, so they update on their own.

## Store images

`store/out/` has everything the Chrome Web Store listing asks for, all 24-bit PNG with no alpha:

| File | Size |
| --- | --- |
| `screenshot-1-type-a-word.png` to `screenshot-5-features.png` | 1280 × 800 |
| `small-promo-440x280.png` | 440 × 280 |
| `marquee-promo-1400x560.png` | 1400 × 560 |

The suggestions shown in the pictures are real: `store.html` builds them from the dictionary the same way the extension does. To change the text or rebuild them (needs Chrome or Edge, and Pillow):

```bash
python store/render.py
```

Add an image's id (`shot1` to `shot5`, `small`, `marquee`) to render only that one, for example `python store/render.py shot3`.

## Cache busting

CSS and JS links in `index.html` end in `?v=N`. Bump the number when you change those files (including after copying a new word list) so browsers load the new version.

## Credits

Made by [Mohammad Owais](https://github.com/owaismohammad). 3D emoji from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT). Emoji data from [unicode-emoji-json](https://github.com/muan/unicode-emoji-json) and [emojilib](https://github.com/muan/emojilib) (MIT), via the extension.
