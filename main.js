// ==========================================================
// data.js の内容を読み取って、ページに表示し、動きをつける処理です。
// 内容を変えたいときは、このファイルではなく data.js を編集してください。
//
// 使っている外部ライブラリ（lib/ フォルダ）
//   GSAP / ScrollTrigger … アニメーション
//   Lenis              … なめらかなスクロール
//   Phosphor Icons      … アイコン
//   qrcode-generator    … QRコード
// ==========================================================

const data = SITE_DATA;
const root = document.documentElement;

// 「動きを減らす」設定の人や、ライブラリが読めなかったときは演出なしで表示する
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canAnimate = !prefersReducedMotion && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
if (canAnimate) root.classList.add("motion");

// ==========================================================
// 小さな部品
// ==========================================================

function $(id) {
  return document.getElementById(id);
}

// タグ名・クラス名・文字を指定して要素を作る
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// アイコン（lib/icons.js）を要素として作る
function icon(name, className) {
  const span = el("span", "icon" + (className ? " " + className : ""));
  span.innerHTML = (typeof ICONS !== "undefined" && ICONS[name]) || "";
  return span;
}

// 文字を1文字ずつ <span> に分ける（アニメーション用）
function splitChars(target, text, className) {
  target.textContent = "";
  target.setAttribute("aria-label", text);
  [...text].forEach((ch) => {
    const span = el("span", className || "char", ch === " " ? " " : ch);
    span.setAttribute("aria-hidden", "true");
    target.appendChild(span);
  });
  return target.querySelectorAll("span");
}

// 中身が空のときの表示
function comingSoon(container, message) {
  const box = el("div", "coming-soon");
  box.appendChild(el("p", "coming-soon-title", "準備中です"));
  box.appendChild(el("p", "coming-soon-text", message || "近いうちに書き足します。"));
  container.appendChild(box);
}

// ==========================================================
// 各セクションの表示
// ==========================================================

function renderHero() {
  const { name, nameKana, photo, facts } = data.hero;

  // 名前：原稿用紙のマスに1文字ずつ
  const nameBox = $("hero-name");
  nameBox.setAttribute("aria-label", name);
  [...name].forEach((ch) => {
    const cell = el("span", ch === " " ? "cell is-blank" : "cell");
    cell.setAttribute("aria-hidden", "true");
    cell.appendChild(el("span", "cell-char", ch === " " ? "" : ch));
    nameBox.appendChild(cell);
  });

  $("hero-kana").textContent = nameKana;
  $("header-logo").textContent = name.replace(" ", "");
  $("intro-name").textContent = name.replace(" ", "");
  $("footer-copy").textContent = `© ${new Date().getFullYear()} ${name.replace(" ", "")}`;
  $("manual-name").textContent = name;
  $("manual-since").textContent = data.manual.since || "";

  // 写真（無いときは頭文字）
  const photoBox = $("hero-photo");
  const img = el("img");
  img.src = photo;
  img.alt = name + "の写真";
  img.onerror = () => {
    img.remove();
    photoBox.classList.add("no-photo");
    photoBox.appendChild(el("span", "no-photo-char", name.charAt(0)));
  };
  photoBox.appendChild(img);

  const factList = $("hero-facts");
  (facts || []).forEach((f) => factList.appendChild(el("li", "", f)));

  $("to-top").appendChild(icon("arrowDown", "to-top-icon"));
}

function renderAbout() {
  const intro = $("about-intro");
  data.about.intro.forEach((line) => intro.appendChild(el("p", "reveal-line", line)));

  const list = $("about-items");
  data.about.items.forEach((item) => {
    const row = el("div", "info-row");
    row.appendChild(el("dt", "", item.label));
    row.appendChild(el("dd", "", item.value));
    list.appendChild(row);
  });
}

function renderStory() {
  if (!data.story) {
    $("story").remove();
    return;
  }
  $("story-label").textContent = data.story.label;
  splitChars($("story-text"), data.story.text, "story-char");
}

function renderTimeline() {
  const list = $("timeline-list");
  data.timeline.forEach((item, i) => {
    const li = el("li", "timeline-item");
    if (i === data.timeline.length - 1) li.classList.add("is-goal");
    li.appendChild(el("span", "timeline-dot"));
    li.appendChild(el("span", "timeline-when", item.when));
    li.appendChild(el("p", "timeline-what", item.what));
    list.appendChild(li);
  });
}

