# resume-site

The source for [abhishekvadlamudi.com](https://abhishekvadlamudi.com). It's a single-page React app, built with Vite and hosted on Azure Static Web Apps. There's one Azure Function behind the contact form.

I wanted the site to show the same habits I'd want in a data pipeline. It should be fast on a bad phone connection, fail visibly instead of silently, and make no claim you can't check. So the three project case studies link to the exact lines of code and the real test output, and the pipeline statuses on the page are fetched live from GitHub.

## How it's put together

```
index.html            static shell: meta, JSON-LD, preloads, the mobile hero image
src/
  content.js          every line of copy on the site, in one place
  artifacts.js        code excerpts + pytest output from the pipeline repos (generated, don't hand-edit)
  components/         React sections; Pipelines.jsx holds the live status widget and case-study artifacts
  lib/pipelineRuns.js GitHub Actions API client: lazy, cached, explicit fallbacks
  lib/                motion helpers (figure layer, scroll lock, medallion field, pipeline simulation)
  index.css           desktop styles
  mobile.css          everything below 900px, in one media query
public/
  staticwebapp.config.json   routes and security headers (see "CSP" below)
  fonts/, img/               self-hosted fonts, portrait cut-outs
api/src/functions/contact.js the contact form endpoint
```

A few decisions worth explaining:

- **Copy lives in `src/content.js`, not in components.** Every claim on the site has to be backed by production work, a public repo or something I can show in an interview. Keeping it in one file makes that easy to audit.
- **Desktop and mobile are designed separately.** Below 900px, `mobile.css` takes over completely. The phone hero is a layered "magazine cover": the page background, then the name, then a transparent cut-out of me, then the copy. The cut-out is a plain `<img>` in `index.html` rather than a React element, so the largest image on the page doesn't wait for the JS bundle.
- **Motion is GSAP plus CSS, and it respects `prefers-reduced-motion`.** The particle field and the fixed portrait layer only run on desktop.
- **`artifacts.js` is generated.** I clone the three pipeline repos, run `pytest -v`, and copy the line ranges byte for byte, pinned to a commit SHA so the links don't drift. If a test result changes, the file gets regenerated. Nobody edits it by hand.

## Running it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
```

The contact form needs the Azure Functions runtime and a Resend API key. See [docs/CONTACT_FORM_SETUP.md](docs/CONTACT_FORM_SETUP.md). Everything else works with plain `npm run dev`.

## Deploying

`.github/workflows/azure-static-web-apps.yml` runs on every push to `main` and on every pull request.

1. `npm install` and `npm run build`.
2. It copies `favicon.ico`, `robots.txt`, `sitemap.xml` and the legacy `img/` folder into `dist/`.
3. It uploads `dist/` to Azure Static Web Apps with `skip_app_build: true`, plus `api/` as the Functions app.

Pull requests get their own preview URL, and the preview is torn down when the PR closes. Production only changes when something merges to `main`.

Because the action uploads `dist/` as-is, anything the deployed site needs has to end up in `dist/`. That's why `staticwebapp.config.json` lives in `public/`, which Vite copies into `dist/` on build.

## CSP and security headers

The headers are set in `public/staticwebapp.config.json`:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:;
connect-src 'self' https://api.github.com; base-uri 'self'; frame-ancestors 'none'
```

- `script-src 'self'` means no inline scripts and no CDNs. The JSON-LD block is a data block, not a script, so CSP doesn't apply to it.
- `connect-src` allows `api.github.com`, because the pipeline status widget calls the GitHub Actions API from the browser. That's the only third-party request the site makes.
- `style-src 'unsafe-inline'` is there for the inline style attributes React and GSAP write. The Google Fonts hosts are left over from before the fonts were self-hosted and can be removed.

Until this branch, the config file sat at the repo root. The workflow only deploys `dist/`, so the file was never uploaded, and none of these headers (CSP, X-Frame-Options, Permissions-Policy) were actually being sent. Moving it into `public/` fixes that. If you change the CSP, test it against the built site with the headers applied before merging.

### The pipeline status widget

`src/lib/pipelineRuns.js` calls `GET /repos/vabhishek8/<repo>/actions/workflows/pipeline.yml/runs?per_page=10`, unauthenticated, from the visitor's browser.

- It uses the workflow endpoint, not `/actions/runs`. The repo-wide list also includes GitHub Pages deploys, which would make "last run" mean the wrong thing.
- Anonymous requests are limited to 60 an hour per IP. A visit costs three requests, and results are cached in `sessionStorage` for ten minutes, keeping only the handful of fields the page renders.
- Nothing is fetched until the widget scrolls near the viewport.
- If GitHub refuses (rate limit or network), the widget says so and links to the Actions page. A stale cached copy is shown and labelled rather than nothing.

## Performance budget

What I hold the build to, measured with Lighthouse mobile (simulated slow 4G) against the PR preview:

| Budget | Target |
|---|---|
| Lighthouse mobile performance | 94 or better |
| Largest Contentful Paint (mobile) | under 2.5 s on the preview URL |
| Cumulative Layout Shift | 0 |
| Mobile hero image | under 45 KB (AVIF, with WebP fallback) |
| JS (gzipped) | about 120 KB, and it shouldn't grow without a reason |
| Third-party requests at load | none (GitHub API calls are lazy) |

How the budget is kept:

- Fonts are self-hosted, subset and preloaded.
- On phones there's no preloader and no particle field.
- The mobile hero image is static HTML with a media-scoped preload.
- Desktop-only images are never requested on phones. A detached `<img>` starts downloading as soon as React sets `src`, so desktop poses are rendered with `data-src` on mobile.

The preview environment sends `x-robots-tag: none`, so the SEO score there reads low. Production doesn't send it.

## Legacy files

`css/`, `js/`, `img/memoji/` and the root-level `img/` favicons are from the previous version of the site. The build doesn't use `css/` or `js/`. They can go in a cleanup PR once nothing links to them.
