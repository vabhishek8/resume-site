import { useRef, useState } from "react";

export default function Contact() {
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
      const data = await res.json();
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
    <section id="contact" className="section section-contact" aria-labelledby="contact-h">
      <div className="wrap">
        <p className="section-eyebrow" data-reveal>06 / Contact</p>
        <h2 id="contact-h" data-reveal>Let's talk data platforms</h2>
        <p className="section-lede" data-reveal>Open to Azure Data Engineer / Senior Data Engineer roles. Based in Sydney, open to relocation.</p>

        <div className="contact-layout" data-reveal>
          <form className="contact-form" id="contactForm" ref={formRef} onSubmit={onSubmit} noValidate>
            <div className="form-field">
              <label className="form-label" htmlFor="cf-name">Name</label>
              <input className="form-input" type="text" id="cf-name" name="name" autoComplete="name" required maxLength={200} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="cf-email">Email</label>
              <input className="form-input" type="email" id="cf-email" name="email" autoComplete="email" required maxLength={200} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="cf-message">Message</label>
              <textarea className="form-input form-textarea" id="cf-message" name="message" rows={5} required maxLength={5000}></textarea>
            </div>
            <div className="form-field form-honeypot" aria-hidden="true">
              <label htmlFor="cf-company">Company</label>
              <input type="text" id="cf-company" name="company" tabIndex={-1} autoComplete="off" />
            </div>
            <button className="btn btn-primary form-submit" type="submit" disabled={submitting}>Send message</button>
            <p className={"form-status " + status.type} id="formStatus" role="status" aria-live="polite">{status.text}</p>
          </form>

          <div className="contact-cards">
            <a className="contact-card" href="https://linkedin.com/in/abhishekvadlamudi" target="_blank" rel="noopener noreferrer">
              <span className="contact-label">LinkedIn</span>
              <span className="contact-value">linkedin.com/in/abhishekvadlamudi</span>
            </a>
            <div className="contact-card contact-card-static">
              <span className="contact-label">Location</span>
              <span className="contact-value">Sydney, NSW, Australia</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