function renderLikes() {
  const track = $("likes-list");
  data.likes.forEach((item) => {
    const card = el("article", "like-card");
    card.appendChild(icon(item.icon || "heart", "like-icon"));
    card.appendChild(el("h3", "like-title", item.title));
    card.appendChild(el("p", "like-text", item.text));
    track.appendChild(card);
  });
}

// 話しかけネタ：チャット風に表示
function renderTalkTopics() {
  const box = $("talk-topics");
  data.talkTopics.forEach((topic) => {
    const row = el("div", "chat-row");
    const avatar = el("span", "chat-avatar", data.hero.name.charAt(0));
    avatar.setAttribute("aria-hidden", "true");
    row.appendChild(avatar);

    const bubble = el("p", "chat-bubble");
    const typing = el("span", "chat-typing");
    typing.setAttribute("aria-hidden", "true");
    typing.append(el("i"), el("i"), el("i"));
    bubble.appendChild(typing);
    bubble.appendChild(el("span", "chat-message", topic));
    row.appendChild(bubble);
    box.appendChild(row);
  });
}

function renderSkills() {
  const list = $("skills-list");
  if (data.skills.length === 0) {
    comingSoon(list, "これから取りたい資格も含めて書き足します。");
  } else {
    data.skills.forEach((s) => {
      const li = el("li", "skill-item");
      li.appendChild(icon("check", "skill-icon"));
      li.appendChild(el("span", "skill-name", s.name));
      if (s.date) li.appendChild(el("span", "skill-date", s.date));
      list.appendChild(li);
    });
  }

  const strengths = $("strengths-list");
  if (data.strengths.length === 0) {
    comingSoon(strengths, "エピソードと一緒に書き足します。");
  } else {
    data.strengths.forEach((s) => {
      const card = el("article", "strength-card");
      card.appendChild(icon("lightning", "strength-icon"));
      card.appendChild(el("h4", "strength-title", s.title));
      card.appendChild(el("p", "strength-text", s.episode));
      strengths.appendChild(card);
    });
  }
}

function renderManual() {
  const m = data.manual;

  const spec = $("manual-items");
  m.items.forEach((item) => {
    const row = el("div", "spec-row");
    row.appendChild(el("dt", "", item.label));
    row.appendChild(el("dd", "", item.value));
    spec.appendChild(row);
  });

  const cautions = $("manual-cautions");
  if (!m.cautions || m.cautions.length === 0) {
    $("manual-caution-part").remove();
  } else {
    m.cautions.forEach((c) => {
      const box = el("div", "caution");
      box.appendChild(icon("warning", "caution-icon"));
      const body = el("div", "caution-body");
      body.appendChild(el("p", "caution-label", c.label));
      body.appendChild(el("p", "caution-text", c.value));
      box.appendChild(body);
      cautions.appendChild(box);
    });
  }

  // 「故障かな？と思ったら」：よくある誤解と本当のところ
  const faq = $("manual-misunderstanding");
  const q = el("div", "faq-q");
  q.appendChild(el("span", "faq-mark", "症状"));
  q.appendChild(el("p", "", `「${m.misunderstanding.said}」と言われる`));
  const a = el("div", "faq-a");
  a.appendChild(el("span", "faq-mark", "対処"));
  a.appendChild(el("p", "", `故障ではありません。${m.misunderstanding.truth}`));
  faq.append(q, a);

  const weak = $("weaknesses-list");
  if (m.weaknesses.length === 0) {
    comingSoon(weak, "自分なりの対処法とセットで書き足します。");
  } else {
    m.weaknesses.forEach((w) => {
      const item = el("div", "weakness");
      item.appendChild(el("p", "weakness-title", w.weakness));
      item.appendChild(el("p", "weakness-cope", "対処法：" + w.howToCope));
      weak.appendChild(item);
    });
  }
}

function renderContact() {
  $("contact-note").textContent = data.contactNote;

  const list = $("sns-list");
  data.sns.forEach((s) => {
    const li = el("li");
    if (s.url) {
      const a = el("a", "sns-button");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.append(icon(s.icon || "arrowUpRight", "sns-icon"), el("span", "", s.service));
      li.appendChild(a);
    } else {
      const span = el("span", "sns-button is-empty");
      span.append(icon(s.icon || "arrowUpRight", "sns-icon"), el("span", "", `${s.service}（準備中）`));
      li.appendChild(span);
    }
    list.appendChild(li);
  });
}

