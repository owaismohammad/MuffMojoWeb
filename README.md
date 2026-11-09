# Muff-Mojo website 🧁

The landing page for [Muff-Mojo](https://chromewebstore.google.com/detail/muff-mojo-%F0%9F%A7%81/pbngdkapkjlkimhjhbkdcfppegcknjke), a Chrome extension that turns words into emojis while you type in WhatsApp Web and Instagram. Type `fire`, press <kbd>↑</kbd>, get 🔥.

The site has a live demo, a playground that behaves like the extension, and a searchable list of every word it knows.

## Project structure

```
index.html                 the page
assets/
  css/styles.css           all styles
  js/main.js               demo chat, playground, word list, animations
  js/emojis.js             word list (generated, see below)
  img/                     favicon, photo
  img/emoji-3d/            3D emoji images (Microsoft Fluent Emoji, MIT)
scripts/
  generate-emojis.js       rebuilds assets/js/emojis.js from the extension
```

It's plain HTML, CSS and JavaScript with no build step. Animations use [GSAP](https://gsap.com/) from a CDN; if it fails to load, the page still works, just without motion.

## Running it locally

Any static file server works, for example:

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Updating the word list

The word list comes from the extension's source, so the site always matches what the extension supports:

```bash
node scripts/generate-emojis.js ../MuffMojo/content5.js
```

## Cache busting

CSS and JS links in `index.html` end in `?v=N`. Bump the number when you change those files so browsers load the new version.

## Credits

Made by [Mohammad Owais](https://github.com/owaismohammad). 3D emoji from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT).
