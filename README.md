# Z Ratings — Website (Redesign)

Static marketing site for **Z Ratings**, an inventory risk intelligence platform for cannabis retailers, operators, and finance teams.

> **Status:** Staging / preview for owner review. The current production site lives at https://zratings.net and is **not** affected by this repository.

## Pages
- `index.html` — Home
- `howitworks.html` — How It Works
- `solutions.html` — Solutions
- `packages.html` — Packages & Pricing
- `about.html` — About
- `contact.html` — Contact (Formspree-powered form)
- `thankyou.html` — Post-submission confirmation

## Stack
- Static HTML, [Tailwind CSS](https://tailwindcss.com) via CDN
- Fonts: Schibsted Grotesk (display), Hanken Grotesk (body), IBM Plex Mono (numerals)
- Forms: [Formspree](https://formspree.io); "Book a Demo" CTAs link to a Google Calendar scheduler
- Brand assets in `assets/` and `brand_assets/`; favicons + `og-image.png` at root

## Local preview
```bash
node serve.mjs           # serves the project root at http://localhost:3000
```

`screenshot.mjs` (Puppeteer) is a dev utility for capturing pages during design QA.

## Deploy
Served as a static site (e.g., GitHub Pages). No build step required.
