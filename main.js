// ==========================================================
// data.js の内容を読み取って、ページに表示する処理です。
// 内容を変えたいときは、このファイルではなく data.js を編集してください。
// ==========================================================

const data = SITE_DATA;

// --- 小さな部品を作る関数 ---------------------------------

// タグ名・クラス名・文字を指定して要素を作る
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// リストが空のときに「準備中」と表示する
function showComingSoon(container) {
  container.appendChild(el("p", "coming-soon", "準備中です。"));
}

// 見出しと本文のカード
function card(title, text) {
  const box = el("div", "card");
  box.appendChild(el("h4", "card-title", title));
  if (text) box.appendChild(el("p", "card-text", text));
  return box;
}

// 「ラベル：値」の一覧（<dl>）
function fillInfoList(container, items) {
  items.forEach((item) => {
    container.appendChild(el("dt", "", item.label));
    container.appendChild(el("dd", "", item.value));
  });
}

// --- 各セクションの表示 -----------------------------------

// 1. トップ
function renderHero() {
  document.getElementById("hero-name").textContent = data.hero.name;
  document.getElementById("hero-kana").textContent = data.hero.nameKana;

  const photoBox = document.getElementById("hero-photo");
  const img = el("img");
  img.src = data.hero.photo;
  img.alt = data.hero.name + "の写真";
  // 画像が見つからないときは、名前の頭文字を代わりに出す
  img.onerror = () => {
    photoBox.textContent = data.hero.name.charAt(0);
    photoBox.classList.add("no-photo");
  };
  photoBox.appendChild(img);
}

// 2. 基本情報
function renderAbout() {
  fillInfoList(document.getElementById("about-items"), data.about.items);
  const intro = document.getElementById("about-intro");
  data.about.intro.forEach((line) => intro.appendChild(el("p", "", line)));
}

// 3. 年表
function renderTimeline() {
  const list = document.getElementById("timeline-list");
  data.timeline.forEach((item) => {
    const li = el("li", "timeline-item");
    li.appendChild(el("span", "timeline-when", item.when));
    li.appendChild(el("span", "timeline-what", item.what));
    list.appendChild(li);
  });
}

// 4. 好きなこと・話しかけネタ
function renderLikes() {
  const list = document.getElementById("likes-list");
  data.likes.forEach((item) => list.appendChild(card(item.title, item.text)));

  const topics = document.getElementById("talk-topics");
  data.talkTopics.forEach((t) => topics.appendChild(el("li", "", t)));
}

// 5. 資格・スキル
function renderSkills() {
  const list = document.getElementById("skills-list");
  if (data.skills.length === 0) return showComingSoon(list);
  data.skills.forEach((s) => {
    const text = s.date ? `${s.name}（${s.date}）` : s.name;
    list.appendChild(el("li", "", text));
  });
}

// 6. 強み
function renderStrengths() {
  const list = document.getElementById("strengths-list");
  if (data.strengths.length === 0) return showComingSoon(list);
  data.strengths.forEach((s) => list.appendChild(card(s.title, s.episode)));
}

// 7. 取扱説明書
function renderManual() {
  const m = data.manual;

  const box = document.getElementById("manual-misunderstanding");
  box.appendChild(el("p", "callout-said", `よく言われること：「${m.misunderstanding.said}」`));
  box.appendChild(el("p", "callout-truth", m.misunderstanding.truth));

  fillInfoList(document.getElementById("manual-items"), m.items);

  const list = document.getElementById("weaknesses-list");
  if (m.weaknesses.length === 0) return showComingSoon(list);
  m.weaknesses.forEach((w) => list.appendChild(card(w.weakness, "対処法：" + w.howToCope)));
}

// 8. 連絡先・SNS
function renderContact() {
  const list = document.getElementById("sns-list");
  data.sns.forEach((s) => {
    const li = el("li");
    if (s.url) {
      const a = el("a", "sns-link", s.service);
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      li.appendChild(a);
    } else {
      li.appendChild(el("span", "sns-link is-empty", `${s.service}（準備中）`));
    }
    list.appendChild(li);
  });
  document.getElementById("contact-note").textContent = data.contactNote;
}

// QRコード（F-10）
function renderQr() {
  const box = document.getElementById("qr-code");
  const url = data.siteUrl || location.href;
  if (typeof qrcode !== "function") {
    box.textContent = "QRコードを表示できませんでした。";
    return;
  }
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
}

// スクロール演出（F-11）：画面に入ったセクションをふわっと表示
function setupScrollAnimation() {
  const sections = document.querySelectorAll(".section");
  // 古いブラウザでは演出なしでそのまま表示
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  sections.forEach((s) => {
    s.classList.add("fade-in");
    observer.observe(s);
  });
}

// --- 実行 -------------------------------------------------
renderHero();
renderAbout();
renderTimeline();
renderLikes();
renderSkills();
renderStrengths();
renderManual();
renderContact();
renderQr();
setupScrollAnimation();
