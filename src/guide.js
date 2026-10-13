// Generated from the Hisaab design prototype. Preact + htm, no build step.
import { html, Component } from '../vendor/htm-preact.mjs';
import { Main } from './app.js';

export class Guide extends Component {
  constructor(props) {
    super(props);
    this.state = { info: { screen: 'home', bill: 'ramesh', confirmed: false, reading: false, challanDone: false, invView: 'process', paidRamesh: false, paidShree: false, challanMade: false, choice: 'hold', ewbStage: 'none' }, visited: { home: true }, scale: 0.85, stacked: false, textScale: 1 };
    this.textFloor = 9;
    this.onScreen = (info) => {
      const v = Object.assign({}, this.state.visited);
      v[info.screen] = true;
      this.setState({ info: info, visited: v });
    };
    this.fit = () => {
      const w = window.innerWidth || 1280;
      const h = window.innerHeight || 900;
      const stacked = w < 1000;
      const availW = stacked ? w - 48 - 24 : (Math.min(w, 1440) - 48 - 28) * 0.53 - 24;
      const availH = h - 24 - 28 - 10 - 40;
      const s = Math.max(0.5, Math.min(1.2, availW / 414, availH / 868));
      this.textFloor = 9;
      if (Math.abs(s - this.state.scale) > 0.005 || stacked !== this.state.stacked) { this.setState({ scale: s, stacked: stacked }); }
      this.fitText();
    };
    // Scale the guide column (0.72–1.15) so it always fits the window in one glance.
    this.fitText = () => {
      const box = document.getElementById('hisaab-guide');
      const inner = document.getElementById('hisaab-guide-in');
      if (!box || !inner) { return; }
      if ((window.innerWidth || 1280) < 1000) {
        if (this.state.textScale !== 1) { this.setState({ textScale: 1 }); }
        return;
      }
      const avail = box.clientHeight - 4;
      let s = 1;
      for (let k = 0; k < 6; k++) {
        inner.style.width = (100 / s) + '%';
        inner.style.transform = 'scale(' + s + ')';
        const need = inner.scrollHeight;
        const next = Math.max(0.72, Math.min(1.15, avail / need));
        if (Math.abs(next - s) < 0.004) { break; }
        s = next;
      }
      s = Math.min(s, this.textFloor);
      this.textFloor = s;
      inner.style.width = (100 / s) + '%';
      inner.style.transform = 'scale(' + s + ')';
      if (Math.abs(s - this.state.textScale) > 0.002) { this.setState({ textScale: s }); }
    };
  }

