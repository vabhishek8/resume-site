// Post-build step (runs after `vite build` and the SSR build of
// src/entry-server.jsx). Three jobs, each of which fails the build loudly
// rather than shipping a silently degraded site:
//   1. Inject the server-rendered app into dist/index.html so the content is
//      in the initial HTML for crawlers that do not run JavaScript.
//   2. Render content/writing/*.md to static pages under dist/writing/.
//   3. Regenerate sitemap.xml (repo root, which the deploy workflow copies
//      into dist) from the page list, so a new article cannot be forgotten.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import { marked } from "marked";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SSR_DIR = join(ROOT, "dist-ssr");
const WRITING_SRC = join(ROOT, "content", "writing");
const SITE = "https://abhishekvadlamudi.com";
const AUTHOR = "Abhishek Vadlamudi";
const PERSON_ID = `${SITE}/#person`;
const ROOT_MARKER = '<div id="root"></div>';

const fail = (msg) => { console.error(`prerender: ${msg}`); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// JSON inside <script type="application/ld+json">: never allow "</script>" to close the block.
const ldJson = (obj) => JSON.stringify(obj, null, 2).replace(/</g, "\\u003c");
const isoDate = (v) => {
  const d = new Date(`${v}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v)) || Number.isNaN(d.getTime())) return null;
  return String(v);
};

// ── 1. Main page ────────────────────────────────────────────────────────────
const indexPath = join(DIST, "index.html");
if (!existsSync(indexPath)) fail("dist/index.html missing; run vite build first");
let indexHtml = readFileSync(indexPath, "utf8");
if (!indexHtml.includes(ROOT_MARKER)) fail(`marker ${ROOT_MARKER} not found in dist/index.html`);

const { render } = await import(pathToFileURL(join(SSR_DIR, "entry-server.js")).href);
const appHtml = render();
// Sanity gates: an empty or partial render must not reach production.
if (appHtml.length < 20000) fail(`server render suspiciously small (${appHtml.length} chars)`);
for (const must of ["Vadlamudi", 'id="about"', 'id="experience"', 'id="projects"', 'id="contact"']) {
  if (!appHtml.includes(must)) fail(`server render is missing ${must}`);
}
indexHtml = indexHtml.replace(ROOT_MARKER, `<div id="root">${appHtml}</div>`);
writeFileSync(indexPath, indexHtml);
console.log(`prerender: injected ${appHtml.length} chars into dist/index.html`);

// ── 2. Writing ──────────────────────────────────────────────────────────────
function parseFrontMatter(raw, file) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) fail(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) fail(`${file}: cannot parse front matter line "${line}"`);
    let v = kv[2].trim();
    if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
    else if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    meta[kv[1]] = v;
  }
  for (const k of ["title", "description", "date"]) if (!meta[k]) fail(`${file}: front matter needs "${k}"`);
  if (!isoDate(meta.date)) fail(`${file}: date must be YYYY-MM-DD`);
  if (meta.updated && !isoDate(meta.updated)) fail(`${file}: updated must be YYYY-MM-DD`);
  if (meta.description.length > 170) console.warn(`prerender: ${file} description is ${meta.description.length} chars; Google truncates near 155-160`);
  return { meta, body: m[2] };
}

const fmtDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const OG_IMAGE = `${SITE}/img/og-image.jpg`;

function shell({ title, socialTitle = title, description, canonical, ogType, jsonLd, body, current }) {
  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${AUTHOR}">
<meta name="theme-color" content="#07080b">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(socialTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${AUTHOR}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(socialTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="alternate" type="application/rss+xml" title="${AUTHOR}: Writing" href="${SITE}/writing/feed.xml">
<link rel="preload" href="/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/writing/writing.css">
<script type="application/ld+json">
${ldJson(jsonLd)}
</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="w-header">
  <a class="w-brand" href="/" aria-label="${AUTHOR}, home"><span class="w-mark" aria-hidden="true">AV</span><span>Abhishek<span class="dot">.</span>Vadlamudi</span></a>
  <nav class="w-nav" aria-label="Primary"><a href="/#projects">Projects</a><a href="/writing/"${current === "index" ? ' aria-current="page"' : ""}>Writing</a><a href="/#contact">Contact</a></nav>
</header>
<main id="main" class="w-main">
${body}
</main>
<footer class="w-footer">
  <span>&copy; ${new Date().getUTCFullYear()} ${AUTHOR}. Sydney, AU.</span>
  <span><a href="https://github.com/vabhishek8">GitHub</a> &middot; <a href="https://linkedin.com/in/abhishekvadlamudi">LinkedIn</a> &middot; <a href="/writing/feed.xml">RSS</a></span>
</footer>
</body>
</html>
`;
}

const articles = [];
if (existsSync(WRITING_SRC)) {
  for (const file of readdirSync(WRITING_SRC).filter((f) => f.endsWith(".md")).sort()) {
    const slug = file.replace(/\.md$/, "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(`${file}: slug must be lowercase kebab-case`);
    const { meta, body } = parseFrontMatter(readFileSync(join(WRITING_SRC, file), "utf8"), file);
    if (meta.draft === "true") { console.log(`prerender: skipping draft ${file}`); continue; }
    articles.push({ slug, meta, html: marked.parse(body, { gfm: true }) });
  }
}
articles.sort((a, b) => b.meta.date.localeCompare(a.meta.date));

const outWriting = join(DIST, "writing");
mkdirSync(outWriting, { recursive: true });
const personRef = { "@type": "Person", "@id": PERSON_ID, name: AUTHOR, url: `${SITE}/` };

for (const a of articles) {
  const url = `${SITE}/writing/${a.slug}/`;
  const modified = a.meta.updated || a.meta.date;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: a.meta.title,
        description: a.meta.description,
        datePublished: a.meta.date,
        dateModified: modified,
        author: personRef,
        publisher: personRef,
        mainEntityOfPage: url,
        image: OG_IMAGE,
        inLanguage: "en-AU",
        ...(a.meta.keyword ? { keywords: [a.meta.keyword, ...(a.meta.tags || [])].join(", ") } : {}),
        ...(a.meta.repo ? { isBasedOn: a.meta.repo } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Writing", item: `${SITE}/writing/` },
          { "@type": "ListItem", position: 3, name: a.meta.title, item: url },
        ],
      },
    ],
  };
  const body = `<article>
  <p class="w-eyebrow"><a href="/writing/">Writing</a> / ${esc((a.meta.tags || [])[0] || "Engineering")}</p>
  <h1 class="w-title">${esc(a.meta.title)}</h1>
  <p class="w-dek">${esc(a.meta.description)}</p>
  <p class="w-meta">By ${AUTHOR} &middot; <time datetime="${a.meta.date}">${fmtDate(a.meta.date)}</time>${a.meta.repo ? ` &middot; <a href="${esc(a.meta.repo)}">Source repo</a>` : ""}</p>
  <div class="w-prose">
${a.html}
  </div>
  <aside class="w-author"><strong>${AUTHOR}</strong> is a Senior Business Intelligence Engineer at Unisys in Sydney, working on SQL Server, SSIS, Databricks and Azure data platforms for financial-services clients. <a href="/">More about his work</a>.</aside>
</article>`;
  const dir = join(outWriting, a.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), shell({ title: a.meta.seo_title || `${a.meta.title} | ${AUTHOR}`, socialTitle: a.meta.title, description: a.meta.description, canonical: url, ogType: "article", jsonLd, body }));
}