function renderQr() {
  const box = $("qr-code");
  if (typeof qrcode !== "function") {
    box.textContent = "QRコードを表示できませんでした。";
    return;
  }
  const qr = qrcode(0, "M");
  qr.addData(data.siteUrl || location.href);
  qr.make();
  box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
}

// ==========================================================
// 操作（メニュー・ページ内リンク）
// ==========================================================

let lenis = null;

function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.4 });
  else document.querySelector(target)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function setupMenu() {
  const button = $("menu-button");
  const nav = $("nav");

  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && canAnimate) {
      gsap.fromTo(nav.querySelectorAll("a"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power3.out", delay: 0.15 });
    }
  };

  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  // ページ内リンクは Lenis でなめらかに移動
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = a.getAttribute("href");
      if (target.length < 2 || !document.querySelector(target)) return;
      e.preventDefault();
      setOpen(false);
      scrollToTarget(target);
    });
  });
}

// ==========================================================
// アニメーション
// ==========================================================

function setupSmoothScroll() {
  if (typeof Lenis === "undefined") return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// 読み込み時：紺の幕に名前 → 幕が上がってトップの名前がマスに書き込まれる
function playIntro() {
  const introChars = splitChars($("intro-name"), $("intro-name").textContent, "intro-char");
  const cells = document.querySelectorAll(".hero-name .cell");
  const chars = document.querySelectorAll(".hero-name .cell-char");

  gsap.set(chars, { opacity: 0, scale: 1.6 });
  gsap.set(".hero-kana", { opacity: 0, y: -12 });
  gsap.set(".hero-photo", { clipPath: "inset(100% 0 0 0)" });
  gsap.set(".hero-facts li", { opacity: 0, y: 16 });
  gsap.set(".scroll-cue, .header", { opacity: 0 });
  gsap.set(".hero-grid", { opacity: 0 });
  gsap.set(cells, { "--cell-line": 0 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => document.body.classList.remove("is-loading"),
  });

  tl.fromTo(".intro-line", { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: "power2.inOut" })
    .fromTo(introChars, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.25")
    .to({}, { duration: 0.35 })
    .to("#intro", { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
    .to(".hero-grid", { opacity: 1, duration: 1.2 }, "-=0.5")
    .to(cells, { "--cell-line": 1, duration: 0.5, stagger: 0.06 }, "-=1")
    .to(".hero-photo", { clipPath: "inset(0% 0 0 0)", duration: 1, ease: "power4.out" }, "-=0.8")
    .to(chars, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(2)" }, "-=0.6")
    .to(".hero-kana", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
    .to(".hero-facts li", { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.4")
    .to(".scroll-cue, .header", { opacity: 1, duration: 0.6 }, "-=0.3")
    .set("#intro", { display: "none" });
}

function setupScrollAnimations() {
  // トップ：スクロールでマス目がゆっくり動き、内容は少し上へ
  gsap.to(".hero-grid", {
    yPercent: 18,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero-inner", {
    yPercent: -12,
    opacity: 0.2,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // 見出し：1文字ずつ下からせり上がる
  document.querySelectorAll("[data-reveal-heading]").forEach((h) => {
    const chars = splitChars(h, h.textContent, "heading-char");
    gsap.from(chars, {
      yPercent: 110,
      duration: 0.8,
      stagger: 0.05,
      ease: "power4.out",
      scrollTrigger: { trigger: h, start: "top 85%" },
    });
  });

  // わたしについて
  gsap.from(".about-intro .reveal-line", {
    y: 28, opacity: 0, duration: 0.9, stagger: 0.15, ease: "power3.out",
    scrollTrigger: { trigger: ".about-intro", start: "top 80%" },
  });
  gsap.from(".info-row", {
    x: -16, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out",
    scrollTrigger: { trigger: ".info-list", start: "top 85%" },
  });

  // ストーリー：スクロールに合わせて文字が順に色づく
  const storyChars = document.querySelectorAll(".story-char");
  if (storyChars.length) {
    gsap.fromTo(storyChars,
      { color: "rgba(255,255,255,0.18)" },
      {
        color: "rgba(255,255,255,1)",
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: ".story", start: "top 70%", end: "bottom 60%", scrub: true },
      });
    gsap.from(".story-label", {
      opacity: 0, y: 12, duration: 0.8,
      scrollTrigger: { trigger: ".story", start: "top 75%" },
    });
  }

  // 年表：線が伸び、通過した点が青く光る
  gsap.fromTo("#timeline-fill", { scaleY: 0 }, {
    scaleY: 1,
    ease: "none",
    scrollTrigger: { trigger: ".timeline-wrap", start: "top 65%", end: "bottom 65%", scrub: true },
  });
  document.querySelectorAll(".timeline-item").forEach((item) => {
    gsap.from(item.querySelectorAll(".timeline-when, .timeline-what"), {
      x: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: item, start: "top 85%" },
    });
    ScrollTrigger.create({
      trigger: item,
      start: "top 65%",
      onEnter: () => item.classList.add("is-active"),
      onLeaveBack: () => item.classList.remove("is-active"),
    });
  });

  // 好きなこと：カードが順に浮かび上がる
  gsap.from(".like-card", {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
    scrollTrigger: { trigger: "#likes-viewport", start: "top 85%" },
  });

  // 話しかけネタ：チャットのように「入力中…」のあとに吹き出しが出る
  const rows = gsap.utils.toArray(".chat-row");
  gsap.set(rows, { opacity: 0, y: 16 });
  ScrollTrigger.create({
    trigger: "#chat",
    start: "top 75%",
    once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      rows.forEach((row) => {
        const typing = row.querySelector(".chat-typing");
        const message = row.querySelector(".chat-message");
        tl.to(row, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" })
          .call(() => row.classList.add("is-typing"))
          .to({}, { duration: 0.9 })
          .call(() => { row.classList.remove("is-typing"); row.classList.add("is-sent"); })
          .fromTo(message, { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .set(typing, { display: "none" }, "<");
      });
    },
  });

  // スキルと強み・取扱説明書・連絡先
  gsap.utils.toArray(".skills-block, .manual-part, .manual-cover").forEach((block) => {
    gsap.from(block, {
      y: 36, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: block, start: "top 85%" },
    });
  });
  gsap.from(".caution-icon", {
    rotate: -20, scale: 0.4, duration: 0.8, ease: "back.out(3)",
    scrollTrigger: { trigger: ".caution", start: "top 85%" },
  });
  gsap.from(".contact-note, .sns li, .qr", {
    y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
    scrollTrigger: { trigger: ".contact", start: "top 70%" },
  });
}

// メニューの状態・進み具合バー・今いる場所の表示
function setupHeaderState() {
  const header = $("header");
  const bar = $("progress-bar");
  const toTop = $("to-top");
  const links = [...document.querySelectorAll(".nav a")];

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    const pastHero = y > window.innerHeight * 0.6;
    header.classList.toggle("is-solid", pastHero);
    toTop.classList.toggle("is-visible", pastHero);

    // 今いるセクションのリンクに印をつける
    let current = "";
    links.forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (sec && sec.getBoundingClientRect().top < window.innerHeight * 0.4) current = a.getAttribute("href");
    });
    links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === current));
  };

  window.addEventListener("scroll", update, { passive: true });
  update();
}

// SNSボタン：マウスに少し吸い寄せられる（マウス操作の端末だけ）
function setupMagneticButtons() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll("a.sns-button").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - r.left - r.width / 2) * 0.25,
        y: (e.clientY - r.top - r.height / 2) * 0.35,
        duration: 0.4, ease: "power3.out",
      });
    });
    btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }));
  });
}

// ==========================================================
// 実行
// ==========================================================

renderHero();
renderAbout();
renderStory();
renderTimeline();
renderLikes();
renderTalkTopics();
renderSkills();
renderManual();
renderContact();
renderQr();

if (canAnimate) {
  gsap.registerPlugin(ScrollTrigger);
  setupSmoothScroll();
  setupMenu();
  setupHeaderState();
  playIntro();
  setupScrollAnimations();
  setupMagneticButtons();
  // フォント読み込み後に位置を計算し直す
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
} else {
  // 演出なし：すべてそのまま表示
  document.body.classList.remove("is-loading");
  document.querySelectorAll(".chat-row").forEach((r) => r.classList.add("is-sent"));
  document.querySelectorAll(".timeline-item").forEach((i) => i.classList.add("is-active"));
  setupMenu();
  setupHeaderState();
}
