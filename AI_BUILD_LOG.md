# Hisaab: AI build log

Razorpay AI x PM Build Challenge (ISB), Track 1: Razorpay in Your Pocket
Yash Jhunjhunwala, ISB PGP Co'27

Hisaab helps a small manufacturer who uses job work check a job worker's bill against the goods that came back, pay the right amount, and keep stock, batch costs, TDS and GST credit in one place. This log covers how I used AI to build it, what I decided myself, and what still needs checking.

---

## 1. AI tools and models used

| Tool | What I used it for |
|---|---|
| **Claude (Anthropic), in the Claude app** (agent workspace built on Claude Code; configured model `claude-opus-5-5`) | Research, product critique, feature docs, the design prototype, the static site code, test scripts and drafts of the product note |
| **Claude web search and page fetching** (inside the same workspace) | Researching Razorpay products, GST job-work rules and competitor tools (Busy, MunimJi, Tally) |
| **Claude artifacts** (Design canvas and Docs) | First version of the phone prototype and the feature docs |
| **Playwright** (run by Claude, not an AI tool itself) | Automated click-through tests of the prototype |
| **Claude Code** | Set up for continuing the build locally, using the `CLAUDE.md` context file in this repo |

Hosting is plain GitHub and Vercel, with no AI involved.

---

## 2. Key prompts, workflows and agent setup

I worked in one long conversation with Claude, roughly in this order.

### a) Research and finding the white space
- *"Find all the features Razorpay has in its SME merchant product, my focus is on full stack builder"*, then deep dives into GST invoices, Route and B2B.
- I then described a dress manufacturer's job-work process in my own words (fabric going to a dyer, printer and ironing unit, each sending a bill, e.g. 100 m sent and 97 m returned) and asked: *"Please search if Razorpay provides a solution for this or if it is a white space."*
- *"Scrape all the solutions provided by [Busy and MunimJi], extend it to any job work, not just garments, and see how Razorpay can integrate the same."*

### b) Stress-testing the idea
- *"Rate the idea"* and *"rate this product"*, to get the weak points out early.
- A long structured product-review prompt I wrote, with 11 sections (merchant, job to be done, flow, decisions, what to leave out, metrics, etc.) and two hard rules: **do not write code** and **do not invent research or integrations**.
- *"Create different options for payment settlement"*, *"give me a set of features based on priority"*, *"give me a feature doc for the plan"*.

### c) Building the prototype
- *"Based on whatever we have discussed, create a mobile prototype which follows all the UI/UX principles that RazorpayX already uses. I have included a md file with some info on design."* The md file was my own study of RazorpayX's UI (themes, contrast, number styles, status pills, stepper flows, etc.), which Claude used as the design source.
- Many rounds of feedback after that, e.g. *"The inventory page is not clean, the top 3 tabs should be clickable..."*, *"In Send Goods Out, the user should only be allowed to send goods that are in stock"*, *"The numbers in the GST tab seem unrealistic"*, *"The phone is overflowing out of the page."*
- *"Make the landing page like a guide, which guides through each step that is going on in the app... the user should get a brief understanding of what the problem is and what we are trying to solve."*

### d) Turning it into a site I could host
- Claude converted the design prototype into a static site (Preact + htm, no build step) so I could push it to GitHub and host it on Vercel.
- Claude wrote a Playwright smoke test (`tools/smoke_test.py`) that clicks through both bills, the challan, inventory, payouts and GST, and checks the key amounts.
- I had Claude write `CLAUDE.md` (product context, seed data, rules, design rules and guardrails) so I could continue in Claude Code without losing context.

### Guardrails I kept in every step
- AI reads the bill. Fixed rules do the maths. The owner decides. Razorpay pays.
- No claims about Razorpay integrations that aren't confirmed; payouts, OTP, e-way bills and GST filing are labelled as simulated.
- GST and TDS rates are labelled as illustrative.
- Every number on screen has to match one seed-data table (all money is calculated in paise).

---

## 3. One AI output I rejected or significantly improved

**The problem statement in the product note, and the guide panel on the landing page.**

Claude's first version of the product note framed the problem quite narrowly, as "check a job worker's bill and pay it". That followed the brief's "focus beats breadth" line, but it undersold what the merchant goes through. The evidence section also just said "a manufacturer who works with job workers confirmed the problem is real", which was too vague to be useful.

I rejected that framing and asked for three changes:
1. **Show the broader problem.** Job work affects GST credit, TDS, inventory and batch costing, not just one bill. The final note lists the five questions an owner struggles with (Is this bill right? How much should I pay? Where are my goods? What did this batch cost? Am I getting my GST credit?), while keeping the checked bill as the core of the product.
2. **Make the evidence specific**, using the dress manufacturer I spoke to and his actual workflow.
3. **Make it human and not tied to cloth.** I pushed the language toward plain sentences, and broadened the merchant from "a dress maker" to any manufacturer who outsources processes (garments, auto parts, furniture, etc.), with the dress maker kept as the demo example.

