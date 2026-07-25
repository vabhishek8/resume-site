# Contact form setup (one-time, manual)

The contact form on the site posts to an Azure Function at `/api/contact`, which sends
the message through Resend's email API. The email address is never printed in the page
source. This setup takes about 10 minutes and costs $0 at portfolio-site volume.

Two things need to happen outside of this repo, by you, because they involve an account
signup and an API key, neither of which should be handled by an assistant on your behalf.

## 1. Create a free Resend account and verify the sending domain

1. Sign up at https://resend.com (free tier: 100 emails/day, 3,000/month, no card required).
2. In Resend, go to Domains and add `abhishekvadlamudi.com`.
3. Resend will give you 3 DNS records (SPF, DKIM, and a return-path/tracking CNAME).
   Add them at your domain registrar (Crazy Domains, under DNS management for
   abhishekvadlamudi.com). Send me the exact record values if you want help adding them.
4. Wait for Resend to show the domain as "Verified" (usually a few minutes to a few hours
   depending on DNS propagation).
5. In Resend, create an API key (Settings -> API Keys). Copy it once, you won't see it
   again.

## 2. Add the API key to the Azure Static Web App (not to GitHub)

The Function reads its configuration from the Static Web App's Application Settings,
not from GitHub Actions secrets.

1. Azure Portal -> your Static Web App (`resume-site`) -> Settings -> Environment
   variables (or "Configuration" depending on portal version).
2. Add these:
   - `RESEND_API_KEY` = the key you copied from Resend
   - `CONTACT_TO_EMAIL` = the inbox you want messages delivered to (defaults to
     vabhishek8@gmail.com if unset)
   - `CONTACT_FROM_EMAIL` = `Portfolio Contact <contact@abhishekvadlamudi.com>`
     (must be on the domain you verified in step 1)
3. Save. No redeploy needed, Application Settings apply to the running Function
   immediately.

## Verifying it works

Once both steps are done, submit the form on the live site and confirm the email
arrives. If it doesn't:

- Check the Function's logs in Azure Portal -> Static Web App -> Functions -> contact
  -> Monitor, for a Resend API error (usually a domain-verification or key issue).
- Confirm `api_location: "api"` deployed correctly by checking that
  `https://abhishekvadlamudi.com/api/contact` returns something other than a 404 on a
  GET request (it will return 405 Method Not Allowed, which is correct, since the
  endpoint only accepts POST).

## Cost

- Resend free tier: $0, permanently, up to 100 emails/day.
- Azure Functions on the Static Web App's included plan: $0, up to 1,000,000
  executions/month, far beyond what a contact form will ever use.

No paid resource is created by this setup. If you ever want a paid tier of either
service, that's a separate decision, not a side effect of this change.
