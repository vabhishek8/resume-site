import { useRef } from "react";
import { PROJECTS } from "../content.js";
import { ARTIFACTS, ARTIFACTS_RUN } from "../artifacts.js";
import { useRuns, useNearViewport, ago, took, verdict, shortDate, actionsUrl } from "../lib/pipelineRuns.js";

const SHORT = { weather: "AU weather", aml: "AML monitoring", basel: "Basel III liquidity" };

/* ── Live status of the three scheduled pipelines (About column) ─────────── */
function StatusRow({ p, active }) {
  const st = useRuns(p.workflow, active);
  const last = st.runs && st.runs[0];
  const v = verdict(last);
  return (
    <li className={"ps-row ps-" + (st.error ? "unknown" : st.loading ? "loading" : v.key)}>
      <span className="ps-dot" aria-hidden="true"></span>
      <span className="ps-name">{SHORT[p.id]}</span>
      {st.loading ? (
        <span className="ps-meta">Checking GitHub…</span>
      ) : st.error ? (
        <span className="ps-meta"><a href={actionsUrl(p.workflow)} target="_blank" rel="noopener noreferrer">See runs on GitHub ↗</a></span>
      ) : last ? (
        <span className="ps-meta">
          <a href={last.url} target="_blank" rel="noopener noreferrer">{v.label}</a> {ago(last.started)}
          {took(last) ? <span className="ps-took">, took {took(last)}</span> : null}
          {st.stale ? <span className="ps-took"> (cached)</span> : null}
        </span>
      ) : (
        <span className="ps-meta">No runs yet</span>
      )}
    </li>
  );
}

export function PipelineStatus() {
  const ref = useRef(null);
  const near = useNearViewport(ref);
  return (
    <aside className="pstatus" ref={ref} aria-labelledby="ps-h" data-reveal>
      <h3 id="ps-h" className="ps-h">My public pipelines, right now</h3>
      <p className="ps-sub">Each one runs once a day on GitHub Actions. This is their latest run.</p>
      <ul className="ps-list" aria-live="polite">
        {PROJECTS.map((p) => <StatusRow key={p.id} p={p} active={near} />)}
      </ul>
      <p className="ps-foot">Fetched by your browser from the GitHub API and cached for ten minutes. If a row says “See runs on GitHub”, the anonymous rate limit ran out.</p>
    </aside>
  );
}

/* ── Card badge: last run, live ──────────────────────────────────────────── */
export function RunBadge({ p }) {
  const ref = useRef(null);
  const near = useNearViewport(ref);
  const st = useRuns(p.workflow, near);
  const last = st.runs && st.runs[0];
  const v = verdict(last);
  const text = !near || st.loading || st.error || !last ? "Runs daily on GitHub Actions" : `Last run ${v.label.toLowerCase()} ${ago(last.started)}`;
  return (
    <span ref={ref} className={"badge badge-" + (!near || st.loading || st.error || !last ? "idle" : v.key)}>
      <span className="live-dot" aria-hidden="true"></span>{text}
    </span>
  );
}

