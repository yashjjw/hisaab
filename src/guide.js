// Generated from the Hisaab design prototype. Preact + htm, no build step.
import { html, Component } from '../vendor/htm-preact.mjs';
import { Main } from './app.js';

export class Guide extends Component {
  constructor(props) {
    super(props);
    this.state = { info: { screen: 'home', bill: 'ramesh', confirmed: false, reading: false, challanDone: false, invView: 'process', paidRamesh: false, paidShree: false, challanMade: false, choice: 'hold', ewbStage: 'none' }, visited: { home: true } };
    this.state.scale = 0.85;
    this.onScreen = (info) => {
      const v = Object.assign({}, this.state.visited);
      v[info.screen] = true;
      this.setState({ info: info, visited: v });
    };
    this.fit = () => {
      const w = window.innerWidth || 1280;
      const h = window.innerHeight || 900;
      const stacked = w < 1000;
      const availW = stacked ? w - 48 - 24 : (Math.min(w, 1440) - 48 - 32) * 0.56 - 24;
      const availH = h - 24 - 12 - 12 - 40;
      const s = Math.max(0.5, Math.min(1.25, availW / 414, availH / 868));
      if (Math.abs(s - this.state.scale) > 0.005) { this.setState({ scale: s }); }
    };
  }

  componentDidMount() {
    this.fit();
    window.addEventListener('resize', this.fit);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.fit);
  }

  guide(i) {
    const shree = i.bill === 'shree';
    const G = {
      home: {
        where: 'Home', title: 'Your job-work bills at a glance',
        problem: 'bills from dyers, printers and tailors arrive as WhatsApp photos and paper slips, so most owners just pay them as billed.',
        next: !i.paidRamesh ? 'Tap “Check a bill”, then pick Ramesh Processors — a clean printed bill.' : (!i.paidShree ? 'Tap Shree Prints in the list — a handwritten bill with a problem in it.' : (!i.challanMade ? 'Tap “Send goods out” to send fabric to a job worker on a challan.' : 'Open the Inventory, Payouts and GST tabs in the bottom bar.'))
      },
      snap: {
        where: 'Check a bill · 1 of 4', title: 'Snap the job worker’s bill',
        problem: 'typing out a handwritten bill takes longer than just paying it, so nobody checks.',
        next: !i.paidRamesh ? 'Pick Ramesh Processors (printed) first.' : 'Pick Shree Prints (handwritten).'
      },
      read: {
        where: 'Check a bill · 2 of 4', title: i.reading ? 'Reading the bill…' : 'AI reads the bill and links each line to a lot',
        problem: shree ? 'handwriting is ambiguous, and a wrong link makes the whole check wrong — so the AI suggests and the owner confirms.' : 'matching bill lines to the goods you sent is tedious, so it rarely happens before paying.',
        next: shree && !i.confirmed ? 'Tap “Yes, P-205” to confirm the lot, then “Check this bill”.' : 'Tap “Check this bill”.'
      },
      verdict: {
        where: 'Check a bill · 3 of 4', title: shree ? 'One line needs a look — P-205 billed 20 m more than came back' : 'All three lines match what came back',
        problem: 'nobody compares the bill with what actually came back, so overbilling and excess fabric loss go unnoticed.',
        next: 'Tap “See how it adds up”.'
      },
      breakdown: {
        where: 'Check a bill · 3 of 4', title: shree ? 'Pay what’s right, hold the rest' : 'How the amount adds up',
        problem: shree ? 'one disputed line holds up the whole payment — or the owner pays it all to keep a hard-to-replace job worker happy.' : 'GST and TDS are worked out by the accountant later, after the money has gone.',
        next: shree ? 'Keep “Hold this line”, then tap “Review payout · ₹10,951.20”.' : 'Tap “Review payout”.'
      },
      approve: {
        where: 'Check a bill · 4 of 4', title: 'Approve the payout',
        problem: 'job workers are paid from personal UPI with no record of which bill or lots the money was for.',
        next: 'Tap “Approve & pay”.'
      },
      done: {
        where: 'Paid', title: shree ? 'Clean line paid, query ready for the held one' : 'Paid, with a statement for the job worker',
        problem: 'job workers dispute payments because they never see how the amount was worked out.',
        next: shree ? 'Switch the query to हिंदी, then “Back to home” and tap “Send goods out”.' : 'Tap “Check next bill” to see the Shree Prints exception.'
      },
      challan: i.challanDone ? {
        where: 'Send goods out', title: 'Challan created — with an e-way bill if needed',
        problem: 'goods not back within a year are treated as sold under GST, with tax and interest — and a paper challan book won’t warn you.',
        next: i.ewbStage === 'done' ? 'Tap “Done”, then open the Inventory tab.' : 'Tap “Create e-way bill from this challan”, then “Generate”.'
      } : {
        where: 'Send goods out', title: 'Send goods to a job worker on a challan',
        problem: 'goods sent out live in a paper challan book, so later nobody can say what a bill should be checked against.',
        next: 'Pick Rayon, white, tap “All” (₹82,500 — over ₹50,000), then “Create challan”.'
      },
      inventory: {
        where: 'Inventory', title: i.invView === 'raw' ? 'Raw material in your store' : (i.invView === 'finished' ? 'Finished goods, at cost' : 'What each job worker has right now'),
        problem: 'owners don’t know what’s with which job worker, what’s overdue, or what a batch really cost.',
        next: i.invView === 'finished' ? 'Tap “Navy rayon dresses” to see its batches.' : (i.invView === 'raw' ? 'Tap the “In process” tile.' : 'Tap Ramesh Processors to see his consignments.')
      },
      agency: {
        where: 'Inventory · job worker', title: 'Consignments with one job worker',
        problem: 'overdue goods are chased by phone, from memory, usually too late.',
        next: 'Go back, tap the “Finished” tile, then a product.'
      },
      product: {
        where: 'Inventory · finished goods', title: 'Batches and cost per piece',
        problem: 'owners price on a guess, because a batch’s real cost is spread across many bills.',
        next: 'Tap B-24 to see where its cost came from.'
      },
      batch: {
        where: 'Inventory · batch', title: 'Where one batch’s cost came from',
        problem: 'process loss and job-work charges are invisible in the final price.',
        next: 'Open the Payouts tab in the bottom bar.'
      },
      payouts: {
        where: 'Payouts', title: 'Every payout in one place',
        problem: 'payments to job workers are scattered across UPI apps, with no link to bills or TDS.',
        next: 'Open the GST tab.'
      },
      gst: {
        where: 'GST', title: 'Input credit, checked against vendor filings',
        problem: 'if a vendor files late or wrong, the owner can lose input credit — and finds out months later.',
        next: 'In Sep, tap Kothari Fabrics — ₹8,100 of credit at risk from an unfiled bill — or Shree Prints for a mismatch.'
      },
      gstVendor: {
        where: 'GST · vendor', title: 'Reconcile one vendor',
        problem: 'finding which bill is missing or wrong on the GST portal takes hours with the accountant.',
        next: 'That’s the tour. Go Home and try it again in light theme.'
      }
    };
    return G[i.screen] || G.home;
  }

  renderVals() {
    const i = this.state.info;
    const v = this.state.visited;
    const g = this.guide(i);
    const items = [
      { label: 'Clean bill', done: i.paidRamesh },
      { label: 'Disputed bill', done: i.paidShree },
      { label: 'Send goods out', done: i.challanMade },
      { label: 'Inventory', done: !!v.inventory },
      { label: 'Payouts', done: !!v.payouts },
      { label: 'GST', done: !!v.gst }
    ];
    const tour = items.map((x) => ({ label: x.label, mark: x.done ? '✓' : '',
      style: 'display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px 6px 6px; border-radius: 999px; font-size: 13px; font-weight: 700; background: #FFFFFF; color: ' + (x.done ? '#15803D' : '#4A5260') + '; border: 1px solid ' + (x.done ? '#15803D' : '#E2E5EA'),
      dotStyle: 'flex: none; width: 20px; height: 20px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #FFFFFF; box-sizing: border-box; background: ' + (x.done ? '#15803D' : '#FFFFFF') + '; border: 2px solid ' + (x.done ? '#15803D' : '#C9CED6') }));
    return {
      g: g, tour: tour, tourDone: items.filter((x) => x.done).length,
      scale: this.state.scale.toFixed(3),
      phoneW: Math.round(414 * this.state.scale) + 'px',
      phoneH: Math.round(868 * this.state.scale) + 'px',
      onScreen: this.onScreen
    };
  }

  render() {
    const v = this.renderVals();
    return html`<div style="background: #F5F6F8; color: #0F1115; font-family: 'Manrope', system-ui, sans-serif; font-size: 16px; line-height: 1.55; padding: 12px 24px; box-sizing: border-box">
<div style="max-width: 1440px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">

<div style="flex: 1.3 1 560px; min-width: 0; border-radius: 28px; background: #E7ECF7; padding: 12px 12px 16px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 10px; overflow: hidden">
<div style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: #0E1A3A; color: #FFFFFF; font-size: 14px; font-weight: 700">
<span style="width: 8px; height: 8px; border-radius: 999px; background: #4ADE80"></span>
Live demo — tap through the phone
</div>
<div style="flex: none; position: relative; width: ${v.phoneW}; height: ${v.phoneH}">
<div style="position: absolute; left: 0; top: 0; width: 414px; height: 868px; box-sizing: border-box; padding: 12px; border-radius: 67px; background: #1C1C1E; box-shadow: 0 0 0 2px #48484A, 0 30px 70px rgba(15,17,21,0.28); transform: scale(${v.scale}); transform-origin: top left">
<div aria-hidden="true" style="position: absolute; left: -4px; top: 150px; width: 4px; height: 30px; border-radius: 2px 0 0 2px; background: #48484A"></div>
<div aria-hidden="true" style="position: absolute; left: -4px; top: 205px; width: 4px; height: 58px; border-radius: 2px 0 0 2px; background: #48484A"></div>
<div aria-hidden="true" style="position: absolute; left: -4px; top: 275px; width: 4px; height: 58px; border-radius: 2px 0 0 2px; background: #48484A"></div>
<div aria-hidden="true" style="position: absolute; right: -4px; top: 240px; width: 4px; height: 92px; border-radius: 0 2px 2px 0; background: #48484A"></div>
<div style="width: 390px; height: 844px; border-radius: 55px; overflow: hidden">
<${Main} onScreen=${v.onScreen} />
</div>
</div>
</div>
</div>

<div style="flex: 1 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 28px; padding: 20px 8px; box-sizing: border-box; position: sticky; top: 24px">
<div style="display: flex; flex-direction: column; gap: 10px">
<div style="font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #5F6775">Razorpay AI x PM Build Challenge · Track 1</div>
<h1 style="margin: 0; font-size: 44px; line-height: 1.05; font-weight: 800; letter-spacing: -0.03em">Hisaab</h1>
<p style="margin: 0; font-size: 19px; line-height: 1.45; color: #1F2430">Pay job workers for what actually came back. Snap the bill, check it against the goods returned, and pay the right amount in one approval.</p>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E5EA; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 16px">
<span style="font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #2F6BEB">You are here · ${v.g.where}</span>
<h2 style="margin: 0; font-size: 24px; line-height: 1.25; font-weight: 800; letter-spacing: -0.01em">${v.g.title}</h2>
<p style="margin: 0; font-size: 16px; color: #343A46"><span style="font-weight: 800; color: #8A4300">The problem today: </span>${v.g.problem}</p>
<div style="border-radius: 14px; background: #0E1A3A; color: #FFFFFF; padding: 16px 18px; display: flex; gap: 14px; align-items: flex-start">
<span style="flex: none; width: 30px; height: 30px; border-radius: 999px; background: #2F6BEB; display: flex; align-items: center; justify-content: center">
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
</span>
<span style="display: flex; flex-direction: column; gap: 2px">
<span style="font-size: 12px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #9CC0FF">Next step</span>
<span style="font-size: 16px; font-weight: 600; line-height: 1.45">${v.g.next}</span>
</span>
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 10px">
<div style="font-size: 14px; font-weight: 800">Tour · ${v.tourDone} of 6</div>
<div style="display: flex; flex-wrap: wrap; gap: 8px">
${(v.tour || []).map((tr, $index) => html`
<span style=${tr.style}><span style=${tr.dotStyle}>${tr.mark}</span>${tr.label}</span>
`)}
</div>
</div>

<div style="font-size: 12px; color: #5F6775; border-top: 1px solid #E2E5EA; padding-top: 14px">Concept prototype with sample data; payouts, e-way bills and GST filings are simulated. Not an official Razorpay product. Built by Yash Jhunjhunwala, ISB.</div>
</div>

</div>
</div>`;
  }
}
