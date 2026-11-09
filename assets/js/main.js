(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const DATA = window.MOJO_EMOJIS || [];
  const LOOKUP = Object.fromEntries(DATA.map(([w, e]) => [w, e]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const burger = $("#navBurger"), links = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }));

  // underline the nav link for the section in view
  const navMap = new Map($$("a", links).map(a => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    navMap.forEach(a => a.classList.remove("is-active"));
    navMap.get(en.target.id)?.classList.add("is-active");
  }), { rootMargin: "-45% 0px -50% 0px" });
  navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function addBubble(box, text, dir, max = 5) {
    const b = document.createElement("div");
    b.className = `bubble ${dir}`;
    b.textContent = text;
    box.appendChild(b);
    while (box.children.length > max) box.firstElementChild.remove();
    box.scrollTop = box.scrollHeight;
  }

  /* ---------- Hero chat demo ---------- */
  const demo = [
    { text: "obviously, it's gonna be fire", word: "fire", reply: "yesss see you there" },
    { text: "sending you a big hug", word: "hug", reply: "aww thank you" },
    { text: "movie night needs popcorn", word: "popcorn", reply: "I'll bring the snacks" },
    { text: "that meme had me skull", word: "skull", reply: "LMAOO same" },
  ];
  const chat = $("#demoChat"), demoText = $("#demoText"), tip = $("#demoTip"), tipEmoji = $("#demoTipEmoji");

  (async function runDemo() {
    if (reduceMotion) {
      addBubble(chat, "obviously, it's gonna be 🔥", "out");
      addBubble(chat, "yesss see you there", "in");
      return;
    }
    for (let i = 0; ; i++) {
      const step = demo[i % demo.length];
      for (let c = 1; c <= step.text.length; c++) {
        demoText.textContent = step.text.slice(0, c);
        await sleep(45 + Math.random() * 60);
      }
      tipEmoji.textContent = LOOKUP[step.word];
      tip.style.left = Math.max(0, demoText.offsetWidth - 20) + "px";
      tip.classList.add("show");
      await sleep(1100);
      demoText.textContent = step.text.slice(0, -step.word.length) + LOOKUP[step.word];
      tip.classList.remove("show");
      await sleep(700);
      addBubble(chat, demoText.textContent, "out");
      demoText.textContent = "";
      await sleep(900);
      addBubble(chat, step.reply, "in");
      await sleep(1600);
    }
  })();

  /* ---------- Playground (same rules as the extension) ---------- */
  const pInput = $("#playInput"), pTip = $("#playTip"), pTipEmoji = $("#playTipEmoji"),
        pMeasure = $("#playMeasure"), pChat = $("#playChat"), pStatus = $("#playStatus");
  let pMatch = null;

  function updatePlayTip() {
    const caret = pInput.selectionStart ?? pInput.value.length;
    const before = pInput.value.slice(0, caret);
    const start = before.lastIndexOf(" ") + 1;
    const word = before.slice(start);
    const emoji = LOOKUP[word];
    if (emoji) {
      pMatch = { word, start, end: caret, emoji };
      pTipEmoji.textContent = emoji;
      pMeasure.textContent = pInput.value.slice(0, start);
      const x = 14 + pMeasure.offsetWidth - pInput.scrollLeft;
      pTip.style.left = Math.min(Math.max(0, x), pInput.offsetWidth - 70) + "px";
      pTip.classList.add("show");
      pStatus.innerHTML = `<b>${word}</b> → ${emoji}. Press <kbd>↑</kbd> or tap the bubble.`;
    } else {
      pMatch = null;
      pTip.classList.remove("show");
      pStatus.textContent = pInput.value ? "No emoji for that last word (yet)." : "Waiting for a word…";
    }
  }

  function insertMatch() {
    if (!pMatch) return false;
    const v = pInput.value;
    pInput.value = v.slice(0, pMatch.start) + pMatch.emoji + v.slice(pMatch.end);
    const pos = pMatch.start + pMatch.emoji.length;
    pInput.setSelectionRange(pos, pos);
    pInput.focus();
    pStatus.innerHTML = `Done, <b>${pMatch.word}</b> is now ${pMatch.emoji}`;
    burst(pMatch.emoji);
    pMatch = null;
    pTip.classList.remove("show");
    return true;
  }

  // little explosion of the chosen emoji from where the bubble was
  function burst(emoji) {
    if (reduceMotion) return;
    const box = $(".play__box");
    const boxR = box.getBoundingClientRect(), tipR = pTip.getBoundingClientRect();
    const ox = tipR.left - boxR.left + 16, oy = tipR.top - boxR.top + 10;
    for (let n = 0; n < 12; n++) {
      const s = document.createElement("span");
      s.className = "burst";
      s.textContent = emoji;
      s.style.left = ox + "px";
      s.style.top = oy + "px";
      box.appendChild(s);
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.4;
      const d = 60 + Math.random() * 90;
      s.animate([
        { transform: "translate(0,0) scale(.4) rotate(0)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(${.8 + Math.random() * .6}) rotate(${(Math.random() - .5) * 120}deg)`, opacity: 1, offset: .6 },
        { transform: `translate(${Math.cos(a) * d * 1.1}px, ${Math.sin(a) * d + 60}px) scale(.6)`, opacity: 0 },
      ], { duration: 900 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => s.remove();
    }
  }

  pInput.addEventListener("input", updatePlayTip);
  pInput.addEventListener("click", updatePlayTip);
  pInput.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && insertMatch()) e.preventDefault();
    if (e.key === "Escape") { pTip.classList.remove("show"); pMatch = null; }
  });
  pTip.addEventListener("mousedown", e => { e.preventDefault(); insertMatch(); });

  const replies = ["haha ok that's cute", "wait how did you type that so fast", "teach me 🙏", "the vibes", "lol"];
  let replyIdx = 0;
  $("#playForm").addEventListener("submit", e => {
    e.preventDefault();
    const msg = pInput.value.trim();
    if (!msg) return;
    addBubble(pChat, msg, "out", 30);
    pInput.value = "";
    updatePlayTip();
    setTimeout(() => addBubble(pChat, replies[replyIdx++ % replies.length], "in", 30), 700);
  });

  $$("[data-try]").forEach(btn => btn.addEventListener("click", () => {
    const sep = pInput.value && !pInput.value.endsWith(" ") ? " " : "";
    pInput.value += sep + btn.dataset.try;
    pInput.focus();
    pInput.setSelectionRange(pInput.value.length, pInput.value.length);
    updatePlayTip();
  }));

  /* ---------- Word list ---------- */
  const grid = $("#dictGrid"), search = $("#dictSearch"), filtersEl = $("#dictCats"),
        countEl = $("#dictCount"), emptyEl = $("#dictEmpty");
  const counts = DATA.reduce((m, [, , c]) => (m[c] = (m[c] || 0) + 1, m), {});
  const catNames = Object.keys(counts);
  let activeCat = "All";

  filtersEl.innerHTML = ["All", ...catNames].map(c =>
    `<button class="tag" data-cat="${c}" aria-pressed="false">${c}<small>${c === "All" ? DATA.length : counts[c]}</small></button>`
  ).join("");

  function setCat(cat) {
    activeCat = cat;
    $$(".tag", filtersEl).forEach(b => {
      const on = b.dataset.cat === cat;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
    });
    renderGrid();
  }
  filtersEl.addEventListener("click", e => {
    const b = e.target.closest("[data-cat]");
    if (b) setCat(b.dataset.cat);
  });

  const strip = s => s.replace(/️/g, "");
  function renderGrid() {
    const raw = search.value.trim();
    const q = raw.toLowerCase();
    const isEmoji = /\p{Extended_Pictographic}/u.test(raw);
    const rows = DATA.filter(([w, e, c]) =>
      (activeCat === "All" || c === activeCat) &&
      (!q || (isEmoji ? strip(e).includes(strip(raw)) : w.toLowerCase().includes(q)))
    );
    grid.innerHTML = rows.map(([w, e]) =>
      `<button class="word" data-word="${w}" title="Copy ${w}"><span class="word__emoji">${e}</span><span class="word__name">${w}</span></button>`
    ).join("");
    emptyEl.hidden = rows.length > 0;
    // the grid's height changed, so scroll animations further down need new positions
    if (window.ScrollTrigger) { clearTimeout(renderGrid.t); renderGrid.t = setTimeout(() => window.ScrollTrigger.refresh(), 150); }
    countEl.textContent = rows.length
      ? `Showing ${rows.length} word${rows.length === 1 ? "" : "s"}${activeCat !== "All" ? ` in ${activeCat}` : ""}`
      : "";
  }

  let searchTimer;
  search.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(renderGrid, 80); });
  $("#dictReset").addEventListener("click", () => { search.value = ""; setCat("All"); search.focus(); });

  grid.addEventListener("click", async e => {
    const card = e.target.closest(".word");
    if (!card) return;
    const w = card.dataset.word;
    try { await navigator.clipboard.writeText(w); toast(`Copied "${w}". Type it to get ${LOOKUP[w]}`); }
    catch { toast(`Type "${w}" to get ${LOOKUP[w]}`); }
    card.classList.add("copied");
    setTimeout(() => card.classList.remove("copied"), 1000);
  });

  /* ---------- Category cards ---------- */
  const catIcon = { Popular: "🔥", Faces: "😂", Hands: "👍", Food: "🍕", "Gen Z": "💀", Water: "🌊", Fantasy: "🦄", Animals: "🐶", Nature: "🌸" };
  $("#catCards").innerHTML = catNames.map((c, i) =>
    `<a class="cat card" href="#words" data-cat="${c}"><div class="cat__pic bg-${i % 6}"><span class="cat__emoji">${catIcon[c] || "✨"}</span></div><strong>${c}</strong><small>${counts[c]} words</small></a>`
  ).join("");

  /* ---------- Ribbons ---------- */
  const ribbonHTML = words => {
    const one = words.filter(w => LOOKUP[w]).map(w => `<span class="ribbon__item">${w} <b>→</b> <i>${LOOKUP[w]}</i> <b>✱</b></span>`).join("");
    return one + one;
  };
  $("#ribbonA").innerHTML = ribbonHTML(["fire", "hug", "skull", "pizza", "crown", "sparkles", "love", "party", "coffee", "unicorn"]);
  $("#ribbonB").innerHTML = ribbonHTML(["melting", "salute", "pleading", "brain", "ghost", "rainbow", "popcorn", "cool", "pray", "eyes"]);

  $("#catCards").addEventListener("click", e => {
    const a = e.target.closest("[data-cat]");
    if (a) { search.value = ""; setCat(a.dataset.cat); }
  });

  setCat("All");

  /* ---------- Night sky stars ---------- */
  const stars = $("#stars");
  if (stars) {
    stars.innerHTML = Array.from({ length: 70 }, () => {
      const s = (Math.random() * 2 + 1).toFixed(1);
      return `<i class="star" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 75).toFixed(2)}%;width:${s}px;height:${s}px;animation-delay:${(-Math.random() * 3).toFixed(2)}s"></i>`;
    }).join("");
  }

  /* ---------- Section dots ---------- */
  const dotSections = [["top", "hi"], ["categories", "vibes"], ["how", "how"], ["playground", "try it"], ["words", "every word"], ["about", "me"], ["hello", "bye!"]]
    .filter(([id]) => document.getElementById(id));
  const dotsEl = $("#dots");
  dotsEl.innerHTML = dotSections.map(([id, label]) => `<a href="#${id}" aria-label="${label}"><span>${label}</span></a>`).join("");
  const dotMap = new Map(dotSections.map(([id], i) => [id, dotsEl.children[i]]));
  const dotSpy = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    dotMap.forEach(a => a.classList.remove("is-active"));
    dotMap.get(en.target.id)?.classList.add("is-active");
  }), { rootMargin: "-50% 0px -50% 0px" });
  dotMap.forEach((_, id) => dotSpy.observe(document.getElementById(id)));


  /* ---------- Motion (GSAP). If it fails to load, the page just stays still. ---------- */
  const gsap = window.gsap, ST = window.ScrollTrigger;
  if (!gsap || !ST || reduceMotion) {
    return;
  }
  gsap.registerPlugin(ST);
  // web fonts change line heights; recalculate trigger positions once they're in
  document.fonts?.ready.then(() => ST.refresh());


  // night finale: emojis rise up from behind the planet
  gsap.from(".night__cheers", { y: 180, duration: 1, ease: "back.out(1.3)", scrollTrigger: { trigger: ".night", start: "top 70%", once: true } });

  // hero entrance: text stays visible, only the artwork pops in
  const intro = gsap.timeline({ defaults: { ease: "back.out(1.6)" } });
  intro
    .from(".hero__shape", { scale: .7, rotate: -25, opacity: 0, duration: .6 })
    .from(".hero__art .phone", { y: 40, rotate: 5, opacity: 0, duration: .5 }, "-=.4")
    .from(".hero__art .e3d, .hero__art .doodle", { scale: 0, rotate: -40, duration: .45, stagger: .06, ease: "back.out(2.2)" }, "-=.25");

  // parallax: anything with data-speed drifts at its own rate while scrolling
  $$("[data-speed]").forEach(el => {
    const speed = parseFloat(el.dataset.speed);
    gsap.to(el, {
      yPercent: (1 - speed) * 120,
      ease: "none",
      scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // hero emojis lean toward the mouse
  const tiltEls = $$("[data-tilt]");
  const art = $(".hero__art");
  art.addEventListener("pointermove", e => {
    const r = art.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
    tiltEls.forEach(el => {
      const k = parseFloat(el.dataset.tilt);
      gsap.to(el, { x: dx * k, y: dy * k, rotate: dx * k * .6, duration: .6, ease: "power2.out", overwrite: "auto" });
    });
  });

  // cards drop in as they scroll into view
  const drop = (selector, opts = {}) => {
    const els = $$(selector);
    gsap.set(els, { y: 50, opacity: 0, rotate: () => (Math.random() - .5) * 6 });
    ST.batch(els, {
      start: "top 88%",
      once: true,
      onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, rotate: 0, duration: .6, stagger: .08, ease: "back.out(1.5)", ...opts }),
    });
  };
  drop(".cat");
  drop(".how__card");
  drop(".faq details");

  gsap.from(".play__box", {
    rotate: 4, y: 60, opacity: 0, duration: .8, ease: "back.out(1.4)",
    scrollTrigger: { trigger: ".play__box", start: "top 85%", once: true },
  });
  gsap.from(".about__photo", {
    rotate: -12, scale: .85, opacity: 0, duration: .8, ease: "back.out(1.6)",
    scrollTrigger: { trigger: ".about__photo", start: "top 85%", once: true },
  });

  // ribbons speed up / tilt a bit with scroll velocity
  ST.create({
    trigger: ".ribbons", start: "top bottom", end: "bottom top",
    onUpdate: self => {
      const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
      gsap.to(".ribbon--yellow", { rotate: -3 - v * .3, duration: .4, overwrite: "auto" });
      gsap.to(".ribbon--pink", { rotate: 3 + v * .3, duration: .4, overwrite: "auto" });

    },
  });
})();
