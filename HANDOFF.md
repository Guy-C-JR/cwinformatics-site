# CWinformatics website — handoff checklist

Static multipage site for **cwinformatics.com**. No build step, no framework, no third-party runtime dependencies. Fonts are self-hosted.

## What is here

| Path | Purpose |
| --- | --- |
| `index.html` | Home |
| `solutions.html` | Solutions, organized by customer problem |
| `how-it-works.html` | Four-step approach with process diagram and FAQ |
| `technology.html` | Principles (no proprietary mechanisms) |
| `about.html` | Engineering-led positioning, values, engagement shape |
| `contact.html` | Contact form with client-side validation |
| `styles/site.css` | All styles, design tokens at the top |
| `scripts/site.js` | Navigation, reveal-on-scroll, contact form submission |
| `assets/fonts/` | Manrope, Inter and JetBrains Mono (latin subsets, woff2) |
| `assets/og.png` | 1200×630 social preview |
| `assets/favicon.svg`, `favicon.png`, `apple-touch-icon.png` | Icons |
| `robots.txt`, `sitemap.xml` | Crawler files (use the production domain) |

Local preview: run `Preview CWinformatics Website.cmd` from the repository root, or serve this folder with any static file server.

## Blocking before launch

- [ ] **Contact form delivery.** The form is wired to POST JSON (`name`, `email`, `organization`, `message`, `page`) to `CONTACT_ENDPOINT` in `scripts/site.js`. That constant is empty. Until it is set, submissions are refused with an honest inline message and **no success state is shown**. Connect a real endpoint (form service, serverless function, or your own API) that returns a 2xx on success, then set the constant. The honeypot field is `company_website`; drop any submission where it is non-empty.
- [ ] **Hosting and domain.** Deploy the folder as the site root so that relative links (`styles/site.css`, `assets/...`) resolve. Canonical URLs and the `og:image` URL assume `https://cwinformatics.com/`.

## Business information intentionally left out

None of the following was invented. Add only what is real:

- [ ] Public contact email, phone, or mailing address
- [ ] Legal entity name, registration, or jurisdiction for the footer
- [ ] Privacy policy and terms (the footer has no legal links today; the contact form states only that submissions are used to respond)
- [ ] Social profiles
- [ ] Pricing, engagement models, or service tiers
- [ ] Customer names, testimonials, case studies, logos
- [ ] Certifications, partnerships, compliance statements
- [ ] Team biographies, founding story, locations
- [ ] Any performance figures (savings, accuracy, speed). The site states that evaluation is ongoing; publish numbers only once validated, scoped to the workload they were measured on.

## Optional follow-ups

- [ ] Analytics or consent banner, if wanted (none included)
- [ ] 404 page from your host
- [ ] Security headers / CSP at the host level (the site has no inline scripts; inline `style` attributes are used in a few places)
- [ ] Replace `og.png` if the headline changes (generated to match the hero copy)

## Design notes

- Palette and type scale are CSS custom properties at the top of `styles/site.css`. The canvas is warm paper; "ink plates" (midnight panels) carry the hero figure, the policy figure, the evaluation summary, the evidence section and the footer.
- Headlines use Manrope at a light weight with tight tracking; body uses Inter; labels, captions, figure bars and form labels use JetBrains Mono. All three are self-hosted latin subsets.
- Two-tone headlines: the second clause is wrapped in `<span class="dim">` and renders in slate.
- Every visual is a numbered figure (`Fig 0.1`, `Fig 1.2`, …) with a mono title bar and a caption footer. Figures with hover parts (hero flow, system schematic) swap the caption when a part is hovered or focused; parts are keyboard-focusable.
- The content column is bounded by hairline rails with crosshair ticks at section boundaries (visible at viewports of 1320px and wider).
- Motion is limited to line-drawing in diagrams, dash flow on connectors, bar growth in the example panel, the chapter rail dot, and a short reveal on scroll. All of it is disabled under `prefers-reduced-motion`.
- Every illustrative panel is labelled as an example layout, schematic or illustration and shows no customer data or numeric results.