/* ── Case study: recent run history ─────────────────────────────────────── */
export function RunHistory({ p }) {
  const st = useRuns(p.workflow, true);
  if (st.loading) return <p className="rh-note">Checking GitHub…</p>;
  if (st.error || !st.runs || !st.runs.length) {
    return (
      <p className="rh-note">
        GitHub didn't answer just now, probably the hourly limit for anonymous requests.{" "}
        <a href={actionsUrl(p.workflow)} target="_blank" rel="noopener noreferrer">The full run history is on GitHub ↗</a>
      </p>
    );
  }
  return (
    <div className="rh">
      <ol className="rh-strip" aria-label={`Last ${st.runs.length} runs, newest first`}>
        {st.runs.map((r) => {
          const v = verdict(r);
          return (
            <li key={r.id} className={"rh-cell rh-" + v.key}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" title={`${v.label}, ${shortDate(r.started)}, ${r.event}, took ${took(r)}`}>
                <span className="sr-only">{v.label} on {shortDate(r.started)}</span>
              </a>
            </li>
          );
        })}
      </ol>
      <table className="rh-table">
        <thead><tr><th scope="col">Run</th><th scope="col">Trigger</th><th scope="col">Result</th><th scope="col">Took</th></tr></thead>
        <tbody>
          {st.runs.slice(0, 5).map((r) => (
            <tr key={r.id}>
              <td><a href={r.url} target="_blank" rel="noopener noreferrer">{shortDate(r.started)}</a></td>
              <td>{r.event === "schedule" ? "Daily schedule" : r.event === "push" ? `Push ${r.sha}` : r.event.replace(/_/g, " ")}</td>
              <td className={"rh-v rh-" + verdict(r).key}>{verdict(r).label}</td>
              <td>{took(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="rh-note">
        Live from the GitHub API{st.stale ? " (cached copy, GitHub didn't answer)" : ""}.{" "}
        <a href={actionsUrl(p.workflow)} target="_blank" rel="noopener noreferrer">All runs ↗</a>
      </p>
    </div>
  );
}

/* ── Case study: architecture, redrawn from the README's Mermaid source ─── */
function Node({ t }) {
  return <span className="fd-node"><b>{t[0]}</b>{t[1] ? <small>{t[1]}</small> : null}</span>;
}
export function FlowDiagram({ p }) {
  const f = p.flow;
  const a = ARTIFACTS[p.id];
  return (
    <figure className="fd">
      <ol className="fd-flow">
        <li className="fd-stage"><span className="fd-k">Source</span><Node t={f.source} /></li>
        <li className="fd-stage st-bronze"><span className="fd-k">Bronze</span><Node t={f.bronze} /></li>
        <li className="fd-stage st-gate">
          <span className="fd-k">Quality gate</span>
          <span className="fd-node fd-gate"><b>{f.gate}</b></span>
          <span className="fd-fail">If a check fails, nothing is written. The process exits non-zero and the CI run goes red.</span>
        </li>
        <li className="fd-stage st-silver"><span className="fd-k">Silver</span><Node t={f.silver} /></li>
        <li className="fd-stage st-gold">
          <span className="fd-k">Gold</span>
          <span className="fd-group">{f.gold.map((g) => <Node t={g} key={g[0]} />)}</span>
          {f.goldOut ? <span className="fd-node fd-out"><b>{f.goldOut}</b></span> : null}
        </li>
        <li className="fd-stage st-serve"><span className="fd-k">Serve</span><Node t={f.serve} /></li>
      </ol>
      <figcaption>
        Redrawn from the Mermaid diagram in the repo's{" "}
        <a href={`https://github.com/vabhishek8/${a.repo}/blob/${a.sha}/README.md#architecture`} target="_blank" rel="noopener noreferrer">README</a>.
      </figcaption>
    </figure>
  );
}

/* ── Case study: the real code ──────────────────────────────────────────── */
const isComment = (l, lang) => {
  const t = l.trim();
  return lang === "sql" ? t.startsWith("--") : t.startsWith("#");
};
export function CodeExcerpts({ p }) {
  const a = ARTIFACTS[p.id];
  let inDoc = false;
  return a.excerpts.map((x) => (
    <figure className="code" key={x.file + x.a}>
      <figcaption>
        <span className="code-file">{x.file}</span>
        <span className="code-lines">lines {x.a} to {x.b}</span>
        <a href={x.url} target="_blank" rel="noopener noreferrer">View at {a.sha.slice(0, 7)} ↗</a>
      </figcaption>
      <pre tabIndex={0}><code>
        {x.code.split("\n").map((l, i) => {
          // Dim comments and Python docstrings, nothing fancier
          const t = l.trim();
          let dim = isComment(l, x.lang);
          if (x.lang === "python") {
            const q = (t.match(/"""/g) || []).length;
            if (inDoc || q) dim = true;
            if (q === 1) inDoc = !inDoc;
          }
          return <span key={i} className={"cl" + (dim ? " cl-dim" : "")}><i aria-hidden="true">{x.a + i}</i>{l || " "}{"\n"}</span>;
        })}
      </code></pre>
    </figure>
  ));
}

/* ── Case study: real test output ───────────────────────────────────────── */
export function TestOutput({ p }) {
  const a = ARTIFACTS[p.id];
  const t = a.tests;
  return (
    <figure className="term">
      <pre tabIndex={0}><code>
        <span className="t-cmd">$ python -m pytest -q</span>{"\n"}
        {t.summary.map((l, i) => <span key={"s" + i} className={/skipped|SKIPPED/.test(l) ? "t-skip" : /failed|FAILED/.test(l) ? "t-fail" : /passed/.test(l) ? "t-pass" : ""}>{l}{"\n"}</span>)}
        {"\n"}<span className="t-cmd">$ python -m pytest -v {t.named[0] ? t.named[0].split("::")[0] : ""}</span>{"\n"}
        {t.named.map((l, i) => {
          const name = l.replace(/^tests\/[\w.]+::/, "").replace(/ (PASSED|SKIPPED|FAILED)$/, "");
          const res = (l.match(/(PASSED|SKIPPED|FAILED)$/) || [""])[0];
          return <span key={"n" + i}>{name} <b className={"t-" + res.toLowerCase()}>{res}</b>{"\n"}</span>;
        })}
      </code></pre>
      <figcaption>
        Real output from running the suite locally on {ARTIFACTS_RUN.date} at commit{" "}
        <a href={`https://github.com/vabhishek8/${a.repo}/tree/${a.sha}`} target="_blank" rel="noopener noreferrer">{a.sha.slice(0, 7)}</a>.
        CI runs the same tests before every scheduled pipeline run.
      </figcaption>
    </figure>
  );
}
