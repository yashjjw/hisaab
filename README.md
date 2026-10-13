# Hisaab — guided demo

Concept prototype for the **Razorpay AI x PM Build Challenge (ISB), Track 1: Razorpay in Your Pocket**.

Hisaab lets a small manufacturer snap a job worker's bill, check it against the goods that actually came back, and pay the right amount in one approval — paying the undisputed lines now and holding only the line that's wrong.

- `index.html` — landing page: the live phone demo on the left, a guide on the right that follows whichever screen you're on.
- `demo.html` — the phone on its own (served at `/demo` on Vercel).

> Sample data only. Payouts, OTP, e-way bills and GST filings are simulated; GST 5% and TDS 1% are illustrative rates. Not an official Razorpay product.

## Run it locally

It's a static site with no build step. Serve the folder with any static server (ES modules don't load from `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Push to GitHub

Create an empty repository named `hisaab` on GitHub (no README, no .gitignore), then from this folder:

```bash
git init
git add .
git commit -m "Hisaab: guided demo for the Razorpay AI x PM Build Challenge"
git branch -M main
git remote add origin https://github.com/<your-username>/hisaab.git
git push -u origin main
```

## Deploy on Vercel

1. Push this folder to a GitHub repository (above).
2. In Vercel: **Add New → Project → Import** the repository.
3. Framework preset: **Other**. Leave the build command and output directory empty (root `/`).
4. Deploy. `vercel.json` turns on clean URLs, so the phone-only page is at `/demo`.

## Structure

```
.
├── index.html          # landing page with guide
├── demo.html           # phone only
├── styles.css          # base styles
├── vercel.json         # clean URLs
├── src/
│   ├── app.js          # the phone app (all screens, data and rules)
│   ├── guide.js        # the landing page and step-by-step guide
│   ├── main.js         # mounts the landing page
│   └── demo.js         # mounts the phone-only page
└── vendor/
    ├── htm-preact.mjs  # Preact + htm (htm 3.1.1 standalone build), vendored
    └── htm-LICENSE
```

`src/app.js` and `src/guide.js` are plain ES modules using [Preact](https://preactjs.com) with [htm](https://github.com/developit/htm) templates, so there's nothing to compile. All money maths (charges, GST, TDS, holds) is deterministic and lives in `src/app.js`.

Fonts load from Google Fonts (Manrope, Caveat, Noto Sans Devanagari).

Built by Yash Jhunjhunwala, ISB.
