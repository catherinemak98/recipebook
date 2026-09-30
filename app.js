const CATEGORIES = [
  ["all", { en: "All", id: "Semua" }],
  ["cakes", { en: "Cakes & Baking", id: "Kue & Baking" }],
  ["bread", { en: "Bread", id: "Roti" }],
  ["cookies", { en: "Cookies & Treats", id: "Cookies & Camilan" }],
  ["pasta", { en: "Pasta & Noodles", id: "Pasta & Mi" }],
  ["mains", { en: "Mains & Dishes", id: "Hidangan Utama" }],
  ["salads", { en: "Salads & Sides", id: "Salad & Pendamping" }]
];

const UI = {
  en: {
    title: "Catherine’s Recipe Book",
    subtitle: "Final recipes only",
    search: "Search recipes or ingredients…",
    recipes: n => `${n} recipe${n === 1 ? "" : "s"}`,
    empty: "No recipes found.",
    ingredients: "Ingredients",
    method: "Method",
    visual: "Key visual",
    notes: "Notes",
    close: "Close"
  },
  id: {
    title: "Buku Resep Catherine",
    subtitle: "Hanya resep final",
    search: "Cari resep atau bahan…",
    recipes: n => `${n} resep`,
    empty: "Resep tidak ditemukan.",
    ingredients: "Bahan",
    method: "Cara membuat",
    visual: "Panduan visual",
    notes: "Catatan",
    close: "Tutup"
  }
};

let lang = localStorage.getItem("recipeLang") || "en";
let category = "all";
let query = "";
let openId = null;
let tab = "ingredients";

const $ = s => document.querySelector(s);
const grid = $("#grid");
const filters = $("#filters");

function categoryLabel(key) {
  const found = CATEGORIES.find(c => c[0] === key);
  return found ? found[1][lang] : key;
}

function filtered() {
  const q = query.trim().toLowerCase();
  return window.RECIPES.filter(r => {
    if (category !== "all" && r.category !== category) return false;
    if (!q) return true;
    const hay = [
      r.title[lang],
      ...(r.tags?.[lang] || []),
      ...(r.ingredients?.[lang] || [])
    ].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

function renderFilters() {
  filters.innerHTML = "";
  CATEGORIES.forEach(([key, label]) => {
    const b = document.createElement("button");
    b.className = "filter" + (category === key ? " active" : "");
    b.textContent = label[lang];
    b.onclick = () => { category = key; openId = null; render(); };
    filters.appendChild(b);
  });
}

function card(r) {
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <div class="eyebrow">${categoryLabel(r.category)}</div>
    <h2>${r.title[lang]}</h2>
    <div class="tags">${(r.tags?.[lang] || []).slice(0,3).map(t => `<span class="tag">${t}</span>`).join("")}</div>
  `;
  el.onclick = () => { openId = r.id; tab = "ingredients"; render(); setTimeout(() => document.querySelector(".detail")?.scrollIntoView({behavior:"smooth",block:"start"}), 0); };
  return el;
}

function detail(r) {
  const el = document.createElement("article");
  el.className = "detail";
  const tabs = [
    ["ingredients", UI[lang].ingredients],
    ["method", UI[lang].method],
    ...(r.visual ? [["visual", UI[lang].visual]] : []),
    ["notes", UI[lang].notes]
  ];
  el.innerHTML = `
    <div class="detail-head">
      <div><div class="eyebrow">${categoryLabel(r.category)}</div><h2>${r.title[lang]}</h2></div>
      <button class="close" aria-label="${UI[lang].close}">×</button>
    </div>
    <div class="tabs">${tabs.map(([k,l]) => `<button class="tab ${tab===k?"active":""}" data-tab="${k}">${l}</button>`).join("")}</div>
    <div class="panel"></div>
  `;
  el.querySelector(".close").onclick = () => { openId = null; render(); };
  el.querySelectorAll(".tab").forEach(b => b.onclick = () => { tab = b.dataset.tab; render(); });
  const p = el.querySelector(".panel");
  if (tab === "ingredients") p.innerHTML = `<ul>${r.ingredients[lang].map(x => `<li>${x}</li>`).join("")}</ul>`;
  if (tab === "method") p.innerHTML = `<ol>${r.method[lang].map(x => `<li>${x}</li>`).join("")}</ol>`;
  if (tab === "notes") p.innerHTML = `<div class="note">${r.notes?.[lang] || "—"}</div>`;
  if (tab === "visual") p.innerHTML = `<div class="visual"><div class="emoji">${r.visual.emoji || "👀"}</div><p>${r.visual.caption[lang]}</p></div>`;
  return el;
}

function render() {
  document.documentElement.lang = lang;
  $("#appTitle").textContent = UI[lang].title;
  $("#subtitle").textContent = UI[lang].subtitle;
  $("#search").placeholder = UI[lang].search;
  $("#langBtn").textContent = lang === "en" ? "English ▾" : "Bahasa Indonesia ▾";
  renderFilters();
  const list = filtered();
  $("#count").textContent = UI[lang].recipes(list.length);
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = `<div class="empty">${UI[lang].empty}</div>`;
    return;
  }
  list.forEach(r => {
    grid.appendChild(card(r));
    if (r.id === openId) grid.appendChild(detail(r));
  });
}

$("#search").addEventListener("input", e => { query = e.target.value; openId = null; render(); });
$("#langBtn").addEventListener("click", () => {
  lang = lang === "en" ? "id" : "en";
  localStorage.setItem("recipeLang", lang);
  render();
});

render();
