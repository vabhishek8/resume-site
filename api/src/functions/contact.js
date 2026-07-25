const { app } = require("@azure/functions");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(input) {
  return String(input).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

app.http("contact", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "contact",
  handler: async function (request, context) {
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return { status: 400, jsonBody: { error: "Invalid request body." } };
    }

    const name = body && typeof body.name === "string" ? body.name.trim() : "";
    const email = body && typeof body.email === "string" ? body.email.trim() : "";
    const message = body && typeof body.message === "string" ? body.message.trim() : "";
    const company = body && typeof body.company === "string" ? body.company.trim() : "";

    // Honeypot field: real users never fill this in (it's visually hidden).
    // Bots that auto-fill every field will trip it. Accept silently, send nothing.
    if (company) {
      return { status: 200, jsonBody: { ok: true } };
    }

    if (!name || !email || !message) {
      return { status: 400, jsonBody: { error: "Name, email, and message are required." } };
    }
    if (!EMAIL_PATTERN.test(email)) {
      return { status: 400, jsonBody: { error: "Enter a valid email address." } };
    }
    if (name.length > 200 || email.length > 200 || message.length > 5000) {
      return { status: 400, jsonBody: { error: "Submission is too long." } };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toAddress = process.env.CONTACT_TO_EMAIL || "vabhishek8@gmail.com";
    const fromAddress = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <contact@abhishekvadlamudi.com>";

    if (!apiKey) {
      context.error("RESEND_API_KEY is not configured in Application Settings.");
      return { status: 500, jsonBody: { error: "Contact form is not configured yet. Try LinkedIn in the meantime." } };
    }

    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toAddress],
          reply_to: email,
          subject: "Portfolio contact from " + name,
          html:
            "<p><strong>Name:</strong> " + escapeHtml(name) + "</p>" +
            "<p><strong>Email:</strong> " + escapeHtml(email) + "</p>" +
            "<p><strong>Message:</strong></p><p>" + escapeHtml(message).replace(/\n/g, "<br>") + "</p>"
        })
      });

      if (!resendResponse.ok) {
        const errText = await resendResponse.text();
        context.error("Resend API error " + resendResponse.status + ": " + errText);
        return { status: 502, jsonBody: { error: "Message could not be sent right now. Try again later." } };
      }

      return { status: 200, jsonBody: { ok: true } };
    } catch (err) {
      context.error("Contact function error:", err);
      return { status: 500, jsonBody: { error: "Unexpected error sending message." } };
    }
  }
});
