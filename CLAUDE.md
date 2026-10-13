# Hisaab — project context for Claude Code

Concept prototype for the **Razorpay AI x PM Build Challenge (ISB)**, **Track 1: "Razorpay in Your Pocket"** (Full Stack Builder role). Built by Yash Jhunjhunwala (ISB PGP Co'27). Previously named **"Check & Pay"** — the design canvas and feature docs still use that name.

## The challenge brief (what judges score)
- Build a focused **mobile** experience that helps an Indian SME merchant complete **one important task end to end, ideally in under 2 minutes**. "Do not redesign the entire Razorpay app. Focus beats breadth."
- Submission: one-page product note, 90-second demo video, demonstrable prototype, AI build log. Deadline was 13 Oct 2026, 11:59 PM IST.
- Scored on: importance/clarity of the problem; depth of merchant understanding; product judgment and what was deliberately left out; how AI was used to 10x the build; clarity of communication.
- Must show: who the merchant is, how they do the task today and the friction, why mobile, a clear flow, key decisions + what was not built, how success is measured.

## The product
**Merchant:** small Indian manufacturer with no in-house processing (demo: "Mehta Fashions", a dress maker). Goods go out on delivery challans to job workers (dyer → printer → tailor → pressing), come back short by process loss, and each job worker sends a bill (often handwritten, on WhatsApp).

**Job to be done:** "My job worker sent his bill. Is it right, and can I pay it?"

**Today:** paper challans, returns in a notebook, bill paid by personal UPI as billed; the accountant reconciles in Busy/Tally later. Busy/MunimJi/Tally track goods but stop at "outstanding" — nobody checks the bill at the moment of payment.

**Hero flow (Hisaab / "Check & Pay"):** snap bill → AI reads it and links each line to a lot (owner confirms unclear links) → fixed rules check every line → verdict → breakdown → approve with OTP → statement + query to job worker.

**Signature behaviour:** pay the undisputed lines now, **hold only the flagged line**.
**Principle:** AI reads the bill. Rules do the maths. The owner decides. Razorpay pays. AI never approves money or applies deductions; loss deductions are never automatic.

**Why Razorpay:** RazorpayX already has payouts, mobile OTP approvals, TDS deduction (Source to Pay has OCR + GRN matching for *purchases*). Hisaab extends that logic to *job work* (goods sent out and returned minus process loss) on mobile, and gives a reason to pay via Razorpay instead of personal UPI.

**Secondary tabs (framed as "because every bill is checked, the rest follows" — keep them secondary in the pitch):** Inventory, Payouts, GST, plus Send goods out (challan + e-way bill).

## Seed data and rules (keep every number consistent)
Bill rules (deterministic, in `compute()`): R1 billed qty > returned qty; R2 rate ≠ agreed rate; R3 loss % > limit (3%) — shown with fabric value, never auto-deducted; R4 duplicate bill; R5 arithmetic. Billing basis = returned metres. GST 5% and TDS 1% (on charges excl. GST) are **illustrative**. All money is integer **paise**; format with `fmt()` / `big()`.

| Bill | Lines | Result |
|---|---|---|
| Ramesh Processors RP-118 (dyer, ₹22/m, printed) | L-101 500→488, L-104 400→391, L-109 300→293 | All match. Charges ₹25,784.00 + GST ₹1,289.20 − TDS ₹257.84 = **₹26,815.36** |
| Shree Prints SP-0947 (printer, ₹18/m, handwritten, fabric ₹120/m) | P-201 600→585 billed 585 OK; P-205 450→430 billed 450 | P-205 flagged: 20 m over (₹360 + ₹18 GST); loss 4.4%, 6.5 m over limit (₹780 fabric). Hold → pay **₹10,951.20** now, **₹8,505.00** on hold. Revised bill for 430 m → ₹8,049.60 |

Home card total ₹46,634.70 billed. Inventory batches: B-24 navy rayon (198 pcs, ₹84,483 → ₹426.68/pc, received 8 Oct), B-21 (150 pcs, ₹422.45/pc), B-19 maroon (120 pcs, ₹374.91/pc), B-27 red georgette in process (₹54,000 raw + printing from Shree's bill), new batches B-29+ created by challans. Stock: rayon 750 m (₹110/m), georgette 200 m (₹120/m), cotton 0, B-27 430 m. "Today" in the demo is 13 Oct 2026. GST tab: Sep input GST ₹37,636.50 (matched ₹28,768.80, differs ₹430.20 — Shree SP-0921 filed ₹8,064 vs ₹8,604, not filed ₹8,437.50 — Kothari Fabrics KF-3310 + Noor NT-212); Oct ₹17,115.85 not due yet.

## Code layout
Static site, **no build step**: Preact + htm (vendored in `vendor/htm-preact.mjs`, htm 3.1.1 standalone). Hosted on Vercel (preset "Other", no build command; `vercel.json` sets clean URLs).

- `index.html` → `src/main.js` → `Guide` (`src/guide.js`): landing page — phone on the left (scaled to fit the viewport via `fit()`), guide on the right: "The problem" (3 merchant pains; the one the current screen solves is highlighted "Solving now"), then a "You are here" card per screen with **Today vs With Hisaab**, a "What's at stake" line using demo numbers, and the next step; then the 6-item tour. `guide(i)` returns `{where, title, pains, today, hisaab, stake, next}` per screen — every stake number must reconcile with the seed data below.
- `demo.html` → `src/demo.js`: phone only.
- `src/app.js` → `Main`: the whole phone app in one class component. `renderVals()` builds every value the template uses (`v.*`); `render()` is one big htm template. Screens are driven by `state.screen`: `home, snap, read, verdict, breakdown, approve, done, challan, inventory, agency, product, batch, payouts, gst, gstVendor`.
- `Main` calls `props.onScreen(info)` on screen/state changes (`report()`); `Guide.guide(info)` maps that to guide copy. **If you add or rename a screen, update `Guide.guide()` too.**
- Helpers: `compute(billId, choice)` (bill rules + payable), `inventory()`, `payoutsData()`, `gstData()`; theme tokens `t` (light default, sun/moon toggle; brand blue `#2F6BEB` constant across themes); `pill()` status pills; `langStyle()` radio-chip style. `inventoryOld()` is dead code — safe to delete.
- Styles are inline CSS strings (Preact accepts string `style`). Keep that pattern.
- The header comment says the files were generated from the design canvas; **they are now the source of truth — edit them directly.**

## Design rules (from the RazorpayX UI study in `../razorpayx_ui_ux_design_study.md`)
Light theme default; only surface/ink tokens change between themes. Three-tier text contrast. Big whole-rupee numerals with smaller ₹ and paise. Full-screen stepper flows with a thin progress bar. Quick filters as radio pills (`role="radio"`). Status pills always paired with one line of plain explanation. Empty states explain what to do. iPhone frame: status bar 47 px, Dynamic Island, tab bar 84 px, home indicator, bottom CTAs padded 34 px. Touch targets ≥ 44 px, real `<button>`s, no emoji icons (inline stroke SVG). No Razorpay logo.

## Facts: verified vs not
Verified from sources: Rule 55 delivery challan + Section 143 job work (1-year return for inputs, 3 for capital goods); ITC-04 half-yearly above ₹5 cr / annual below (Rule 45(3)); e-way bill above ₹50,000 or any inter-state job-work movement (Tally guide); Section 43B(h) 45-day MSE payment limit (Rajya Sabha reply, 21 Jul 2026); RazorpayX features from razorpay.com public pages; Route needs ₹40 lakh turnover + RBI use-case review (not used).
**Not verified — keep labelled illustrative:** GST rates (5% fabric/job work, 18% packaging), TDS 194C rate/thresholds, 180-day ITC reversal on unpaid bills, e-way bill validity, HSN codes, any Razorpay WhatsApp/GSP/e-way-bill integration.

## Guardrails
- Don't claim Razorpay integrations that aren't confirmed; e-way bill / GST filing / payouts / OTP stay "simulated / demo".
- Keep the fine print "Concept prototype … Not an official Razorpay product." on the landing page.
- Prefer depth on the hero flow over new tabs. Every new number must reconcile with the tables above.

## Testing
`tools/smoke_test.py` (Python Playwright) serves the folder, clicks through both bills, the challan + e-way bill, Inventory, Payouts and GST, prints key amounts and any console errors, and saves screenshots:
```bash
pip install playwright && python -m playwright install chromium
python tools/smoke_test.py . ./shots
```
Expected: `Review payout · ₹26,815.36`, `Review payout · ₹10,951.20`, on hold `8,505.00`, `Tour · 6 of 6`, no page errors.

## Related material (Claude.ai)
- Product review & MVP spec: https://claude.ai/code/artifact/dff6c554-f604-4b7e-9427-463abb49e3c2
- Feature doc (Check & Pay): https://claude.ai/code/artifact/b8ffbd3d-de00-43f5-9346-25acd2d7ebeb
- Original design canvas: https://claude.ai/artifact/UYxfwfxRv3XoWRBwNAcXQS