  componentDidMount() {
    this.fit();
    window.addEventListener('resize', this.fit);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(() => this.fitText()); }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.info !== this.state.info || prevState.stacked !== this.state.stacked) { this.fitText(); }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.fit);
  }

  guide(i) {
    const shree = i.bill === 'shree';
    const G = {
      home: {
        where: 'Home', title: 'Every job-work bill, at a glance', pains: [1],
        today: 'Bills pile up as WhatsApp photos and paper slips. The owner can’t tell which are right, so he pays them as billed.',
        hisaab: 'One card shows every bill waiting, what they add up to, and which job worker is on hold.',
        stake: '₹46,634.70 of job-work bills waiting to be checked.',
        next: !i.paidRamesh ? 'Tap “Check a bill”, then pick Ramesh Processors — a clean printed bill.' : (!i.paidShree ? 'Tap Shree Prints in the list — a handwritten bill with a problem in it.' : (!i.challanMade ? 'Tap “Send goods out” to send fabric to a job worker on a challan.' : 'Open the Inventory, Payouts and GST tabs in the bottom bar.'))
      },
      snap: {
        where: 'Check a bill · 1 of 4', title: 'Snap the job worker’s bill', pains: [1],
        today: 'Typing out a handwritten bill takes longer than just paying it — so nobody checks.',
        hisaab: 'Snap it. Hisaab reads printed and handwritten bills for you.',
        stake: '',
        next: !i.paidRamesh ? 'Pick Ramesh Processors (printed) first.' : 'Pick Shree Prints (handwritten).'
      },
      read: {
        where: 'Check a bill · 2 of 4', title: i.reading ? 'Reading the bill…' : 'Each line linked to the lot you sent', pains: [1],
        today: shree ? '“Lal georgette 450 mtr” could be any lot. Matching it means digging through the challan book.' : 'Matching each bill line to the lot you sent means flipping through the challan book.',
        hisaab: 'AI links every line to its lot. Anything unclear waits for your OK before the check runs.',
        stake: shree ? 'One unclear line — confirm P-205 to continue.' : '',
        next: shree && !i.confirmed ? 'Tap “Yes, P-205” to confirm the lot, then “Check this bill”.' : 'Tap “Check this bill”.'
      },
      verdict: {
        where: 'Check a bill · 3 of 4', title: shree ? 'One line needs a look' : 'All three lines match', pains: [1],
        today: 'Nobody compares the bill with what came back, so overbilling and excess fabric loss go unnoticed.',
        hisaab: shree ? 'Flags exactly which line is wrong, why, and what it costs — the rest stays payable.' : 'Every line checked against metres returned, the agreed rate and your 3% loss limit.',
        stake: shree ? 'P-205: ₹378 overbilled, and ₹780 of fabric lost beyond the limit.' : '₹26,815.36 ready to pay — with proof it’s right.',
        next: 'Tap “See how it adds up”.'
      },
      breakdown: {
        where: 'Check a bill · 3 of 4', title: shree ? 'Pay what’s right, hold the rest' : 'How the amount adds up', pains: shree ? [2] : [1],
        today: shree ? 'One wrong line stalls the whole bill — or the owner pays all of it to avoid a fight.' : 'GST and TDS get worked out by the accountant weeks later, after the money has gone.',
        hisaab: shree ? 'Pay the clean line now and hold only P-205. You choose — nothing is deducted automatically.' : 'Charges + GST − TDS, line by line, before you pay. Worked out by rules, never by AI.',
        stake: shree ? '₹10,951.20 paid today · ₹8,505.00 held, not lost.' : 'TDS of ₹257.84 deducted at source.',
        next: shree ? 'Keep “Hold this line”, then tap “Review payout · ₹10,951.20”.' : 'Tap “Review payout”.'
      },
      approve: {
        where: 'Check a bill · 4 of 4', title: 'Approve the payout', pains: shree ? [2] : [1],
        today: 'Job workers are paid from personal UPI, with no record of which bill or lots it was for.',
        hisaab: 'One OTP approval from the business account, tied to the bill and its lots.',
        stake: shree ? 'The held line stays open on Shree’s card until a revised bill arrives.' : '',
        next: 'Tap “Approve & pay”.'
      },
      done: {
        where: 'Paid', title: shree ? 'Clean line paid, held line raised politely' : 'Paid, with a statement for the job worker', pains: shree ? [2] : [1],
        today: 'Job workers dispute payments because they never see how the amount was worked out.',
        hisaab: shree ? 'The statement shows what was paid and what’s held, with a polite query in Hindi or English.' : 'An itemised statement goes to the job worker with every payout.',
        stake: shree ? 'The dispute is now an ₹8,505 conversation — not a stalled ₹19,561.50 bill.' : '',
        next: shree ? 'Switch the query to हिंदी, then “Back to home” and tap “Send goods out”.' : 'Tap “Check next bill” to see the Shree Prints exception.'
      },
      challan: i.challanDone ? {
        where: 'Send goods out', title: 'Challan created — e-way bill if needed', pains: [3],
        today: 'E-way bills are made separately on the GST portal, often at the last minute, by re-typing the challan.',
        hisaab: 'Says whether one is needed and fills it from the challan (GST API integration planned).',
        stake: 'Needed above ₹50,000, or for any inter-state movement to a job worker.',
        next: i.ewbStage === 'done' ? 'Tap “Done”, then open the Inventory tab.' : 'Tap “Create e-way bill from this challan”, then “Generate”.'
      } : {
        where: 'Send goods out', title: 'Send goods out on a challan', pains: [3],
        today: 'Goods leave on a paper challan. Later, nobody can say what a bill should be checked against.',
        hisaab: 'Send only what’s in stock. The challan becomes the record every bill is checked against.',
        stake: 'Goods not back within a year are treated as sold under GST.',
        next: 'Pick Rayon, white, tap “All” (₹82,500 — over ₹50,000), then “Create challan”.'
      },
      inventory: {
        where: 'Inventory', title: i.invView === 'raw' ? 'Raw material in your store' : (i.invView === 'finished' ? 'Finished goods, at real cost' : 'What each job worker has right now'), pains: [3],
        today: 'The owner can’t say what’s with which job worker or what’s overdue — he calls around.',
        hisaab: 'Raw, in-process and finished goods in one place, with every consignment’s due date.',
        stake: i.invView === 'finished' ? '303 dresses in stock, costed from checked bills.' : (i.invView === 'raw' ? 'Stock drops the moment goods go out on a challan.' : '3 consignments overdue right now.'),
        next: i.invView === 'finished' ? 'Tap “Navy rayon dresses” to see its batches.' : (i.invView === 'raw' ? 'Tap the “In process” tile.' : 'Tap Ramesh Processors to see his consignments.')
      },
      agency: {
        where: 'Inventory · job worker', title: 'Consignments with one job worker', pains: [3],
        today: 'Overdue goods are chased by phone, from memory, usually too late.',
        hisaab: 'Days out, expected return and an overdue flag for every consignment.',
        stake: 'Ramesh: CH-0136 is 4 days late.',
        next: 'Go back, tap the “Finished” tile, then a product.'
      },
      product: {
        where: 'Inventory · finished goods', title: 'Batches and cost per piece', pains: [3],
        today: 'Dresses are priced on a guess, because a batch’s real cost is spread across many bills.',
        hisaab: 'Cost per piece for every batch, built from the bills you checked and paid.',
        stake: 'B-24 cost ₹4.23 more per piece than B-21.',
        next: 'Tap B-24 to see where its cost came from.'
      },
      batch: {
        where: 'Inventory · batch', title: 'Where one batch’s cost came from', pains: [3],
        today: 'Process loss and job-work charges are invisible in the final price.',
        hisaab: 'See what each stage — fabric, dyeing, printing, stitching, pressing — added to the cost.',
        stake: 'B-24: 22 m of fabric lost (₹2,420) on the way to 198 dresses.',
        next: 'Open the Payouts tab in the bottom bar.'
      },
      payouts: {
        where: 'Payouts', title: 'Every payout in one place', pains: [2],
        today: 'Payments to job workers are scattered across UPI apps, with no link to bills, holds or TDS.',
        hisaab: 'Every payout, every held line and every TDS deduction in one list.',
        stake: 'Held amounts stay visible until the job worker sends a revised bill.',
        next: 'Open the GST tab.'
      },
      gst: {
        where: 'GST', title: 'Input credit, checked against vendor filings', pains: [3],
        today: 'A vendor files late or wrong, and the owner loses input credit — often finding out months later.',
        hisaab: 'Every purchase bill checked against what the vendor filed, every month.',
        stake: 'September: ₹8,867.70 of credit needs a vendor to file or fix.',
        next: 'In Sep, tap Kothari Fabrics — an unfiled bill — or Shree Prints for a mismatch.'
      },
      gstVendor: {
        where: 'GST · vendor', title: 'Reconcile one vendor', pains: [3],
        today: 'Finding which bill is missing or wrong on the GST portal takes hours with the accountant.',
        hisaab: 'See the exact bill and the gap, then remind the vendor to file or amend.',
        stake: 'Kothari Fabrics: ₹8,100 of credit waiting on one unfiled bill.',
        next: 'That’s the tour. Go Home and try it again in dark theme.'
      }
    };
    return G[i.screen] || G.home;
  }

  renderVals() {
    const i = this.state.info;
    const v = this.state.visited;
    const g = this.guide(i);
    const PAINS = [
      { n: 1, title: 'Bills paid without checking', text: 'Matching a bill to what came back takes too long, so owners pay as billed.' },
      { n: 2, title: 'One dispute stalls the payment', text: 'A wrong line means arguing over the whole bill — or paying it anyway.' },
      { n: 3, title: 'Goods, cost and GST credit slip', text: 'Nobody tracks what’s overdue, what a batch cost, or who didn’t file GST.' }
    ];
    const pains = PAINS.map((p) => {
      const on = g.pains.indexOf(p.n) >= 0;
      return Object.assign({}, p, { tag: on ? 'Solving now' : '',
        style: 'display: flex; flex-direction: column; gap: 4px; padding: 10px 11px; border-radius: 12px; background: #FFFFFF; border: ' + (on ? '2px solid #2F6BEB' : '1px solid #E2E5EA') + '; opacity: ' + (on ? 1 : 0.62) + '; box-sizing: border-box',
        numStyle: 'width: 22px; height: 22px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ' + (on ? '#FFFFFF' : '#4A5260') + '; background: ' + (on ? '#2F6BEB' : '#EEF1F5') });
    });
    const HOW = ['AI reads the bill', 'Rules do the maths', 'The owner decides', 'Razorpay pays'];
    const how = HOW.map((label, k) => ({ label: label, arrowStyle: k === HOW.length - 1 ? 'display: none' : 'color: #8A93A3' }));
    const items = [
      { label: 'Clean bill', done: i.paidRamesh },
      { label: 'Disputed bill', done: i.paidShree },
      { label: 'Send goods out', done: i.challanMade },
      { label: 'Inventory', done: !!v.inventory },
      { label: 'Payouts', done: !!v.payouts },
      { label: 'GST', done: !!v.gst }
    ];
    const tour = items.map((x) => ({ label: x.label, mark: x.done ? '✓' : '',
      style: 'display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 4px; border-radius: 999px; font-size: 12px; font-weight: 700; background: #FFFFFF; color: ' + (x.done ? '#15803D' : '#4A5260') + '; border: 1px solid ' + (x.done ? '#15803D' : '#E2E5EA'),
      dotStyle: 'flex: none; width: 18px; height: 18px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #FFFFFF; box-sizing: border-box; background: ' + (x.done ? '#15803D' : '#FFFFFF') + '; border: 2px solid ' + (x.done ? '#15803D' : '#C9CED6') }));
    const st = this.state.stacked;
    const ts = this.state.textScale;
    return {
      g: g, pains: pains, how: how, hasStake: !!g.stake,
      tour: tour, tourDone: items.filter((x) => x.done).length,
      scale: this.state.scale.toFixed(3),
      phoneW: Math.round(414 * this.state.scale) + 'px',
      phoneH: Math.round(868 * this.state.scale) + 'px',
      phonePos: st ? 'position: relative' : 'position: sticky; top: 12px',
      rightBox: st ? 'position: relative' : 'position: sticky; top: 12px; height: calc(100vh - 24px); overflow: hidden',
      rightInner: st ? 'width: 100%' : 'width: ' + (100 / ts) + '%; transform: scale(' + ts + '); transform-origin: top left',
      onScreen: this.onScreen
    };
  }

  render() {
    const v = this.renderVals();
    return html`<div style="background: #F5F6F8; color: #0F1115; font-family: 'Manrope', system-ui, sans-serif; font-size: 16px; line-height: 1.5; padding: 12px 24px; box-sizing: border-box">
<div style="max-width: 1440px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-start">

<div style="flex: 1.15 1 540px; min-width: 0; border-radius: 28px; background: #E7ECF7; padding: 12px 12px 16px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 10px; overflow: hidden; ${v.phonePos}">
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

<div id="hisaab-guide" style="flex: 1 1 440px; min-width: 0; box-sizing: border-box; ${v.rightBox}">
<div id="hisaab-guide-in" style="display: flex; flex-direction: column; gap: 14px; padding: 6px 2px 4px; box-sizing: border-box; ${v.rightInner}">

<div style="display: flex; flex-direction: column; gap: 6px">
<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #5F6775">Razorpay AI x PM Build Challenge · Track 1</div>
<h1 style="margin: 0; font-size: 32px; line-height: 1.05; font-weight: 800; letter-spacing: -0.03em">Hisaab</h1>
<p style="margin: 0; font-size: 15px; line-height: 1.45; color: #1F2430">Pay job workers for what actually came back. Snap the bill, check it against the goods returned, and pay the right amount in one approval.</p>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 2px">
${(v.how || []).map((hw, $index) => html`
<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #1F2430"><span style="padding: 3px 9px; border-radius: 999px; background: #FFFFFF; border: 1px solid #E2E5EA">${hw.label}</span><span style=${hw.arrowStyle}>→</span></span>
`)}
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap">
<span style="font-size: 12px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #4A5260">The problem</span>
<span style="font-size: 13px; color: #4A5260">Cloth goes out to dyers, printers and tailors, comes back short, and the bills arrive on WhatsApp.</span>
</div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
${(v.pains || []).map((pn, $index) => html`
<div style=${pn.style}>
<div style="display: flex; justify-content: space-between; align-items: center; gap: 6px">
<span style=${pn.numStyle}>${pn.n}</span>
<span style="font-size: 10px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: #2F6BEB">${pn.tag}</span>
</div>
<span style="font-weight: 800; font-size: 14px; line-height: 1.3">${pn.title}</span>
<span style="font-size: 12.5px; color: #4A5260; line-height: 1.4">${pn.text}</span>
</div>
`)}
</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E5EA; border-radius: 18px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 1px 2px rgba(15,17,21,0.04)">
<span style="font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #2F6BEB">You are here · ${v.g.where}</span>
<h2 style="margin: 0; font-size: 20px; line-height: 1.25; font-weight: 800; letter-spacing: -0.01em">${v.g.title}</h2>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
<div style="border-radius: 12px; background: #FDF1DE; padding: 11px 12px; display: flex; flex-direction: column; gap: 4px">
<span style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #8A4300">
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v6M12 16.5v.5"></path></svg>
Today</span>
<span style="font-size: 14px; color: #2B2117; line-height: 1.45">${v.g.today}</span>
</div>
<div style="border-radius: 12px; background: #E8F2FF; padding: 11px 12px; display: flex; flex-direction: column; gap: 4px">
<span style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #1D4ED8">
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"></path></svg>
With Hisaab</span>
<span style="font-size: 14px; color: #0F1F3D; line-height: 1.45">${v.g.hisaab}</span>
</div>
</div>
${(v.hasStake) ? html`
<div style="display: flex; flex-wrap: wrap; gap: 2px 10px; align-items: baseline; padding: 9px 12px; border-radius: 10px; border: 1px solid #E2E5EA; background: #F8F9FB">
<span style="font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #15803D">What's at stake</span>
<span style="font-size: 14px; font-weight: 700; color: #0F1115">${v.g.stake}</span>
</div>
` : null}
<div style="border-radius: 12px; background: #0E1A3A; color: #FFFFFF; padding: 12px 14px; display: flex; gap: 12px; align-items: center">
<span style="flex: none; width: 28px; height: 28px; border-radius: 999px; background: #2F6BEB; display: flex; align-items: center; justify-content: center">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
</span>
<span style="display: flex; flex-direction: column; gap: 1px">
<span style="font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #9CC0FF">Next step in the phone</span>
<span style="font-size: 15px; font-weight: 600; line-height: 1.4">${v.g.next}</span>
</span>
</div>
</div>

<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px">
<span style="font-size: 13px; font-weight: 800; margin-right: 4px">Tour · ${v.tourDone} of 6</span>
${(v.tour || []).map((tr, $index) => html`
<span style=${tr.style}><span style=${tr.dotStyle}>${tr.mark}</span>${tr.label}</span>
`)}
</div>

<div style="font-size: 11px; line-height: 1.45; color: #5F6775; border-top: 1px solid #E2E5EA; padding-top: 10px">Concept prototype with sample data; payouts, e-way bills and GST filings are simulated, and GST/TDS rates are illustrative. Not an official Razorpay product. Built by Yash Jhunjhunwala, ISB.</div>

</div>
</div>

</div>
</div>`;
  }
}
