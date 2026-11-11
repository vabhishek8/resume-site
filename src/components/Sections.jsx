import { useRef, useState } from "react";
import { Heading } from "./Chrome.jsx";
import {
  ABOUT, MEDALLION, SKILLS, EXPERIENCE, PROJECTS, DELIVERY, EDUCATION, CERTS, CERT_NOTE, CONTACT, SITE
} from "../content.js";

/* ── 01 About ─────────────────────────────────────────────────────────────── */
export function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-h">
      <Heading
        id="about-h"
        index="01"
        label="About"
        lines={[["bold", "Engineering"], ["serif", "the platform,"], ["bold", "not just the report"]]}
      />
      <div className="about-grid">
        <div className="about-copy">
          {ABOUT.paragraphs.map((p, i) => (
            <p key={i} data-reveal className={i === 0 ? "lead" : ""}>{p}</p>
          ))}
        </div>
        <dl className="stats">
          {ABOUT.stats.map((s) => (
            <div className="stat" key={s.label} data-reveal>
              <dt className="stat-num">
                <span data-count-to={s.to} data-prefix={s.prefix || ""} data-suffix={s.suffix || ""}>
                  {(s.prefix || "") + s.to + (s.suffix || "")}
                </span>
              </dt>
              <dd className="stat-label">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ── Architecture: pinned medallion walkthrough ───────────────────────────── */
const NODE_X = [80, 330, 580, 830, 1080];
export function Medallion() {
  return (
    <section className="section medallion" aria-labelledby="arch-h" data-medallion>
      <div className="med-pin">
        <Heading
          id="arch-h"
          index="↳"
          label="Architecture, in one line"
          lines={[["bold", "Raw in."], ["serif", "Decisions out"]]}
        />
        <div className="med-stage">
          <svg className="med-svg" viewBox="0 0 1160 220" role="img" aria-label="Pipeline: Sources, Bronze, Silver, Gold, Serve">
            <defs>
              <linearGradient id="medGrad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#8b93a3" />
                <stop offset="28%" stopColor="#c9895b" />
                <stop offset="52%" stopColor="#c9d3dd" />
                <stop offset="76%" stopColor="#f2b544" />
                <stop offset="100%" stopColor="#3cc8ff" />
              </linearGradient>
            </defs>
            <path className="med-track" d="M80 110 H1080" />
            <path className="med-path" d="M80 110 H1080" stroke="url(#medGrad)" data-med-path />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} r="3.2" className="med-packet">
                <animateMotion dur="4.2s" begin={`${i * 0.7}s`} repeatCount="indefinite" path="M80 110 H1080" />
              </circle>
            ))}
            {MEDALLION.map((m, i) => (
              <g key={m.key} className={"med-node node-" + m.key} data-med-node={i} transform={`translate(${NODE_X[i]} 110)`}>
                <circle r="34" className="med-ring" />
                <circle r="9" className="med-core" />
                <text y="-52" textAnchor="middle" className="med-label">{m.label.toUpperCase()}</text>
                <text y="64" textAnchor="middle" className="med-idx">{`0${i + 1}`}</text>
              </g>
            ))}
          </svg>

          <ol className="med-steps">
            {MEDALLION.map((m, i) => (
              <li key={m.key} className={"med-step step-" + m.key} data-med-step={i}>
                <p className="med-step-k"><span>0{i + 1}</span> {m.label}</p>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
                <ul className="chips">
                  {m.tools.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ── 02 Skills: capability groups with evidence, not self-ratings ─────────── */
const EVIDENCE = { prod: "In production", built: "Public repo" };
export function Skills() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-h">
      <Heading id="skills-h" index="02" label="Skills" lines={[["bold", "Capabilities,"], ["serif", "not buzzwords"]]} />
      <div className="sec-lede skills-lede" data-reveal>
        <p>Grouped by what a data platform needs, not by tool count. No self-rated bars: each tool is tagged with where you can check it.</p>
        <p className="legend">
          <span className="ev ev-prod"><i aria-hidden="true"></i>In production at Unisys</span>
          <span className="ev ev-built"><i aria-hidden="true"></i>Built &amp; tested in a public repo</span>
        </p>
      </div>
      <div className="skill-grid">
        {SKILLS.map((g, gi) => (
          <div className="skill-group" key={g.title} data-reveal>
            <h3><span className="sg-idx">0{gi + 1}</span>{g.title}</h3>
            <ul>
              {g.items.map(([name, ev]) => (
                <li key={name} className="skill-row" data-cursor-hover>
                  <span className="skill-name">{name}</span>
                  <span className={"ev ev-" + ev} title={EVIDENCE[ev]}>
                    <i aria-hidden="true"></i><span className="ev-txt">{EVIDENCE[ev]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 03 Experience ────────────────────────────────────────────────────────── */
export function Experience() {
  return (
    <section id="experience" className="section experience" aria-labelledby="exp-h">
      <Heading id="exp-h" index="03" label="Experience" lines={[["bold", "Track"], ["serif", "record"]]} />
      <div className="timeline" data-timeline>
        <span className="tl-rail" aria-hidden="true"><span className="tl-fill" data-tl-fill></span></span>
        <ol className="tl-ol">
        {EXPERIENCE.map((e) => (
          <li className="tl-item" key={e.role} data-reveal>
            <span className="tl-node" aria-hidden="true"></span>
            <div className="tl-head">
              <p className="tl-date">{e.dates}</p>
              <h3>{e.role}</h3>
              <p className="tl-org">{e.org} <span>· {e.place}</span></p>
            </div>
            <ul className="tl-list">
              {e.bullets.map((b, i) => <li key={i} data-reveal>{b}</li>)}
            </ul>
          </li>
        ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 04 Projects: pinned stacking case studies ────────────────────────────── */
export function Projects() {
  return (
    <section id="projects" className="section projects" aria-labelledby="proj-h">
      <Heading id="proj-h" index="04" label="Projects" lines={[["bold", "Selected"], ["serif", "engineering work"]]} />
      <p className="sec-lede" data-reveal>Framed by architecture and outcome, not by dashboard count.</p>

      <div className="stack" data-stack>
        {PROJECTS.map((p, i) => (
          <article className={"case case-" + p.id} key={p.id} data-case style={{ "--i": i }}>
            <div className="case-inner">
              <div className="case-main">
                <div className="case-top">
                  <span className="case-idx">0{i + 1}<span>/0{PROJECTS.length}</span></span>
                  <span className="badge"><span className="live-dot" aria-hidden="true"></span>{p.badge}</span>
                </div>
                <p className="case-domain">{p.domain}</p>
                <h3 className="case-title">{p.title}</h3>
                <p className="case-sub serif">{p.subtitle}</p>
                <p className="case-body">{p.body}</p>
              </div>
              <aside className="case-side">
                <div className="case-metric">
                  <p className="cm-value">{p.metric.value}<span>{p.metric.unit}</span></p>
                  <p className="cm-label">{p.metric.label}</p>
                </div>
                <p className="case-catch"><span>The catch</span>{p.catchLine}</p>
                <ul className="chips">
                  {p.stack.map((s) => <li key={s}>{s}</li>)}
                </ul>
                <div className="case-actions">
                  <a className="btn btn-primary" href={p.repo} target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="Code">
                    <span>View on GitHub</span><span className="btn-arrow" aria-hidden="true">↗</span>
                  </a>
                  <a className="btn btn-ghost" href={p.live} target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="Live">
                    <span>Live dashboard</span>
                  </a>
                </div>
              </aside>
            </div>
          </article>
        ))}
      </div>

      <div className="delivery">
        <p className="eyebrow" data-reveal><span className="eyebrow-dash" aria-hidden="true"></span>In production at Unisys</p>
        <div className="delivery-grid">
          {DELIVERY.map((d, i) => (
            <article className="dcard" key={d.title} data-reveal data-tilt>
              <span className="dcard-idx">0{i + 1}</span>
              <ul className="tags">{d.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
              <p className="impact"><strong>Impact</strong>{d.impact}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 05 Education ─────────────────────────────────────────────────────────── */
export function Education() {
  return (
    <section id="education" className="section education" aria-labelledby="edu-h">
      <Heading id="edu-h" index="05" label="Education & Certifications" lines={[["bold", "The"], ["serif", "foundations"]]} />
      <div className="edu-grid">
        <ol className="edu-list">
          {EDUCATION.map((e) => (
            <li key={e.degree} className="edu-item" data-reveal>
              <p className="edu-date">{e.dates}</p>
              <h3>{e.degree}</h3>
              <p className="edu-school">{e.school}</p>
              <ul>{e.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </li>
          ))}
        </ol>
        <div className="certs" data-reveal>
          <h3 className="certs-h">Certifications</h3>
          {CERTS.map((c) => (
            <div className="cert" key={c.name}>
              <span className="cert-name">{c.name}</span>
              <span className="cert-meta">{c.issuer} · {c.year}</span>
            </div>
          ))}
          <p className="cert-note"><span className="live-dot" aria-hidden="true"></span>{CERT_NOTE}</p>
        </div>
      </div>
    </section>
  );
}

/* ── 06 Contact (form logic preserved: POST /api/contact) ────────────────── */
export function Contact() {
  const formRef = useRef();
  const [status, setStatus] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = formRef.current;
    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    const message = form.elements["message"].value.trim();
    const company = form.elements["company"].value;

    if (!name || !email || !message) {
      setStatus({ text: "Please fill in your name, email, and message.", type: "is-error" });
      return;
    }
    setSubmitting(true);
    setStatus({ text: "Sending...", type: "" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company })
      });
      let data = null;
      try { data = await res.json(); } catch { data = null; }
      if (res.ok) {
        setStatus({ text: "Message sent. I'll get back to you soon.", type: "is-success" });
        form.reset();
      } else {
        setStatus({ text: (data && data.error) || "Something went wrong. Try again later.", type: "is-error" });
      }
    } catch {
      setStatus({ text: "Network error. Try again later, or reach me on LinkedIn.", type: "is-error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-h">
      <Heading
        id="contact-h"
        index="06"
        label="Contact"
        lines={[["bold", "Let's talk"], ["serif", "data platforms"]]}
        className="contact-head"
      />
      <p className="sec-lede" data-reveal>{CONTACT.lede}</p>

      <div className="contact-grid">
        <form className="cform" ref={formRef} onSubmit={onSubmit} noValidate data-reveal>
          <div className="field">
            <input id="cf-name" name="name" type="text" autoComplete="name" required maxLength={200} placeholder=" " />
            <label htmlFor="cf-name">Name</label>
          </div>
          <div className="field">
            <input id="cf-email" name="email" type="email" autoComplete="email" required maxLength={200} placeholder=" " />
            <label htmlFor="cf-email">Email</label>
          </div>
          <div className="field">
            <textarea id="cf-message" name="message" rows={5} required maxLength={5000} placeholder=" "></textarea>
            <label htmlFor="cf-message">Message</label>
          </div>
          <div className="form-honeypot" aria-hidden="true">
            <label htmlFor="cf-company">Company</label>
            <input type="text" id="cf-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={submitting} data-magnetic data-cursor="Send">
            <span>{submitting ? "Sending…" : "Send message"}</span><span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>
          <p className={"form-status " + status.type} role="status" aria-live="polite">{status.text}</p>
        </form>

        <ul className="links" data-reveal>
          <li>
            <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" data-cursor="Open">
              <span className="lk">LinkedIn</span><span className="lv">{SITE.linkedinLabel}</span><span className="la" aria-hidden="true">↗</span>
            </a>
          </li>
          <li>
            <a href={SITE.github} target="_blank" rel="noopener noreferrer" data-cursor="Open">
              <span className="lk">GitHub</span><span className="lv">{SITE.githubLabel}</span><span className="la" aria-hidden="true">↗</span>
            </a>
          </li>
          <li className="static">
            <span className="lk">Location</span><span className="lv">{SITE.locationLong}</span>
          </li>
        </ul>
      </div>
      <div className="contact-glow" aria-hidden="true"></div>
    </section>
  );
}
