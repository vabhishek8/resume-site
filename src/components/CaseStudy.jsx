import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECTS } from "../content.js";
import { FlowDiagram, CodeExcerpts, TestOutput, RunHistory, RunBadge } from "./Pipelines.jsx";
import { lockScroll, unlockScroll } from "../lib/scrollLock.js";

/* Case-study overlay: deep-linkable (#case-<id>), Esc / back to close,
   focus trapped while open, page scroll locked, focus restored on close. */
export function useCaseStudy() {
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(/^#case-([\w-]+)$/);
      setOpenId(m && PROJECTS.some((p) => p.id === m[1]) ? m[1] : null);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const open = useCallback((id) => {
    if (window.location.hash !== `#case-${id}`) window.history.pushState(null, "", `#case-${id}`);
    setOpenId(id);
  }, []);
  const close = useCallback(() => {
    if (window.location.hash.startsWith("#case-")) window.history.pushState(null, "", window.location.pathname + window.location.search);
    setOpenId(null);
  }, []);
  return { openId, open, close };
}

export function CaseStudy({ id, onClose }) {
  const p = PROJECTS.find((x) => x.id === id);
  const dlg = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    if (!p) return undefined;
    lastFocus.current = document.activeElement;
    const root = document.documentElement;
    root.classList.add("case-open");
    lockScroll();
    const t = setTimeout(() => dlg.current && dlg.current.querySelector(".cs-close").focus(), 30);
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab" || !dlg.current) return;
      const f = dlg.current.querySelectorAll("a[href], button:not([disabled])");
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      root.classList.remove("case-open");
      unlockScroll();
      document.removeEventListener("keydown", onKey);
      if (lastFocus.current && lastFocus.current.focus) lastFocus.current.focus();
    };
  }, [p, onClose]);

  if (!p) return null;
  const idx = PROJECTS.findIndex((x) => x.id === id);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <div className={"cs-backdrop case-" + p.id} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cs" role="dialog" aria-modal="true" aria-labelledby="cs-title" ref={dlg}>
        <header className="cs-top">
          <RunBadge p={p} />
          <button className="cs-close" type="button" onClick={onClose} aria-label="Close case study">
            <span aria-hidden="true">Close</span><i aria-hidden="true"></i>
          </button>
        </header>

        <div className="cs-scroll">
          <p className="cs-domain">{p.domain}</p>
          <h2 id="cs-title" className="cs-title">{p.title}</h2>
          <p className="cs-sub serif">{p.subtitle}</p>

          <div className="cs-hero">
            <div className="cs-metric">
              <p className="cm-value">{p.metric.value}<span>{p.metric.unit}</span></p>
              <p className="cm-label">{p.metric.label}</p>
            </div>
            <p className="cs-catch"><span>What went wrong</span>{p.catchLine}</p>
          </div>

          <section className="cs-block" aria-labelledby="cs-over">
            <h3 id="cs-over">Overview</h3>
            <p className="cs-body">{p.body}</p>
          </section>

          <section className="cs-block" aria-labelledby="cs-arch">
            <h3 id="cs-arch">How it's wired</h3>
            <FlowDiagram p={p} />
            <p className="cs-iac"><span>The Azure version</span>{p.iac}</p>
          </section>

          <section className="cs-block" aria-labelledby="cs-bug">
            <h3 id="cs-bug">What broke, and the fix</h3>
            <p className="cs-body">{p.bug}</p>
            <CodeExcerpts p={p} />
          </section>

          <section className="cs-block" aria-labelledby="cs-tests">
            <h3 id="cs-tests">Tests</h3>
            <TestOutput p={p} />
          </section>

          <section className="cs-block" aria-labelledby="cs-runs">
            <h3 id="cs-runs">Recent runs</h3>
            <RunHistory p={p} />
          </section>

          <section className="cs-block" aria-labelledby="cs-stack">
            <h3 id="cs-stack">Stack</h3>
            <ul className="chips">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>

          <div className="cs-actions">
            <a className="btn btn-primary" href={p.repo} target="_blank" rel="noopener noreferrer">
              <span>View on GitHub</span><span className="btn-arrow" aria-hidden="true">↗</span>
            </a>
            <a className="btn btn-ghost" href={p.live} target="_blank" rel="noopener noreferrer"><span>Live dashboard</span></a>
            <a className="cs-next" href={`#case-${next.id}`}>
              <span>Next case study</span>{next.title}<i aria-hidden="true">&rarr;</i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
