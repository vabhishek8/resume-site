// Live run history for the three public pipelines, straight from the GitHub
// REST API in the visitor's browser.
//
// - Endpoint: actions/workflows/pipeline.yml/runs, not actions/runs. The
//   repo-wide list also contains GitHub Pages deploys (event "dynamic"), which
//   would make "last run" mean "last Pages deploy".
// - Unauthenticated: 60 requests per hour per visitor IP. Three repos, cached
//   for 10 minutes in sessionStorage, so a normal visit costs 3 requests.
// - Only the fields we render are cached (a few hundred bytes per repo; the
//   raw response is ~170 KB, ~9 KB gzipped).
// - Lazy: nothing is fetched until a widget scrolls near the viewport, so it
//   never competes with first paint.
// - Failure is explicit: callers get { error } and show fallback text with a
//   link to the Actions page. A stale cache is shown (and labelled) rather
//   than nothing.
import { useEffect, useState } from "react";

const OWNER = "vabhishek8";
const WORKFLOW = "pipeline.yml";
const TTL_MS = 10 * 60 * 1000;
const KEY = (repo) => `av-runs:v1:${repo}`;
const inflight = new Map();

export const actionsUrl = (repo) => `https://github.com/${OWNER}/${repo}/actions/workflows/${WORKFLOW}`;

function readCache(repo) {
  try {
    const raw = sessionStorage.getItem(KEY(repo));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // storage disabled (private mode, embedded webview): just refetch
  }
}
function writeCache(repo, runs) {
  try { sessionStorage.setItem(KEY(repo), JSON.stringify({ t: Date.now(), runs })); } catch { /* quota or disabled */ }
}

const slim = (r) => ({
  id: r.id,
  event: r.event,
  status: r.status,
  conclusion: r.conclusion,
  started: r.run_started_at || r.created_at,
  updated: r.updated_at,
  url: r.html_url,
  sha: (r.head_sha || "").slice(0, 7)
});

async function load(repo) {
  const cached = readCache(repo);
  if (cached && Date.now() - cached.t < TTL_MS) return { runs: cached.runs, at: cached.t };
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/actions/workflows/${WORKFLOW}/runs?per_page=10`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) {
      const limited = res.status === 403 || res.status === 429;
      if (cached) return { runs: cached.runs, at: cached.t, stale: true };
      return { error: limited ? "rate-limited" : `HTTP ${res.status}` };
    }
    const json = await res.json();
    const runs = (json.workflow_runs || []).map(slim);
    writeCache(repo, runs);
    return { runs, at: Date.now() };
  } catch {
    if (cached) return { runs: cached.runs, at: cached.t, stale: true };
    return { error: "network" };
  }
}

export function getRuns(repo) {
  if (!inflight.has(repo)) inflight.set(repo, load(repo).finally(() => setTimeout(() => inflight.delete(repo), TTL_MS)));
  return inflight.get(repo);
}

// Fetches once `active` turns true (pair it with useNearViewport).
export function useRuns(repo, active) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    if (!active) return undefined;
    let alive = true;
    getRuns(repo).then((r) => { if (alive) setState({ loading: false, ...r }); });
    return () => { alive = false; };
  }, [repo, active]);
  return state;
}

export function useNearViewport(ref, margin = "300px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return undefined;
    if (!("IntersectionObserver" in window)) { setNear(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}

const rtf = typeof Intl !== "undefined" && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat("en-AU", { numeric: "auto" }) : null;
export function ago(iso) {
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  if (!isFinite(s)) return "";
  const abs = Math.abs(s);
  const [v, u] = abs < 3600 ? [s / 60, "minute"] : abs < 86400 ? [s / 3600, "hour"] : [s / 86400, "day"];
  return rtf ? rtf.format(Math.round(v), u) : new Date(iso).toLocaleString("en-AU");
}
export function took(run) {
  const s = Math.round((new Date(run.updated) - new Date(run.started)) / 1000);
  if (!isFinite(s) || s < 0) return "";
  return s < 90 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}
export function verdict(run) {
  if (!run) return { key: "unknown", label: "No runs yet" };
  if (run.status !== "completed") return { key: "running", label: "Running now" };
  if (run.conclusion === "success") return { key: "ok", label: "Passed" };
  if (run.conclusion === "failure") return { key: "fail", label: "Failed" };
  return { key: "unknown", label: run.conclusion ? run.conclusion.replace(/_/g, " ") : "Unknown" };
}
export const shortDate = (iso) => new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