The landing-page guide went through a similar loop. The first version was cluttered, so I asked to cut it down. The cut-down version then lost the problem/solution story, so I asked for it to be rebuilt to show each screen's "Today vs With Hisaab" and what's at stake in rupees, and then to fit on one screen with no scrolling.

**Why:** the judges need to see the merchant's real pain in one glance. The AI tends to optimise for what the brief literally says, and I had to bring in what the merchant actually experiences.

Other corrections along the way:
- The GST tab numbers looked unrealistic, so I had them reworked to plausible monthly values for a small unit.
- The AI's early feature doc listed inventory and batch costing under "cut, leave it to Busy/Tally". I decided to build an inventory view (raw material to finished goods, what's with which job worker, overdue consignments, cost per batch) because that's what the owner asks about right after paying a bill.
- The working name "Check & Pay" was replaced by **Hisaab** after I asked for name options and narrowed them down.

---

## 4. What AI did vs what I decided or built

| AI (Claude) did | I decided or did |
|---|---|
| Web research and summaries on Razorpay products, GST job-work rules and competitor tools | Chose the track and the problem (job work), based on a real dress manufacturer's workflow I already knew |
| Drafted the product review, feature docs and priority lists | Spoke to the merchant and confirmed the problem is real |
| Wrote all the prototype code (design canvas, then the static site) | Decided the core behaviour: pay the lines that are right, hold only the wrong one |
| Built the seed data and the deterministic money rules (in paise) | Decided which features to add (inventory tracking, send goods out only from stock, e-way bill prompt, payouts, GST reconciliation, light theme) and which to leave out |
| Wrote the Playwright smoke test and the `CLAUDE.md` context file | Supplied the design direction through my own RazorpayX UI study |
| Drafted each version of the one-page note | Gave every round of design feedback (layout, clutter, phone size, overflow, realistic numbers, the guide panel) |
| | Picked the name, set the framing of the product note, and set up GitHub and Vercel |

In short, AI did most of the typing and the research legwork, and I made the product calls: the problem, the merchant, the trade-offs, what to build and what to drop.

---

## 5. Known limitations, risks and verification

### Limitations of the prototype
- **The bill reading is simulated.** The demo uses two sample bills with stored "AI reading" results. No live OCR or model call happens in the prototype.
- **Payouts, OTP approval, e-way bills and GST filings are simulated.** Nothing touches a real bank, the GST portal or RazorpayX APIs.
- **Sample data only**: one merchant, two bills, a handful of lots and batches.
- **Evidence is one merchant conversation.** It confirms the problem exists, but it isn't enough to size it.

### Risks if this were built for real
- **Handwritten bills can be misread.** Mitigation: low-confidence lines wait for the owner to confirm, and the AI never moves money or applies deductions on its own.
- **Job-worker relationships.** Holding a line could cause friction, so the owner always chooses (hold, pay for what came back, or pay as billed) and the query is polite and itemised.
- **Tax rules.** GST rates on job work, TDS under Section 194C and the 180-day ITC rule need checking by a CA before any real use.
- **Eligibility and fees.** Whether a small proprietor can use RazorpayX payouts, and at what cost, needs confirming with Razorpay.
- **Bill data is sensitive business information** and would need proper consent and storage rules.

### What I verified, and how
- **Amounts:** the smoke test clicks through the whole demo and checks the key figures (Ramesh payout ₹26,815.36; Shree pay-now ₹10,951.20 with ₹8,505.00 on hold; tour completes 6 of 6). All money is integer paise, so totals match to the paisa.
- **Numbers in the docs and the guide** were cross-checked against the seed-data table (e.g. home total ₹46,634.70 = ₹27,073.20 + ₹19,561.50).
- **Layout:** screenshots at 1280×720, 1366×768, 1440×900, 1536×864, 1920×1080 and phone width, to confirm the phone and guide fit without scrolling on desktop.
- **Regulations from sources:** job work under Section 143 and Rule 55 (goods back within 1 year for inputs), ITC-04 filing frequency, e-way bill above ₹50,000 or for inter-state job-work movement, and Section 43B(h)'s 45-day payment limit for micro and small suppliers.
- **Razorpay products** from razorpay.com public pages (RazorpayX payouts, approvals, Source to Pay). Route was ruled out because it needs ₹40 lakh turnover and an RBI use-case review.
- **Not verified, labelled illustrative:** GST 5% and TDS 1% in the demo, the 180-day ITC rule, HSN codes, and any Razorpay WhatsApp, GSP or e-way bill integration.