const listBody = `<p class="w-eyebrow">Writing</p>
<h1 class="w-title">Notes from <em>the</em> pipeline<span class="accent">.</span></h1>
<p class="w-dek">Engineering write-ups from my public data pipelines and day-to-day work on SQL Server, SSIS, Databricks and Azure. Every claim is backed by code you can read.</p>
${articles.length ? `<ul class="w-list">
${articles.map((a) => `  <li><a class="w-item" href="/writing/${a.slug}/"><time datetime="${a.meta.date}">${fmtDate(a.meta.date)}</time><h2>${esc(a.meta.title)}</h2><p>${esc(a.meta.description)}</p></a></li>`).join("\n")}
</ul>` : "<p>First article coming soon.</p>"}`;
writeFileSync(join(outWriting, "index.html"), shell({
  title: `Writing | ${AUTHOR}`,
  description: "Data engineering write-ups by Abhishek Vadlamudi: SQL, data quality, medallion pipelines and Azure, sourced from real code.",
  canonical: `${SITE}/writing/`,
  ogType: "website",
  current: "index",
  jsonLd: { "@context": "https://schema.org", "@type": "Blog", "@id": `${SITE}/writing/#blog`, name: `${AUTHOR}: Writing`, url: `${SITE}/writing/`, author: personRef,
    blogPost: articles.map((a) => ({ "@type": "TechArticle", headline: a.meta.title, url: `${SITE}/writing/${a.slug}/`, datePublished: a.meta.date })) },
  body: listBody,
}));

// RSS: lets dev.to / Hashnode import posts with the canonical already set.
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${AUTHOR}: Writing</title>
<link>${SITE}/writing/</link>
<description>Data engineering write-ups by ${AUTHOR}</description>
<language>en-au</language>
<atom:link href="${SITE}/writing/feed.xml" rel="self" type="application/rss+xml"/>
${articles.map((a) => `<item><title>${esc(a.meta.title)}</title><link>${SITE}/writing/${a.slug}/</link><guid isPermaLink="true">${SITE}/writing/${a.slug}/</guid><pubDate>${new Date(`${a.meta.date}T00:00:00Z`).toUTCString()}</pubDate><description>${esc(a.meta.description)}</description></item>`).join("\n")}
</channel>
</rss>
`;
writeFileSync(join(outWriting, "feed.xml"), rss);
console.log(`prerender: wrote ${articles.length} article(s) + /writing/ index + feed.xml`);

// ── 3. Sitemap ──────────────────────────────────────────────────────────────
let homeLastmod;
try { homeLastmod = execSync("git log -1 --format=%cs", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { /* no git */ }
if (!isoDate(homeLastmod)) homeLastmod = new Date().toISOString().slice(0, 10);
const newest = articles.reduce((m, a) => ((a.meta.updated || a.meta.date) > m ? (a.meta.updated || a.meta.date) : m), "0000-00-00");
const urls = [
  { loc: `${SITE}/`, lastmod: homeLastmod },
  ...(articles.length ? [{ loc: `${SITE}/writing/`, lastmod: newest }] : []),
  ...articles.map((a) => ({ loc: `${SITE}/writing/${a.slug}/`, lastmod: a.meta.updated || a.meta.date })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
// Root copy is what .github/workflows/azure-static-web-apps.yml copies into dist.
writeFileSync(join(ROOT, "sitemap.xml"), sitemap);
writeFileSync(join(DIST, "sitemap.xml"), sitemap);
rmSync(SSR_DIR, { recursive: true, force: true });
console.log(`prerender: sitemap.xml with ${urls.length} URL(s)`);
