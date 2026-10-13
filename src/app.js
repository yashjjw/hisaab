// Generated from the Hisaab design prototype. Preact + htm, no build step.
import { html, Component } from '../vendor/htm-preact.mjs';

export class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: 'home', bill: 'ramesh', reading: false, confirmed: false,
      choice: 'hold', paid: {}, filter: 'all', lang: 'en',
      payStatus: 'processing', nudge: false, challanDone: false, toast: '', last: null,
      invView: 'process', batchId: 'B-24', challanMade: false, agencyId: 'ramesh', productId: 'navy', batchFrom: 'inventory',
      stock: { rayon: 750, georgette: 200, b27: 430, cotton: 0 }, sent: [], cf: { agency: 'ramesh', item: 'rayon', qty: 250 }, lastCh: null
    };
  }

  componentDidMount() { this.report(); }

  componentDidUpdate(pp, ps) {
    const s = this.state;
    if (!ps || ps.screen !== s.screen || ps.bill !== s.bill || ps.confirmed !== s.confirmed || ps.reading !== s.reading ||
        ps.challanDone !== s.challanDone || ps.invView !== s.invView || ps.paid !== s.paid || ps.choice !== s.choice || ps.ewbStage !== s.ewbStage) {
      this.report();
    }
  }

  report() {
    const f = this.props.onScreen;
    if (typeof f !== 'function') { return; }
    const s = this.state;
    f({ screen: s.screen, bill: s.bill, confirmed: !!s.confirmed, reading: !!s.reading, challanDone: !!s.challanDone, invView: s.invView,
      paidRamesh: !!s.paid.ramesh, paidShree: !!s.paid.shree, challanMade: !!s.challanMade, choice: s.choice, ewbStage: s.ewbStage || 'none' });
  }

  bills() {
    return {
      ramesh: {
        id: 'ramesh', worker: 'Ramesh Processors', initials: 'RP', process: 'Dyeing', billNo: 'RP-118', date: '10 Oct 2026',
        kind: 'printed', rate: 22, limit: 3, fabric: 110, gst: 5, tds: 1, account: 'HDFC Bank ••4521', handwritten: false,
        lines: [
          { lot: 'L-101', desc: 'Rayon, navy', readText: 'L-101 Rayon navy 488 m', out: 500, back: 488, billed: 488, sentOn: '22 Sep' },
          { lot: 'L-104', desc: 'Rayon, maroon', readText: 'L-104 Rayon maroon 391 m', out: 400, back: 391, billed: 391, sentOn: '25 Sep' },
          { lot: 'L-109', desc: 'Cotton, black', readText: 'L-109 Cotton black 293 m', out: 300, back: 293, billed: 293, sentOn: '29 Sep' }
        ]
      },
      shree: {
        id: 'shree', worker: 'Shree Prints', initials: 'SP', process: 'Printing', billNo: 'SP-0947', date: '11 Oct 2026',
        kind: 'handwritten', rate: 18, limit: 3, fabric: 120, gst: 5, tds: 1, account: 'SBI ••7790', handwritten: true,
        lines: [
          { lot: 'P-201', desc: 'Georgette, floral', readText: 'Georgette floral 585 mtr', out: 600, back: 585, billed: 585, sentOn: '24 Sep' },
          { lot: 'P-205', desc: 'Georgette, red', readText: 'Lal georgette 450 mtr', out: 450, back: 430, billed: 450, sentOn: '30 Sep', unsure: true }
        ]
      }
    };
  }

  fmt(p) {
    return '₹' + (p / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  big(p) {
    const v = (p / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const i = v.lastIndexOf('.');
    return { w: v.slice(0, i), d: v.slice(i) };
  }

  compute(id, choice) {
    const b = this.bills()[id];
    const lines = b.lines.map((l) => {
      const chargesBilledP = l.billed * b.rate * 100;
      const gstBilledP = Math.round(chargesBilledP * b.gst / 100);
      const lossQty = l.out - l.back;
      const lossPct = lossQty / l.out * 100;
      const allowed = b.limit / 100 * l.out;
      const excess = Math.max(0, lossQty - allowed);
      const flags = [];
      if (l.billed > l.back) {
        const extra = (l.billed - l.back) * b.rate * 100;
        const extraG = Math.round(extra * b.gst / 100);
        flags.push({ title: 'Billed more than came back', text: 'Billed ' + l.billed + ' m, but ' + l.back + ' m came back.', impact: this.fmt(extra + extraG) + ' extra (' + this.fmt(extra) + ' + ' + this.fmt(extraG) + ' GST)' });
      }
      if (excess > 0) {
        flags.push({ title: 'Loss above the ' + b.limit + '% limit', text: lossQty + ' m lost (' + lossPct.toFixed(1) + '%). The limit allows ' + allowed + ' m.', impact: excess + ' m over the limit · ' + this.fmt(Math.round(excess * b.fabric * 100)) + ' of your fabric · not deducted unless you choose' });
      }
      const flagged = flags.length > 0;
      const ch = flagged ? choice : 'pay';
      const billable = ch === 'returned' ? l.back : l.billed;
      const onHold = flagged && ch === 'hold';
      const cP = billable * b.rate * 100;
      const gP = Math.round(cP * b.gst / 100);
      const tP = Math.round(cP * b.tds / 100);
      return Object.assign({}, l, {
        flags: flags, flagged: flagged, onHold: onHold, excess: excess, billable: billable,
        cP: cP, gP: gP, tP: tP, nP: cP + gP - tP,
        chargesBilledP: chargesBilledP, billedTotalP: chargesBilledP + gstBilledP,
        lossPctStr: lossPct.toFixed(1) + '%', lossOver: excess > 0
      });
    });
    const pay = lines.filter((l) => !l.onHold);
    const sum = (arr, k) => arr.reduce((a, x) => a + x[k], 0);
    return {
      b: b, lines: lines, pay: pay,
      payC: sum(pay, 'cP'), payG: sum(pay, 'gP'), payT: sum(pay, 'tP'), payN: sum(pay, 'nP'),
      holdP: sum(lines.filter((l) => l.onHold), 'billedTotalP'),
      billTotalP: sum(lines, 'billedTotalP'),
      flagged: lines.filter((l) => l.flagged)
    };
  }

  flash(msg) {
    this.setState({ toast: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setState({ toast: '' }), 2200);
  }

  pickBill(id) {
    this.setState({ bill: id, screen: 'read', reading: true, confirmed: false, choice: 'hold', lang: 'en' });
    clearTimeout(this._rt);
    this._rt = setTimeout(() => this.setState({ reading: false }), 1400);
  }

  payoutsData(s, t, pill, chip) {
    const fmt = (p) => this.fmt(p);
    const B = this.bills();
    const INI = { 'Ramesh Processors': 'RP', 'Shree Prints': 'SP', 'Noor Tailors': 'NT', 'Lakshmi Press': 'LP' };
    const hist = [
      { who: 'Lakshmi Press', bill: 'LP-044', lots: 'I-12', date: '9 Oct', month: 'oct', netP: 123552, tdsP: 1188, status: 'Paid' },
      { who: 'Noor Tailors', bill: 'NT-219', lots: 'S-31', date: '6 Oct', month: 'oct', netP: 931320, tdsP: 8955, status: 'Paid' },
      { who: 'Shree Prints', bill: 'SP-0921', lots: 'P-188', date: '28 Sep', month: 'sep', netP: 894816, tdsP: 8604, status: 'Paid' },
      { who: 'Ramesh Processors', bill: 'RP-109', lots: 'L-087', date: '22 Sep', month: 'sep', netP: 1116544, tdsP: 10736, status: 'Paid' },
      { who: 'Noor Tailors', bill: 'NT-212', lots: 'S-24', date: '20 Sep', month: 'sep', netP: 702000, tdsP: 6750, status: 'Paid' },
      { who: 'Lakshmi Press', bill: 'LP-039', lots: 'I-08', date: '20 Sep', month: 'sep', netP: 93600, tdsP: 900, status: 'Paid' }
    ];
    const live = [];
    ['shree', 'ramesh'].forEach((id) => {
      const p = s.paid[id];
      if (!p) { return; }
      const cc = this.compute(id, p.choice || 'hold');
      const processing = s.screen === 'done' && s.bill === id && s.payStatus !== 'paid';
      live.push({ who: B[id].worker, bill: B[id].billNo, lots: cc.lines.filter((l) => !l.onHold).map((l) => l.lot).join(', '), date: '13 Oct', month: 'oct',
        netP: p.payP, tdsP: p.tdsP || 0, status: processing ? 'Processing' : 'Paid', tag: 'Checked with Hisaab' });
      if (p.holdP > 0) {
        live.push({ who: B[id].worker, bill: B[id].billNo, lots: cc.lines.filter((l) => l.onHold).map((l) => l.lot).join(', '), date: 'held 13 Oct', month: 'oct',
          netP: p.holdP, tdsP: 0, status: 'On hold', tag: 'Waiting for a revised bill' });
      }
    });
    const all = live.concat(hist);
    const f = s.payFilter || 'all';
    const rows = all.filter((r) => f === 'all' || (f === 'paid' && r.status !== 'On hold') || (f === 'hold' && r.status === 'On hold')).map((r) => ({
      who: r.who, initials: INI[r.who], sub: 'Bill ' + r.bill + ' · ' + r.lots + ' · ' + r.date, amount: fmt(r.netP), status: r.status,
      tag: r.tag || ('TDS ' + fmt(r.tdsP) + ' deducted'), tagColor: r.status === 'On hold' ? t.warnFg : (r.tag ? t.infoFg : t.ink3),
      pillStyle: r.status === 'On hold' ? pill(t.warnFg, t.warnBg) : (r.status === 'Processing' ? pill(t.infoFg, t.infoBg) : pill(t.okFg, t.okBg)),
      open: () => this.flash(r.status === 'On hold' ? 'Held until ' + r.who + ' sends a revised bill' : 'Payout advice for ' + r.bill + ' ready to share')
    }));
    const oct = all.filter((r) => r.month === 'oct');
    const paidP = oct.filter((r) => r.status !== 'On hold').reduce((a, r) => a + r.netP, 0);
    const holdP = all.filter((r) => r.status === 'On hold').reduce((a, r) => a + r.netP, 0);
    const tdsP = oct.reduce((a, r) => a + r.tdsP, 0);
    const filters = [['all', 'All'], ['paid', 'Paid'], ['hold', 'On hold']].map((x) => ({ label: x[1], checked: f === x[0] ? 'true' : 'false',
      pick: () => this.setState({ payFilter: x[0] }), style: chip(f === x[0]) }));
    return { payRows: rows, payFilters: filters, payEmpty: rows.length === 0,
      paySum: { paid: fmt(paidP), hold: fmt(holdP), tds: fmt(tdsP), holdColor: holdP > 0 ? t.warnFg : t.ink } };
  }

  gstData(s, t, pill, chip) {
    const fmt = (p) => this.fmt(p);
    const V = { shah: ['Shah Textile Mills', 'ST', 'Fabric'], kothari: ['Kothari Fabrics', 'KF', 'Fabric'], vardhman: ['Vardhman Packaging', 'VP', 'Packaging'],
      ramesh: ['Ramesh Processors', 'RP', 'Dyeing'], shree: ['Shree Prints', 'SP', 'Printing'], noor: ['Noor Tailors', 'NT', 'Stitching'], lakshmi: ['Lakshmi Press', 'LP', 'Ironing'] };
    const all = [
      { v: 'shah', no: 'STM-882', date: '12 Sep', period: 'sep', taxP: 24000000, gstP: 1200000, filedP: 1200000, filedTaxP: 24000000 },
      { v: 'shah', no: 'STM-901', date: '28 Sep', period: 'sep', taxP: 18550000, gstP: 927500, filedP: 927500, filedTaxP: 18550000 },
      { v: 'kothari', no: 'KF-3310', date: '21 Sep', period: 'sep', taxP: 16200000, gstP: 810000, filedP: null },
      { v: 'vardhman', no: 'VP-1147', date: '15 Sep', period: 'sep', taxP: 3840000, gstP: 691200, filedP: 691200, filedTaxP: 3840000 },
      { v: 'shah', no: 'STM-917', date: '3 Oct', period: 'oct', taxP: 21000000, gstP: 1050000, filedP: null },
      { v: 'vardhman', no: 'VP-1162', date: '7 Oct', period: 'oct', taxP: 2160000, gstP: 388800, filedP: null },
      { v: 'ramesh', no: 'RP-109', date: '20 Sep', period: 'sep', taxP: 1073600, gstP: 53680, filedP: 53680, filedTaxP: 1073600 },
      { v: 'shree', no: 'SP-0921', date: '26 Sep', period: 'sep', taxP: 860400, gstP: 43020, filedP: 40320, filedTaxP: 806400 },
      { v: 'noor', no: 'NT-212', date: '18 Sep', period: 'sep', taxP: 675000, gstP: 33750, filedP: null },
      { v: 'lakshmi', no: 'LP-039', date: '19 Sep', period: 'sep', taxP: 90000, gstP: 4500, filedP: 4500, filedTaxP: 90000 },
      { v: 'noor', no: 'NT-219', date: '5 Oct', period: 'oct', taxP: 895500, gstP: 44775, filedP: null },
      { v: 'lakshmi', no: 'LP-044', date: '8 Oct', period: 'oct', taxP: 118800, gstP: 5940, filedP: null },
      { v: 'ramesh', no: 'RP-118', date: '10 Oct', period: 'oct', taxP: 2578400, gstP: 128920, filedP: null },
      { v: 'shree', no: 'SP-0947', date: '11 Oct', period: 'oct', taxP: 1863000, gstP: 93150, filedP: null, note: ' Line P-205 is disputed: if Shree revises the bill, the filed amount must match the revised bill.' }
    ];
    const per = s.gstPeriod || 'sep';
    const due = per === 'sep' ? '11 Oct' : '11 Nov';
    const bills = all.filter((b) => b.period === per).map((b) => {
      let status, kind, explain, actLabel = '', act = null;
      if (b.filedP === null && per === 'sep') { status = 'Not filed'; kind = 'bad'; explain = 'Was due by ' + due + '. Your credit of ' + fmt(b.gstP) + ' is at risk until they file.'; actLabel = 'Remind to file'; act = () => this.flash('Reminder ready to send to ' + V[b.v][0]); }
      else if (b.filedP === null) { status = 'Not due yet'; kind = 'wait'; explain = 'Vendor files this month\'s bills by ' + due + '.' + (b.note || ''); }
      else if (b.filedP !== b.gstP) { status = 'Differs'; kind = 'bad'; explain = 'Vendor filed ' + fmt(b.filedP) + ' GST on ' + fmt(b.filedTaxP) + '. Your bill says ' + fmt(b.gstP) + ' on ' + fmt(b.taxP) + ' — looks like the digits were swapped.'; actLabel = 'Ask to amend'; act = () => this.flash('Request to amend ' + b.no + ' ready to send to ' + V[b.v][0]); }
      else { status = 'Matched'; kind = 'ok'; explain = 'Filed by the vendor and the amounts match.'; }
      return Object.assign({}, b, { status: status, kind: kind, explain: explain, hasAction: !!act, actLabel: actLabel, act: act || (() => {}),
        taxStr: fmt(b.taxP), gstStr: fmt(b.gstP), filedStr: b.filedP === null ? '—' : fmt(b.filedP),
        filedColor: kind === 'bad' ? t.warnFg : t.ink, borderColor: kind === 'bad' ? t.warnFg : t.border,
        pillStyle: kind === 'ok' ? pill(t.okFg, t.okBg) : (kind === 'bad' ? pill(t.warnFg, t.warnBg) : pill(t.ink2, t.surface2)) });
    });
    const sum = (arr) => arr.reduce((a, b) => a + b.gstP, 0);
    const totalP = sum(bills);
    const matched = sum(bills.filter((b) => b.status === 'Matched'));
    const differs = sum(bills.filter((b) => b.status === 'Differs'));
    const notFiled = sum(bills.filter((b) => b.status === 'Not filed'));
    const notDue = sum(bills.filter((b) => b.status === 'Not due yet'));
    const dot = (c) => 'flex: none; width: 10px; height: 10px; border-radius: 3px; background: ' + c;
    const heroRows = per === 'sep' ? [
      { label: 'Matched', amount: fmt(matched), color: t.okFg, dotStyle: dot(t.okFg) },
      { label: 'Differs', amount: fmt(differs), color: t.warnFg, dotStyle: dot(t.warnFg) },
      { label: 'Not filed', amount: fmt(notFiled), color: t.warnFg, dotStyle: dot(t.warnFg) }
    ] : [
      { label: 'Not due yet · vendors file by 11 Nov', amount: fmt(notDue), color: t.ink, dotStyle: dot(t.ink3) }
    ];
    const atRisk = differs + notFiled;
    const vendors = ['shah', 'kothari', 'vardhman', 'ramesh', 'shree', 'noor', 'lakshmi'].map((v) => {
      const vb = bills.filter((b) => b.v === v);
      if (!vb.length) { return null; }
      const bad = vb.filter((b) => b.kind === 'bad');
      const nf = vb.filter((b) => b.status === 'Not filed').length;
      const df = vb.filter((b) => b.status === 'Differs').length;
      let p = 'All filed', ps = pill(t.okFg, t.okBg);
      if (nf) { p = 'Not filed'; ps = pill(t.warnFg, t.warnBg); }
      else if (df) { p = 'Differs'; ps = pill(t.warnFg, t.warnBg); }
      else if (vb.every((b) => b.kind === 'wait')) { p = 'Not due yet'; ps = pill(t.ink2, t.surface2); }
      return { id: v, name: V[v][0], initials: V[v][1], pill: p, pillStyle: ps,
        sub: V[v][2] + ' · ' + vb.length + (vb.length === 1 ? ' bill · ' : ' bills · ') + fmt(sum(vb)) + ' GST',
        bills: vb, totalStr: fmt(sum(vb)), matchedStr: fmt(sum(vb.filter((b) => b.kind === 'ok'))), fixStr: fmt(sum(bad)), fixColor: bad.length ? t.warnFg : t.ink,
        open: () => this.setState({ screen: 'gstVendor', gstVendor: v }) };
    }).filter(Boolean);
    const periods = [['sep', 'Sep 2026'], ['oct', 'Oct 2026']].map((x) => ({ label: x[1], checked: per === x[0] ? 'true' : 'false',
      pick: () => this.setState({ gstPeriod: x[0] }), style: chip(per === x[0]) }));
    return {
      gstPeriods: periods, gstVendors: vendors,
      gstHero: { label: 'Input GST · ' + (per === 'sep' ? 'Sep 2026' : 'Oct 2026, so far'), big: this.big(totalP), rows: heroRows,
        context: per === 'sep' ? (atRisk ? fmt(atRisk) + ' of credit needs a vendor to file or fix. Filing was due by 11 Oct.' : 'Every bill is filed and matches.') : 'Vendors file October bills by 11 Nov, so nothing is overdue yet.' },
      selGst: vendors.filter((x) => x.id === s.gstVendor)[0] || vendors[0],
      gstPeriodLabel: per === 'sep' ? 'Sep 2026' : 'Oct 2026'
    };
  }

  inventory(s, t, pill, accent) {
    const fmt = (p) => this.fmt(p);
    const whole = (p) => '₹' + Math.round(p / 100).toLocaleString('en-IN');
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const toDay = (iso) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) / 864e5;
    const TODAY = toDay('2026-10-13');
    const dstr = (day) => { const d = new Date(day * 864e5); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; };
    const dstrY = (day) => dstr(day) + ' ' + new Date(day * 864e5).getUTCFullYear();
    const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

    const sp = s.paid.shree;
    let printP = 430 * 18 * 100, printStatus = 'Bill to check', printNote = 'Expected for 430 m · bill not checked yet';
    if (sp) {
      if (sp.choice === 'billed') { printP = 450 * 18 * 100; printStatus = 'Paid'; printNote = 'Paid as billed (450 m)'; }
      else if (sp.choice === 'returned') { printStatus = 'Paid'; printNote = 'Paid for the 430 m that came back'; }
      else { printStatus = 'On hold'; printNote = 'Expected for 430 m · line on hold'; }
    }
    const cols = { raw: '#5B8DEF', dye: '#F59E0B', print: '#A78BFA', stitch: '#34D399', iron: '#F472B6' };
    const stStyle = (st) => st === 'Paid' ? pill(t.okFg, t.okBg) : (st === 'On hold' ? pill(t.warnFg, t.warnBg) : (st === 'Not started' ? pill(t.ink3, t.surface2) : pill(t.infoFg, t.infoBg)));

    const defs = [
      { id: 'B-24', name: 'Navy rayon dresses', done: true, made: 198, stock: 198, received: '2026-10-08',
        lostNote: '22 m of fabric lost in dyeing and printing (₹2,420 at cost) · 1 piece rejected at packing.',
        stages: [
          { key: 'raw', label: 'Raw fabric', who: 'Bought from mill', lot: 'PO-311', flow: '500 m rayon × ₹110/m', loss: '', costP: 5500000, status: 'Paid' },
          { key: 'dye', label: 'Dyeing', who: 'Ramesh Processors', lot: 'L-087', flow: '500 m out → 488 m back', loss: 'Loss 12 m (2.4%)', costP: 488 * 22 * 100, status: 'Paid' },
          { key: 'print', label: 'Printing', who: 'Shree Prints', lot: 'P-188', flow: '488 m out → 478 m back', loss: 'Loss 10 m (2.0%)', costP: 478 * 18 * 100, status: 'Paid' },
          { key: 'stitch', label: 'Stitching', who: 'Noor Tailors', lot: 'S-31', flow: '478 m out → 199 pcs back', loss: '2.4 m per piece', costP: 199 * 45 * 100, status: 'Paid' },
          { key: 'iron', label: 'Ironing & packing', who: 'Lakshmi Press', lot: 'I-12', flow: '199 pcs out → 198 pcs back', loss: '1 piece rejected', costP: 198 * 6 * 100, status: 'Paid' }
        ] },
      { id: 'B-21', name: 'Navy rayon dresses', done: true, made: 150, stock: 70, received: '2026-09-19',
        lostNote: '18 m of fabric lost in dyeing and printing (₹1,944 at cost).',
        stages: [
          { key: 'raw', label: 'Raw fabric', who: 'Bought from mill', lot: 'PO-298', flow: '380 m rayon × ₹108/m', loss: '', costP: 4104000, status: 'Paid' },
          { key: 'dye', label: 'Dyeing', who: 'Ramesh Processors', lot: 'L-071', flow: '380 m out → 371 m back', loss: 'Loss 9 m (2.4%)', costP: 371 * 22 * 100, status: 'Paid' },
          { key: 'print', label: 'Printing', who: 'Shree Prints', lot: 'P-160', flow: '371 m out → 362 m back', loss: 'Loss 9 m (2.4%)', costP: 362 * 18 * 100, status: 'Paid' },
          { key: 'stitch', label: 'Stitching', who: 'Noor Tailors', lot: 'S-24', flow: '362 m out → 150 pcs back', loss: '2.4 m per piece', costP: 150 * 45 * 100, status: 'Paid' },
          { key: 'iron', label: 'Ironing & packing', who: 'Lakshmi Press', lot: 'I-08', flow: '150 pcs out → 150 pcs back', loss: '', costP: 150 * 6 * 100, status: 'Paid' }
        ] },
      { id: 'B-19', name: 'Maroon rayon dresses', done: true, made: 120, stock: 35, received: '2026-09-02',
        lostNote: '8 m of fabric lost in dyeing (₹864 at cost) · 1 piece rejected at packing.',
        stages: [
          { key: 'raw', label: 'Raw fabric', who: 'Bought from mill', lot: 'PO-287', flow: '300 m rayon × ₹108/m', loss: '', costP: 3240000, status: 'Paid' },
          { key: 'dye', label: 'Dyeing', who: 'Ramesh Processors', lot: 'L-062', flow: '300 m out → 292 m back', loss: 'Loss 8 m (2.7%)', costP: 292 * 22 * 100, status: 'Paid' },
          { key: 'stitch', label: 'Stitching', who: 'Noor Tailors', lot: 'S-20', flow: '292 m out → 121 pcs back', loss: '2.4 m per piece', costP: 121 * 45 * 100, status: 'Paid' },
          { key: 'iron', label: 'Ironing & packing', who: 'Lakshmi Press', lot: 'I-05', flow: '121 pcs out → 120 pcs back', loss: '1 piece rejected', costP: 120 * 6 * 100, status: 'Paid' }
        ] },
      { id: 'B-27', name: 'Red georgette dresses', done: false, made: 430,
        lostNote: '20 m lost in printing — 6.5 m over the 3% limit (₹780 of fabric at ₹120/m).',
        stages: [
          { key: 'raw', label: 'Raw fabric', who: 'Bought from mill', lot: 'PO-318', flow: '450 m georgette × ₹120/m', loss: '', costP: 5400000, status: 'Paid' },
          { key: 'print', label: 'Printing', who: 'Shree Prints', lot: 'P-205', flow: '450 m out → 430 m back', loss: 'Loss 20 m (4.4%), over the 3% limit', note: printNote, warn: true, costP: printP, status: printStatus },
          { key: 'stitch', label: 'Stitching', who: 'Noor Tailors', lot: 'next step', flow: 'Not sent yet', loss: '', costP: 0, status: 'Not started' },
          { key: 'iron', label: 'Ironing & packing', who: 'Lakshmi Press', lot: 'after stitching', flow: 'Not sent yet', loss: '', costP: 0, status: 'Not started' }
        ] }
    ];
    const RATES = { rayon: 110, georgette: 120, cotton: 95 };
    const PROC = { ramesh: { key: 'dye', label: 'Dyeing' }, shree: { key: 'print', label: 'Printing' }, noor: { key: 'stitch', label: 'Stitching' }, lakshmi: { key: 'iron', label: 'Ironing & packing' } };
    const AG = { ramesh: 'Ramesh Processors', shree: 'Shree Prints', noor: 'Noor Tailors', lakshmi: 'Lakshmi Press' };
    s.sent.forEach((c) => {
      if (c.itemKey === 'b27') {
        const d27 = defs.filter((d) => d.id === 'B-27')[0];
        const hit = d27.stages.filter((x) => x.key === PROC[c.agency].key)[0];
        const upd = { who: AG[c.agency], lot: c.lot + ' · ' + c.ch, flow: c.qty + ' m out · sent 13 Oct', status: 'In progress', note: 'Charges arrive with the job worker\'s bill' };
        if (hit) { Object.assign(hit, upd); }
        else { d27.stages.push(Object.assign({ key: PROC[c.agency].key, label: PROC[c.agency].label, loss: '', costP: 0 }, upd)); }
        return;
      }
      defs.push({ id: c.batch, name: c.itemLabel + ' · new batch', done: false, made: c.qty,
        lostNote: 'Nothing back yet. 365 days to bring the goods back under challan ' + c.ch + '.',
        stages: [
          { key: 'raw', label: 'Raw fabric', who: 'From your store', lot: c.ch, flow: c.qty + ' m × ₹' + RATES[c.itemKey] + '/m', loss: '', costP: c.qty * RATES[c.itemKey] * 100, status: 'Paid' },
          { key: PROC[c.agency].key, label: PROC[c.agency].label, who: AG[c.agency], lot: c.lot + ' · ' + c.ch, flow: c.qty + ' m out · sent 13 Oct', loss: '', note: 'Charges arrive with the job worker\'s bill', costP: 0, status: 'In progress' }
        ] });
    });

    const batches = defs.map((d) => {
      const totalP = d.stages.reduce((a, x) => a + x.costP, 0);
      const perP = Math.round(totalP / d.made);
      const bar = d.stages.filter((x) => x.costP > 0).map((x) => {
        const pct = x.costP / totalP * 100;
        return { label: x.label, pct: pct.toFixed(1) + '%', style: 'height: 12px; flex: ' + pct.toFixed(3) + ' 1 0; background: ' + cols[x.key],
          dotStyle: 'flex: none; width: 10px; height: 10px; border-radius: 3px; background: ' + cols[x.key] };
      });
      const stages = d.stages.map((x) => {
        const extra = [x.loss, x.note].filter(Boolean).join(' · ');
        return Object.assign({}, x, { costStr: x.costP > 0 ? fmt(x.costP) : '—', pillStyle: stStyle(x.status),
          dotStyle: 'flex: none; width: 10px; height: 10px; border-radius: 3px; background: ' + (x.costP > 0 ? cols[x.key] : t.surface2),
          hasExtra: !!extra, extra: extra, extraColor: x.warn ? t.warnFg : t.ink3 });
      });
      return Object.assign({}, d, {
        totalP: totalP, perP: perP, bar: bar, stages: stages,
        status: d.done ? 'Finished' : 'In process',
        pillStyle: d.done ? pill(t.okFg, t.okBg) : pill(t.infoFg, t.infoBg),
        heroLabel: d.done ? 'Cost per piece' : 'Cost so far',
        heroBig: this.big(d.done ? perP : totalP),
        heroSub: d.done ? 'Batch cost ' + fmt(totalP) + ' · ' + d.made + ' pcs · received ' + dstrY(toDay(d.received)) : fmt(perP) + ' per metre so far · ' + d.made + ' m',
        barLabel: 'Cost split: ' + bar.map((b) => b.label + ' ' + b.pct).join(', '),
        receivedStr: d.received ? dstrY(toDay(d.received)) : '',
        perStr: fmt(perP), totalStr: fmt(totalP),
        openFromProduct: () => this.setState({ screen: 'batch', batchId: d.id, batchFrom: 'product' }),
        openFromInv: () => this.setState({ screen: 'batch', batchId: d.id, batchFrom: 'inventory' })
      });
    });
    const byId = (id) => batches.filter((b) => b.id === id)[0];

    const agencyDefs = [
      { id: 'ramesh', name: 'Ramesh Processors', initials: 'RP', process: 'Dyeing', tat: 7,
        out: [
          { ch: 'CH-0136', lot: 'L-110', item: 'Rayon, white', qty: '300 m', sent: '2026-10-02' },
          { ch: 'CH-0139', lot: 'L-111', item: 'Cotton, white', qty: '200 m', sent: '2026-10-08' }
        ],
        returned: [
          { lot: 'L-109', item: 'Cotton, black', outStr: '300 m', backStr: '293 m', sent: '2026-09-29', backOn: '2026-10-05' },
          { lot: 'L-104', item: 'Rayon, maroon', outStr: '400 m', backStr: '391 m', sent: '2026-09-25', backOn: '2026-10-02' },
          { lot: 'L-101', item: 'Rayon, navy', outStr: '500 m', backStr: '488 m', sent: '2026-09-22', backOn: '2026-09-30' }
        ] },
      { id: 'shree', name: 'Shree Prints', initials: 'SP', process: 'Printing', tat: 10,
        out: [ { ch: 'CH-0137', lot: 'P-207', item: 'Georgette, white', qty: '300 m', sent: '2026-09-30' } ],
        returned: [
          { lot: 'P-205', item: 'Georgette, red · B-27', outStr: '450 m', backStr: '430 m', sent: '2026-09-30', backOn: '2026-10-09' },
          { lot: 'P-201', item: 'Georgette, floral', outStr: '600 m', backStr: '585 m', sent: '2026-09-24', backOn: '2026-10-03' }
        ] },
      { id: 'noor', name: 'Noor Tailors', initials: 'NT', process: 'Stitching', tat: 12,
        out: [ { ch: 'CH-0140', lot: 'S-34', item: 'Floral georgette → dresses', qty: '585 m', sent: '2026-10-06' } ],
        returned: [ { lot: 'S-31', item: 'Navy rayon → B-24', outStr: '478 m', backStr: '199 pcs', sent: '2026-09-23', backOn: '2026-10-05' } ] },
      { id: 'lakshmi', name: 'Lakshmi Press', initials: 'LP', process: 'Ironing & packing', tat: 3,
        out: [ { ch: 'CH-0141', lot: 'I-15', item: 'Maroon rayon dresses · B-25', qty: '162 pcs', sent: '2026-10-09' } ],
        returned: [ { lot: 'I-12', item: 'Navy rayon dresses · B-24', outStr: '199 pcs', backStr: '198 pcs', sent: '2026-10-05', backOn: '2026-10-08' } ] }
    ];
    agencyDefs.forEach((a) => {
      s.sent.filter((c) => c.agency === a.id).forEach((c) => {
        a.out.push({ ch: c.ch, lot: c.lot, item: c.itemLabel + (c.batch ? ' · batch ' + c.batch : ''), qty: c.qty + ' m', sent: '2026-10-13' });
      });
    });
    const agencyRows = agencyDefs.map((a) => {
      const outList = a.out.filter(Boolean).map((o) => {
        const sentD = toDay(o.sent), expD = sentD + a.tat, daysOut = TODAY - sentD, late = TODAY - expD;
        let status, note, style, noteColor;
        if (late > 0) { status = 'Overdue'; note = plural(late, 'day') + ' late · expected back ' + dstr(expD); style = pill(t.warnFg, t.warnBg); noteColor = t.warnFg; }
        else if (expD - TODAY <= 2) { status = 'Due soon'; note = 'Expected back ' + dstr(expD) + (expD === TODAY ? ' (today)' : ' · in ' + plural(expD - TODAY, 'day')); style = pill(t.infoFg, t.infoBg); noteColor = t.infoFg; }
        else { status = 'On time'; note = 'Expected back ' + dstr(expD) + ' · in ' + plural(expD - TODAY, 'day'); style = pill(t.okFg, t.okBg); noteColor = t.okFg; }
        return Object.assign({}, o, { sentStr: dstr(sentD), daysOutStr: daysOut === 0 ? 'Sent today' : plural(daysOut, 'day'),
          status: status, note: note, pillStyle: style, noteColor: noteColor, overdue: late > 0, borderColor: late > 0 ? t.warnFg : t.border,
          remind: () => this.flash('Reminder ready to send to ' + a.name + ' for ' + o.ch) });
      });
      const retList = a.returned.map((r) => {
        const sentD = toDay(r.sent), expD = sentD + a.tat, backD = toDay(r.backOn), diff = backD - expD;
        return Object.assign({}, r, { datesStr: 'Sent ' + dstr(sentD) + ' · expected ' + dstr(expD) + ' · back ' + dstr(backD),
          result: diff > 0 ? plural(diff, 'day') + ' late' : (diff < 0 ? plural(-diff, 'day') + ' early' : 'On time'),
          resultColor: diff > 0 ? t.warnFg : t.okFg, onTime: diff <= 0 });
      });
      const overdueN = outList.filter((o) => o.overdue).length;
      const onTimeN = retList.filter((r) => r.onTime).length;
      return Object.assign({}, a, { outList: outList, retList: retList, outN: outList.length, overdueN: overdueN,
        overdueColor: overdueN ? t.warnFg : t.ink, onTimeStr: onTimeN + ' of ' + retList.length,
        summary: plural(outList.length, 'consignment') + ' with them' + (overdueN ? ' · ' + overdueN + ' overdue' : ''),
        pillText: overdueN ? overdueN + ' overdue' : 'On time', pillStyle: overdueN ? pill(t.warnFg, t.warnBg) : pill(t.okFg, t.okBg),
        noOut: outList.length === 0,
        open: () => this.setState({ screen: 'agency', agencyId: a.id }) });
    });
    const outTotal = agencyRows.reduce((x, a) => x + a.outN, 0);
    const overdueTotal = agencyRows.reduce((x, a) => x + a.overdueN, 0);

    const prodDefs = [ { id: 'navy', name: 'Navy rayon dresses', ids: ['B-24', 'B-21'] }, { id: 'maroon', name: 'Maroon rayon dresses', ids: ['B-19'] } ];
    const products = prodDefs.map((p) => {
      const bs = p.ids.map(byId);
      const stock = bs.reduce((x, b) => x + b.stock, 0);
      const valueP = bs.reduce((x, b) => x + b.perP * b.stock, 0);
      const avgP = Math.round(valueP / stock);
      const cards = bs.map((b, i) => {
        const prev = bs[i + 1];
        let delta = '', deltaColor = t.ink3;
        if (prev) {
          const dd = b.perP - prev.perP;
          delta = (dd >= 0 ? '+' : '−') + fmt(Math.abs(dd)) + ' per piece vs ' + prev.id;
          deltaColor = dd > 0 ? t.warnFg : t.okFg;
        }
        return Object.assign({}, b, { delta: delta, deltaColor: deltaColor, open: b.openFromProduct });
      });
      return { id: p.id, name: p.name, stock: stock, cards: cards, valueP: valueP,
        stockStr: stock + ' pcs', valueStr: whole(valueP) + ' at cost', avgStr: fmt(avgP),
        sub: plural(bs.length, 'batch').replace('batchs', 'batches') + ' · average ' + fmt(avgP) + ' per piece',
        open: () => this.setState({ screen: 'product', productId: p.id }) };
    });
    const finStock = products.reduce((x, p) => x + p.stock, 0);
    const finValue = products.reduce((x, p) => x + p.valueP, 0);

    const stk = s.stock;
    const rawP = stk.rayon * 11000 + stk.georgette * 12000 + stk.cotton * 9500;
    const rawRows = [
      { name: 'Rayon, white', sub: '₹110/m · last bought 28 Sep', qty: stk.rayon + ' m', value: stk.rayon ? whole(stk.rayon * 11000) : 'Out of stock' },
      { name: 'Georgette, white', sub: '₹120/m · last bought 21 Sep', qty: stk.georgette + ' m', value: stk.georgette ? whole(stk.georgette * 12000) : 'Out of stock' },
      { name: 'Cotton, white', sub: '₹95/m · all 200 m sent to Ramesh on 8 Oct', qty: stk.cotton + ' m', value: stk.cotton ? whole(stk.cotton * 9500) : 'Out of stock' }
    ];
    const b27 = byId('B-27');
    const betweenRows = stk.b27 > 0 ? [ { name: 'B-27 · Red georgette', sub: 'Printed · waiting to go for stitching', qty: stk.b27 + ' m', value: whole(Math.round(b27.totalP * stk.b27 / 430)) + ' so far', open: b27.openFromInv } ] : [];

    const tileDefs = [
      { key: 'raw', label: 'Raw', value: whole(rawP), sub: 'in your store', subColor: t.ink3 },
      { key: 'process', label: 'In process', value: outTotal + ' out', sub: overdueTotal + ' overdue', subColor: overdueTotal ? t.warnFg : t.ink3 },
      { key: 'finished', label: 'Finished', value: finStock + ' pcs', sub: whole(finValue) + ' at cost', subColor: t.ink3 }
    ];
    const invTiles = tileDefs.map((d) => {
      const on = s.invView === d.key;
      return Object.assign({}, d, { checked: on ? 'true' : 'false', pick: () => this.setState({ invView: d.key }),
        style: 'text-align: left; min-height: 84px; border-radius: 14px; padding: 12px 10px; display: flex; flex-direction: column; gap: 4px; color: ' + t.ink +
          '; background: ' + (on ? t.surface2 : t.surface) + '; border: 1px solid ' + (on ? accent : t.border) + '; box-shadow: ' + (on ? 'inset 0 0 0 1px ' + accent : 'none') });
    });

    return {
      invTiles: invTiles, rawRows: rawRows, agencyRows: agencyRows, betweenRows: betweenRows, products: products,
      rawHeader: 'Raw material in your store · ' + whole(rawP),
      processHeader: plural(agencyRows.length, 'job worker') + ' · ' + plural(outTotal, 'consignment') + ' out · ' + overdueTotal + ' overdue',
      finishedHeader: products.length + ' products · ' + finStock + ' pieces in stock',
      sel: byId(s.batchId) || batches[0],
      selAgency: agencyRows.filter((a) => a.id === s.agencyId)[0] || agencyRows[0],
      selProduct: products.filter((p) => p.id === s.productId)[0] || products[0],
      b27PerP: b27.perP
    };
  }

  inventoryOld(s, t, pill, accent) {
    const fmt = (p) => this.fmt(p);
    const whole = (p) => '₹' + Math.round(p / 100).toLocaleString('en-IN');
    const sp = s.paid.shree;
    let printP = 430 * 18 * 100, printStatus = 'Bill to check', printNote = 'Expected for 430 m · bill not checked yet';
    if (sp) {
      if (sp.choice === 'billed') { printP = 450 * 18 * 100; printStatus = 'Paid'; printNote = 'Paid as billed (450 m)'; }
      else if (sp.choice === 'returned') { printStatus = 'Paid'; printNote = 'Paid for the 430 m that came back'; }
      else { printStatus = 'On hold'; printNote = 'Expected for 430 m · line on hold'; }
    }
    const cols = { raw: '#5B8DEF', dye: '#F59E0B', print: '#A78BFA', stitch: '#34D399', iron: '#F472B6' };
    const stStyle = (st) => st === 'Paid' ? pill(t.okFg, t.okBg) : (st === 'On hold' ? pill(t.warnFg, t.warnBg) : (st === 'Not started' ? pill(t.ink3, t.surface2) : pill(t.infoFg, t.infoBg)));
    const defs = [
      { id: 'B-24', name: 'Navy rayon dresses', status: 'Finished', done: true, qtyNow: 198, stageText: 'All 4 stages done · 198 pcs in stock',
        lostNote: '22 m of fabric lost in dyeing and printing (₹2,420 at cost) · 1 piece rejected at packing.',
        stages: [
          { key: 'raw', label: 'Raw fabric', who: 'Bought from mill', lot: 'PO-311', flow: '500 m rayon × ₹110/m', loss: '', costP: 5500000, status: 'Paid' },
          { key: 'dye', label: 'Dyeing', who: 'Ramesh Processors', lot: 'L-087', flow: '500 m out → 488 m back', loss: 'Loss 12 m (2.4%)', costP: 488 * 22 * 100, status: 'Paid' },
          { key: 'print', label: 'Printing', who: 'Shree Prints', lot: 'P-188', flow: '488 m out → 478 m back', loss: 'Loss 10 m (2.0%)', costP: 478 * 18 * 100, status: 'Paid' },
          { key: 'stitch', label: 'Stitching', who: 'Noor Tailors', lot: 'S-31', flow: '478 m out → 199 pcs back', loss: '2.4 m per piece', costP: 199 * 45 * 100, status: 'Paid' },
          { key: 'iron', label: 'Ironing & packing', who: 'Lakshmi Press', lot: 'I-12', flow: '199 pcs out → 198 pcs back', loss: '1 piece rejected', costP: 198 * 6 * 100, status: 'Paid' }
        ] },
      { id: 'B-27', name: 'Red georgette dresses', status: 'In process', done: false, qtyNow: 430, stageText: 'Printing back · next: stitching',
        lostNote: '20 m lost in printing — 6.5 m over the 3% limit (₹780 of fabric at ₹120/m).',
        stages: [
          { key: 'raw', label: 'Raw fabric', who: 'Bought from mill', lot: 'PO-318', flow: '450 m georgette × ₹120/m', loss: '', costP: 5400000, status: 'Paid' },
          { key: 'print', label: 'Printing', who: 'Shree Prints', lot: 'P-205', flow: '450 m out → 430 m back', loss: 'Loss 20 m (4.4%), over the 3% limit', note: printNote, warn: true, costP: printP, status: printStatus },
          { key: 'stitch', label: 'Stitching', who: 'Noor Tailors', lot: 'next step', flow: 'Not sent yet', loss: '', costP: 0, status: 'Not started' },
          { key: 'iron', label: 'Ironing & packing', who: 'Lakshmi Press', lot: 'after stitching', flow: 'Not sent yet', loss: '', costP: 0, status: 'Not started' }
        ] }
    ];
    if (s.challanMade) {
      defs.push({ id: 'B-29', name: 'Navy rayon dresses, next run', status: 'In process', done: false, qtyNow: 250, stageText: 'With Ramesh Processors for dyeing',
        lostNote: 'Nothing back yet. 365 days to bring the goods back under challan CH-0142.',
        stages: [
          { key: 'raw', label: 'Raw fabric', who: 'From your store', lot: 'PO-322', flow: '250 m rayon × ₹110/m', loss: '', costP: 2750000, status: 'Paid' },
          { key: 'dye', label: 'Dyeing', who: 'Ramesh Processors', lot: 'L-112 · CH-0142', flow: '250 m out · sent 13 Oct', loss: '', note: 'Charges arrive with his bill (₹22/m on returned metres)', costP: 0, status: 'In progress' },
          { key: 'print', label: 'Printing', who: 'Shree Prints', lot: 'after dyeing', flow: 'Not sent yet', loss: '', costP: 0, status: 'Not started' },
          { key: 'stitch', label: 'Stitching', who: 'Noor Tailors', lot: 'after printing', flow: 'Not sent yet', loss: '', costP: 0, status: 'Not started' },
          { key: 'iron', label: 'Ironing & packing', who: 'Lakshmi Press', lot: 'after stitching', flow: 'Not sent yet', loss: '', costP: 0, status: 'Not started' }
        ] });
    }
    const batches = defs.map((d) => {
      const totalP = d.stages.reduce((a, x) => a + x.costP, 0);
      const perP = Math.round(totalP / d.qtyNow);
      const bar = d.stages.filter((x) => x.costP > 0).map((x) => {
        const pct = x.costP / totalP * 100;
        return { label: x.label, pct: pct.toFixed(1) + '%', style: 'height: 12px; flex: ' + pct.toFixed(3) + ' 1 0; background: ' + cols[x.key],
          dotStyle: 'flex: none; width: 10px; height: 10px; border-radius: 3px; background: ' + cols[x.key] };
      });
      const stages = d.stages.map((x) => {
        const extra = [x.loss, x.note].filter(Boolean).join(' · ');
        return Object.assign({}, x, { costStr: x.costP > 0 ? fmt(x.costP) : '—', pillStyle: stStyle(x.status),
          dotStyle: 'flex: none; width: 10px; height: 10px; border-radius: 3px; background: ' + (x.costP > 0 ? cols[x.key] : t.surface2),
          hasExtra: !!extra, extra: extra, extraColor: x.warn ? t.warnFg : t.ink3 });
      });
      const segs = d.stages.filter((x) => x.key !== 'raw').map((x) => ({
        style: 'flex: 1; height: 6px; border-radius: 3px; background: ' + (x.status === 'Not started' ? t.surface2 : (x.status === 'In progress' ? t.infoFg : accent)) }));
      return Object.assign({}, d, {
        totalP: totalP, perP: perP, bar: bar, stages: stages, segs: segs,
        pillStyle: d.done ? pill(t.okFg, t.okBg) : pill(t.infoFg, t.infoBg),
        heroLabel: d.done ? 'Cost per piece' : 'Cost so far',
        heroBig: this.big(d.done ? perP : totalP),
        heroSub: d.done ? 'Batch cost ' + fmt(totalP) + ' · ' + d.qtyNow + ' pcs finished' : fmt(perP) + ' per metre so far · ' + d.qtyNow + ' m',
        barLabel: 'Cost split: ' + bar.map((b) => b.label + ' ' + b.pct).join(', '),
        costLabel: d.done ? 'Per piece' : 'So far', costValue: d.done ? fmt(perP) : fmt(totalP),
        open: () => this.setState({ screen: 'batch', batchId: d.id })
      });
    });
    const rayon = s.challanMade ? 500 : 750;
    const rawP = rayon * 110 * 100 + 200 * 120 * 100;
    const inProc = batches.filter((b) => !b.done);
    const inProcP = inProc.reduce((a, b) => a + b.totalP, 0);
    const fin = batches.filter((b) => b.id === 'B-24')[0];
    const b27 = batches.filter((b) => b.id === 'B-27')[0];
    const b29 = batches.filter((b) => b.id === 'B-29')[0];
    const tiles = [
      { label: 'Raw', value: whole(rawP), sub: 'in your store' },
      { label: 'In process', value: whole(inProcP), sub: inProc.length + ' batches' },
      { label: 'Finished', value: whole(fin.totalP), sub: fin.qtyNow + ' pcs at cost' }
    ];
    let shreeText = 'Nothing out right now.';
    if (!sp) { shreeText = 'Nothing out right now. Bill SP-0947 is waiting to be checked.'; }
    else if (sp.holdP > 0) { shreeText = 'Nothing out right now. Bill SP-0947 has lot P-205 on hold.'; }
    const groups = [
      { title: 'Your store', role: 'Raw and in process', empty: false, emptyText: '', rows: [
        { name: 'Rayon, white', sub: 'Raw · ₹110/m', qty: rayon + ' m', value: whole(rayon * 110 * 100) },
        { name: 'Georgette, white', sub: 'Raw · ₹120/m', qty: '200 m', value: whole(2400000) },
        { name: 'B-27 · Red georgette', sub: 'Printed · waiting for stitching', qty: '430 m', value: whole(b27.totalP) + ' so far' }
      ] },
      { title: 'Ramesh Processors', role: 'Dyeing', empty: !b29, emptyText: 'Nothing out with Ramesh right now.',
        rows: b29 ? [{ name: 'B-29 · Rayon, white', sub: 'Sent 13 Oct on challan CH-0142 · 365 days to return', qty: '250 m', value: whole(2750000) }] : [] },
      { title: 'Shree Prints', role: 'Printing', empty: true, emptyText: shreeText, rows: [] },
      { title: 'Finished goods', role: 'Ready to sell', empty: false, emptyText: '', rows: [
        { name: 'B-24 · Navy rayon dresses', sub: fmt(fin.perP) + ' per piece at cost', qty: fin.qtyNow + ' pcs', value: whole(fin.totalP) }
      ] }
    ];
    const sel = batches.filter((b) => b.id === s.batchId)[0] || batches[0];
    return { invTiles: tiles, invGroups: groups, batchCards: batches, sel: sel };
  }

  renderVals() {
    const light = this.state.themeLight ?? (this.props.light ?? true);
    const accent = this.props.accent ?? '#2F6BEB';
    const s = this.state;
    const t = light ? {
      bg: '#F5F6F8', surface: '#FFFFFF', surface2: '#EEF1F5', border: '#E2E5EA',
      ink: '#0F1115', ink2: '#4A5260', ink3: '#5F6775',
      okFg: '#15803D', okBg: '#E7F6EC', warnFg: '#B45309', warnBg: '#FDF1DE',
      infoFg: '#1D4ED8', infoBg: '#E6EEFF', bannerBg: '#FFF1DC', bannerFg: '#8A4300',
      hero: 'linear-gradient(135deg, #E6ECFF 0%, #F3EEFF 55%, #FFFFFF 100%)'
    } : {
      bg: '#0A0A0B', surface: '#161719', surface2: '#212327', border: '#2A2D31',
      ink: '#F3F4F6', ink2: '#AEB4BF', ink3: '#8C929E',
      okFg: '#4ADE80', okBg: 'rgba(74,222,128,0.12)', warnFg: '#FBBF24', warnBg: 'rgba(251,191,36,0.12)',
      infoFg: '#9CC0FF', infoBg: 'rgba(76,141,255,0.16)', bannerBg: '#2A1D08', bannerFg: '#FBBF24',
      hero: 'linear-gradient(135deg, #17203A 0%, #141519 60%, #141519 100%)'
    };
    const pill = (fg, bg) => 'flex: none; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; color: ' + fg + '; background: ' + bg;
    const B = this.bills();
    const c = this.compute(s.bill, s.choice);
    const b = c.b;

    const ids = ['ramesh', 'shree'];
    const unpaid = ids.filter((id) => !s.paid[id]);
    const unpaidTotal = unpaid.reduce((a, id) => a + this.compute(id, 'hold').billTotalP, 0);
    const homeTitle = unpaid.length === 0 ? 'All bills checked' : unpaid.length + (unpaid.length === 1 ? ' bill to check' : ' bills to check');
    const homeSub = unpaid.length === 0 ? 'Nothing waiting. Held lines stay on each job worker below.' : this.fmt(unpaidTotal) + ' billed by ' + unpaid.length + (unpaid.length === 1 ? ' job worker' : ' job workers');

    const allRows = ids.map((id) => {
      const bb = B[id];
      const cc = this.compute(id, 'hold');
      const p = s.paid[id];
      let status, sub, style, kind;
      if (!p) { status = 'Bill to check'; sub = bb.billNo + ' · ' + this.fmt(cc.billTotalP) + ' billed'; style = pill(t.infoFg, t.infoBg); kind = 'check'; }
      else if (p.holdP > 0) { status = 'On hold'; sub = this.fmt(p.payP) + ' paid · ' + this.fmt(p.holdP) + ' on hold'; style = pill(t.warnFg, t.warnBg); kind = 'hold'; }
      else { status = 'Paid'; sub = this.fmt(p.payP) + ' paid · ' + bb.billNo; style = pill(t.okFg, t.okBg); kind = 'paid'; }
      return { id: id, kind: kind, name: bb.worker, initials: bb.initials, process: bb.process, status: status, sub: sub, pillStyle: style,
        open: () => { if (!p) { this.pickBill(id); } else { this.flash(p.holdP > 0 ? 'Waiting for a revised bill from ' + bb.worker : bb.worker + ' is settled for ' + bb.billNo); } } };
    });
    const rows = allRows.filter((r) => s.filter === 'all' || (s.filter === 'check' && r.kind === 'check') || (s.filter === 'hold' && r.kind === 'hold'));
    const fdefs = [['all', 'All'], ['check', 'To check'], ['hold', 'On hold']];
    const filters = fdefs.map((f) => {
      const on = s.filter === f[0];
      return { label: f[1], checked: on ? 'true' : 'false', pick: () => this.setState({ filter: f[0] }),
        style: 'min-height: 36px; padding: 0 14px; border-radius: 999px; font-size: 13px; font-weight: 700; border: 1px solid ' + (on ? t.ink : t.border) + '; background: ' + (on ? t.ink : 'transparent') + '; color: ' + (on ? t.bg : t.ink2) };
    });

    const samples = ids.map((id) => {
      const bb = B[id];
      const cc = this.compute(id, 'hold');
      return { worker: bb.worker, billNo: bb.billNo, date: bb.date, kind: bb.handwritten ? 'handwritten' : 'printed',
        totalStr: this.fmt(cc.billTotalP), lineCount: bb.lines.length,
        miniLine1: bb.lines[0].readText, miniLine2: bb.lines[1].readText,
        paperFont: bb.handwritten ? "'Caveat', cursive" : "'Courier New', monospace",
        pick: () => this.pickBill(id) };
    });

    const needsConfirm = b.handwritten && !s.confirmed;
    const lines = c.lines.map((l) => {
      const unsure = !!l.unsure && b.handwritten;
      const pending = unsure && !s.confirmed;
      return Object.assign({}, l, {
        billedChargesStr: this.fmt(l.chargesBilledP),
        needsConfirm: pending && !s.reading,
        readBorder: pending ? t.warnFg : t.border,
        linkState: pending ? 'Needs your OK' : (unsure ? 'Confirmed by you' : 'Matched'),
        linkColor: pending ? t.warnFg : t.okFg,
        chip: l.flagged ? 'Needs a look' : 'Matches',
        chipStyle: l.flagged ? pill(t.warnFg, t.warnBg) : pill(t.okFg, t.okBg),
        lossColor: l.lossOver ? t.warnFg : t.ink
      });
    });
    const checkDisabled = s.reading || needsConfirm;
    const checkBtnStyle = 'width: 100%; height: 52px; border-radius: 12px; border: none; font-weight: 700; font-size: 16px; background: ' + (checkDisabled ? t.surface2 : accent) + '; color: ' + (checkDisabled ? t.ink3 : '#FFFFFF');

    const flaggedLines = c.flagged.map((l) => {
      const opts = [
        ['hold', 'Hold this line', 'Pay the rest now. This line stays on the card until a revised bill comes.'],
        ['returned', 'Pay for ' + l.back + ' m that came back', 'Pay ' + this.fmt(l.back * b.rate * 100) + ' + GST now and ask for a revised bill.'],
        ['billed', 'Pay as billed (' + l.billed + ' m)', 'Accept the bill as it is.']
      ];
      return Object.assign({}, l, { options: opts.map((o) => {
        const on = s.choice === o[0];
        return { label: o[1], help: o[2], checked: on ? 'true' : 'false', pick: () => this.setState({ choice: o[0] }),
          style: 'width: 100%; display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 12px; color: ' + t.ink + '; background: ' + (on ? t.surface2 : 'transparent') + '; border: 1px solid ' + (on ? accent : t.border),
          dotStyle: 'flex: none; margin-top: 2px; width: 18px; height: 18px; box-sizing: border-box; border-radius: 999px; border: ' + (on ? '6px solid ' + accent : '2px solid ' + t.ink3) };
      }) });
    });

    const payLines = c.pay.map((l) => ({ lot: l.lot, billable: l.billable, chargesStr: this.fmt(l.cP) }));
    const hasFlags = c.flagged.length > 0;
    const holdLots = c.lines.filter((l) => l.onHold).map((l) => l.lot).join(', ');
    let verdictContext;
    if (!hasFlags) {
      verdictContext = 'Every line matches what came back, at the agreed ₹' + b.rate + '/m. Loss on every lot is within your ' + b.limit + '% limit.';
    } else {
      const f = c.flagged[0];
      const okCount = c.lines.length - c.flagged.length;
      verdictContext = f.lot + ' is billed for ' + (f.billed - f.back) + ' m more than came back' + (f.lossOver ? ', and its loss is above your ' + b.limit + '% limit' : '') + '. ' + (okCount === 1 ? 'The other line is fine — you can pay it now.' : 'The other lines are fine — you can pay them now.');
    }

    const p = s.paid[s.bill];
    const doneP = p ? p.payP : c.payN;
    const stmtLines = c.lines.map((l) => ({
      lot: l.lot, desc: l.desc,
      detail: l.onHold ? 'On hold · billed ' + l.billed + ' m, ' + l.back + ' m came back' : l.billable + ' m × ₹' + b.rate + ' + GST',
      amount: l.onHold ? this.fmt(l.billedTotalP) + ' held' : this.fmt(l.cP + l.gP),
      color: l.onHold ? t.warnFg : t.ink
    }));

    const fl = c.flagged[0];
    let queryText = '';
    if (fl) {
      const revised = this.fmt(fl.back * b.rate * 100);
      if (s.lang === 'hi') {
        queryText = 'नमस्ते, बिल ' + b.billNo + ' में लॉट ' + fl.lot + ' के लिए ' + fl.billed + ' मीटर लिखा है, लेकिन हमें ' + fl.back + ' मीटर वापस मिला। ' +
          (s.choice === 'returned' ? 'हमने ' + fl.back + ' मीटर का भुगतान कर दिया है। ' : 'बाकी लाइनों का भुगतान आज कर दिया है। ') +
          'कृपया ' + fl.back + ' मीटर (' + revised + ' + GST) का संशोधित बिल भेजें।' +
          (fl.excess > 0 ? ' ' + b.limit + '% सीमा से ' + fl.excess + ' मीटर ज़्यादा कमी हुई है — इस पर भी बात कर लें।' : '');
      } else {
        queryText = 'Namaste. Bill ' + b.billNo + ' shows ' + fl.billed + ' m for lot ' + fl.lot + ', but ' + fl.back + ' m came back to us. ' +
          (s.choice === 'returned' ? 'We have paid for the ' + fl.back + ' m today. ' : 'We have paid the other lines today. ') +
          'Please send a revised bill for ' + fl.back + ' m (' + revised + ' + GST).' +
          (fl.excess > 0 ? ' Also, ' + fl.excess + ' m was lost beyond the ' + b.limit + '% limit — can we talk about it?' : '');
      }
    }
    const langStyle = (on) => 'min-height: 36px; padding: 0 14px; border-radius: 999px; font-size: 13px; font-weight: 700; border: 1px solid ' + (on ? t.ink : t.border) + '; background: ' + (on ? t.ink : 'transparent') + '; color: ' + (on ? t.bg : t.ink2);

    const inv = this.inventory(s, t, pill, accent);
    const cf = s.cf;
    const stk = s.stock;
    const AGS = [
      { id: 'ramesh', name: 'Ramesh Processors', process: 'Dyeing', rate: 'Dyeing · ₹22/m on returned metres · loss limit 3%', lotP: 'L-', lotB: 112, verb: 'for dyeing', km: 12 },
      { id: 'shree', name: 'Shree Prints', process: 'Printing', rate: 'Printing · ₹18/m on returned metres · loss limit 3%', lotP: 'P-', lotB: 208, verb: 'for printing', km: 8 },
      { id: 'noor', name: 'Noor Tailors', process: 'Stitching', rate: 'Stitching · ₹45 per piece · 2.4 m per dress', lotP: 'S-', lotB: 35, verb: 'for stitching', km: 5 },
      { id: 'lakshmi', name: 'Lakshmi Press', process: 'Ironing & packing', rate: 'Ironing & packing · ₹6 per piece', lotP: 'I-', lotB: 16, verb: 'for ironing and packing', km: 3 }
    ];
    const curAg = AGS.filter((a) => a.id === cf.agency)[0];
    const ITEMS = [
      { key: 'rayon', name: 'Rayon, white', kind: 'Raw fabric · ₹110/m', avail: stk.rayon, rateP: 11000 },
      { key: 'georgette', name: 'Georgette, white', kind: 'Raw fabric · ₹120/m', avail: stk.georgette, rateP: 12000 },
      { key: 'b27', name: 'B-27 · Red georgette, printed', kind: 'Between steps · ' + this.fmt(inv.b27PerP) + '/m so far', avail: stk.b27, rateP: inv.b27PerP },
      { key: 'cotton', name: 'Cotton, white', kind: 'Raw fabric · ₹95/m', avail: stk.cotton, rateP: 9500 }
    ];
    const curItem = ITEMS.filter((i) => i.key === cf.item)[0];
    const avail = curItem.avail;
    const qty = Math.min(cf.qty, avail);
    const qtyOk = qty > 0 && qty <= avail;
    const setCf = (patch) => this.setState({ cf: Object.assign({}, cf, patch) });
    const cfAgencies = AGS.map((a) => {
      const on = a.id === cf.agency;
      return { name: a.name, process: a.process, checked: on ? 'true' : 'false', pick: () => setCf({ agency: a.id }),
        style: 'text-align: left; min-height: 60px; padding: 10px 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 2px; color: ' + t.ink + '; background: ' + (on ? t.surface2 : t.surface) + '; border: 1px solid ' + (on ? accent : t.border) + '; box-shadow: ' + (on ? 'inset 0 0 0 1px ' + accent : 'none') };
    });
    const cfItems = ITEMS.map((i) => {
      const on = i.key === cf.item;
      const out = i.avail <= 0;
      return { name: i.name, kind: i.kind, availStr: out ? 'Out of stock' : i.avail + ' m in store', availColor: out ? t.ink3 : t.okFg,
        checked: on ? 'true' : 'false', disabled: out, ariaDisabled: out ? 'true' : 'false',
        pick: () => { if (!out) { setCf({ item: i.key, qty: Math.min(Math.max(cf.qty, 50), i.avail) }); } },
        style: 'width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; color: ' + (out ? t.ink3 : t.ink) + '; background: ' + (on ? t.surface2 : t.surface) + '; border: 1px ' + (out ? 'dashed ' : 'solid ') + (on ? accent : t.border) + '; opacity: ' + (out ? 0.6 : 1),
        dotStyle: 'flex: none; width: 18px; height: 18px; box-sizing: border-box; border-radius: 999px; border: ' + (on ? '6px solid ' + accent : '2px solid ' + t.ink3) };
    });
    const valueP = Math.round(qty * curItem.rateP);
    const cfHelp = avail <= 0 ? 'Out of stock. Pick something that is in your store.' : (qty <= 0 ? 'Choose how much to send.' : avail + ' m in store · ' + (avail - qty) + ' m left after sending');
    const createChallan = () => {
      if (!qtyOk) { return; }
      const n = s.sent.length;
      const prevAg = s.sent.filter((c) => c.agency === cf.agency).length;
      const prevRaw = s.sent.filter((c) => c.itemKey !== 'b27').length;
      const rec = { ch: 'CH-0' + (142 + n), lot: curAg.lotP + (curAg.lotB + prevAg), agency: cf.agency, itemKey: cf.item, itemLabel: curItem.name,
        qty: qty, valueP: valueP, batch: cf.item === 'b27' ? null : 'B-' + (29 + prevRaw) };
      const stock = Object.assign({}, stk);
      stock[cf.item] = stk[cf.item] - qty;
      const last = { ch: rec.ch, lot: rec.lot,
        summary: qty + ' m ' + curItem.name + ' sent to ' + curAg.name + ' ' + curAg.verb + ', valued at ' + this.fmt(valueP) + ' at cost' + (rec.batch ? '. Started batch ' + rec.batch + '.' : '.'),
        leftStr: stock[cf.item] + ' m ' + curItem.name,
        clock: '365 days to bring these goods back. Expected back from ' + curAg.name + ' by their usual turnaround; you will see it in Inventory.',
        next: 'When ' + curAg.name + '\'s bill arrives, lot ' + rec.lot + ' is what it gets checked against.',
        valueP: valueP, valueStr: this.fmt(valueP), agName: curAg.name, goods: qty + ' m ' + curItem.name, distance: curAg.km + ' km' };
      this.setState({ sent: s.sent.concat([rec]), stock: stock, challanDone: true, challanMade: true, lastCh: last, ewbStage: 'none', ewbMode: 'own',
        cf: Object.assign({}, cf, { qty: Math.min(cf.qty, stock[cf.item]) }) });
      this.flash('Challan ' + rec.ch + ' ready to share');
    };
    const navStyle = (on) => 'min-height: 52px; border: none; background: transparent; color: ' + (on ? t.ink : t.ink3) + '; display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 11px; font-weight: ' + (on ? 700 : 600);
    const flowScreens = { snap: 1, read: 2, verdict: 3, breakdown: 3, approve: 4 };
    const step = flowScreens[s.screen] || 0;
    const isFlow = step > 0 || s.screen === 'challan' || s.screen === 'batch' || s.screen === 'agency' || s.screen === 'product' || s.screen === 'gstVendor';
    const pay = this.payoutsData(s, t, pill, langStyle);
    const gst = this.gstData(s, t, pill, langStyle);
    const titles = { snap: 'Check a bill', read: 'Read bill', verdict: 'Verdict', breakdown: 'Breakdown', approve: 'Approve payout', challan: 'Send goods out' };
    const flowSub = s.screen === 'gstVendor' ? 'GST reconciliation · ' + gst.gstPeriodLabel : s.screen === 'agency' ? inv.selAgency.process + ' · job worker' : s.screen === 'product' ? 'Finished goods' : s.screen === 'batch' ? inv.sel.name : s.screen === 'challan' ? 'Delivery challan' : (step ? 'Step ' + step + ' of 4' + (step > 1 ? ' · ' + b.worker : '') : '');
    const backMap = { snap: 'home', read: 'snap', verdict: 'read', breakdown: 'verdict', approve: 'breakdown', challan: 'home', batch: s.batchFrom || 'inventory', agency: 'inventory', product: 'inventory', gstVendor: 'gst' };
    const nextUnpaid = ids.filter((id) => !s.paid[id] && id !== s.bill)[0];

    return {
      t: t, accent: accent,
      isDark: !light, isLight: light,
      themeLabel: light ? 'Switch to dark theme' : 'Switch to light theme',
      toggleTheme: () => { this.setState({ themeLight: !light }); this.flash(light ? 'Dark theme on' : 'Light theme on'); },
      isInventory: s.screen === 'inventory', isBatch: s.screen === 'batch',
      isTab: s.screen === 'home' || s.screen === 'inventory' || s.screen === 'payouts' || s.screen === 'gst',
      isPayouts: s.screen === 'payouts', isGst: s.screen === 'gst', isGstVendor: s.screen === 'gstVendor',
      openPayouts: () => this.setState({ screen: 'payouts' }), openGst: () => this.setState({ screen: 'gst' }),
      navPayCur: s.screen === 'payouts' ? 'page' : 'false', navGstCur: s.screen === 'gst' ? 'page' : 'false',
      navPayStyle: navStyle(s.screen === 'payouts'), navGstStyle: navStyle(s.screen === 'gst'),
      payRows: pay.payRows, payFilters: pay.payFilters, payEmpty: pay.payEmpty, paySum: pay.paySum,
      gstPeriods: gst.gstPeriods, gstVendors: gst.gstVendors, gstHero: gst.gstHero,
      selGst: gst.selGst || { name: '', bills: [], totalStr: '', matchedStr: '', fixStr: '', fixColor: t.ink },
      openInventory: () => this.setState({ screen: 'inventory' }),
      navHomeCur: s.screen === 'home' ? 'page' : 'false', navInvCur: s.screen === 'inventory' ? 'page' : 'false',
      navHomeStyle: navStyle(s.screen === 'home'), navInvStyle: navStyle(s.screen === 'inventory'), navOffStyle: navStyle(false),
      invTiles: inv.invTiles, rawRows: inv.rawRows, agencyRows: inv.agencyRows, betweenRows: inv.betweenRows, products: inv.products,
      sel: inv.sel, selAgency: inv.selAgency, selProduct: inv.selProduct,
      rawHeader: inv.rawHeader, processHeader: inv.processHeader, finishedHeader: inv.finishedHeader,
      invRaw: s.invView === 'raw', invProcess: s.invView === 'process', invFinished: s.invView === 'finished',
      isAgency: s.screen === 'agency', isProduct: s.screen === 'product',
      isHome: s.screen === 'home', isFlow: isFlow, isSnap: s.screen === 'snap', isRead: s.screen === 'read',
      isVerdict: s.screen === 'verdict', isBreakdown: s.screen === 'breakdown', isApprove: s.screen === 'approve',
      isDone: s.screen === 'done', isChallan: s.screen === 'challan',
      flowTitle: s.screen === 'gstVendor' ? (gst.selGst ? gst.selGst.name : 'GST') : s.screen === 'agency' ? inv.selAgency.name : s.screen === 'product' ? inv.selProduct.name : s.screen === 'batch' ? 'Batch ' + inv.sel.id : (titles[s.screen] || ''), flowSub: flowSub, stepPct: (s.screen === 'challan' ? 100 : step * 25) + '%',
      back: () => this.setState({ screen: backMap[s.screen] || 'home' }),
      goHome: () => this.setState({ screen: 'home', challanDone: false }),
      startCheck: () => this.setState({ screen: 'snap' }),
      openChallan: () => this.setState({ screen: 'challan', challanDone: false }),
      createChallan: createChallan,
      cfAgencies: cfAgencies, cfItems: cfItems, cfQty: qty, cfHelp: cfHelp, cfHelpColor: qtyOk ? t.ink2 : t.warnFg,
      cfValueStr: this.fmt(valueP), cfRate: curAg.rate,
      cfDec: () => setCf({ qty: Math.max(0, qty - 50) }),
      cfInc: () => setCf({ qty: Math.min(avail, qty + 50) }),
      cfMax: () => setCf({ qty: avail }),
      cfDisabled: !qtyOk,
      cfBtnLabel: qtyOk ? 'Create challan · ' + qty + ' m' : 'Nothing to send',
      cfBtnStyle: 'width: 100%; height: 52px; border-radius: 12px; border: none; font-weight: 700; font-size: 16px; background: ' + (qtyOk ? accent : t.surface2) + '; color: ' + (qtyOk ? '#FFFFFF' : t.ink3),
      lastCh: s.lastCh || { ch: '', lot: '', summary: '', leftStr: '', clock: '', next: '', valueP: 0, valueStr: '', agName: '', goods: '', distance: '' },
      ewbNone: (s.ewbStage || 'none') === 'none', ewbForm: s.ewbStage === 'form', ewbDone: s.ewbStage === 'done',
      ewbPill: s.ewbStage === 'done' ? 'Generated' : (s.lastCh && s.lastCh.valueP > 5000000 ? 'Required' : 'Optional'),
      ewbPillStyle: s.ewbStage === 'done' ? pill(t.okFg, t.okBg) : (s.lastCh && s.lastCh.valueP > 5000000 ? pill(t.warnFg, t.warnBg) : pill(t.ink2, t.surface2)),
      ewbBorder: s.ewbStage !== 'done' && s.lastCh && s.lastCh.valueP > 5000000 ? t.warnFg : t.border,
      ewbReason: s.lastCh && s.lastCh.valueP > 5000000
        ? 'These goods are worth ' + s.lastCh.valueStr + ', above ₹50,000, so they need an e-way bill before they leave.'
        : 'These goods are worth ' + (s.lastCh ? s.lastCh.valueStr : '') + ', under ₹50,000, and stay within your state, so an e-way bill is optional. Sending to a job worker in another state always needs one.',
      ewbStartStyle: 'height: 48px; border-radius: 12px; font-weight: 700; font-size: 15px; ' + (s.lastCh && s.lastCh.valueP > 5000000 ? 'border: none; background: ' + accent + '; color: #FFFFFF' : 'border: 1px solid ' + t.border + '; background: ' + t.surface2 + '; color: ' + t.ink),
      startEwb: () => this.setState({ ewbStage: 'form' }),
      ewbOwnChecked: (s.ewbMode || 'own') === 'own' ? 'true' : 'false', ewbTptChecked: s.ewbMode === 'tpt' ? 'true' : 'false',
      ewbOwnStyle: langStyle((s.ewbMode || 'own') === 'own'), ewbTptStyle: langStyle(s.ewbMode === 'tpt'),
      ewbOwn: () => this.setState({ ewbMode: 'own' }), ewbTpt: () => this.setState({ ewbMode: 'tpt' }),
      ewbVehicleLabel: s.ewbMode === 'tpt' ? 'Transporter ID' : 'Vehicle number',
      ewbVehicle: s.ewbMode === 'tpt' ? '[Transporter ID]' : 'GJ05 AB 1234',
      genEwb: () => { this.setState({ ewbStage: 'done' }); this.flash('E-way bill generated (demo)'); },
      ewbNo: 'EWB-DEMO-' + (s.lastCh ? s.lastCh.ch.replace('CH-', '') : '0000'),
      shareEwb: () => this.flash('E-way bill ready to share with the driver'),
      challanForm: !s.challanDone, challanDone: s.challanDone,
      dismissNudge: () => this.setState({ nudge: false }), showNudge: s.nudge,
      homeTitle: homeTitle, homeSub: homeSub, rows: rows, filters: filters,
      rowsEmpty: rows.length === 0,
      emptyTitle: s.filter === 'hold' ? 'Nothing on hold' : 'No bills waiting',
      emptyText: s.filter === 'hold' ? 'When you hold a line on a bill, it waits here until the job worker sends a revised bill.' : 'New bills from your job workers show here. Snap one to check it before you pay.',
      samples: samples,
      bill: b, lines: lines, reading: s.reading, readDone: !s.reading,
      readHeadline: b.handwritten ? (s.confirmed ? 'All lines linked' : '1 line needs your OK') : 'All fields read clearly',
      readSub: b.handwritten ? 'Handwritten bill. Lines are linked to lots you sent; unclear ones need your OK.' : 'Printed bill. Each line is linked to a lot you sent.',
      confirmLink: () => this.setState({ confirmed: true }),
      checkDisabled: checkDisabled, checkBtnStyle: checkBtnStyle,
      toVerdict: () => { if (!checkDisabled) { this.setState({ screen: 'verdict' }); } },
      billTotalStr: this.fmt(c.billTotalP),
      allMatch: !hasFlags, hasFlags: hasFlags, hasHold: c.holdP > 0,
      verdictTitle: hasFlags ? (c.flagged.length + (c.flagged.length === 1 ? ' line needs a look' : ' lines need a look')) : 'All ' + c.lines.length + ' lines match',
      verdictContext: verdictContext,
      verdictColor: hasFlags ? t.warnFg : t.okFg,
      verdictBg: hasFlags ? t.warnBg : t.okBg,
      verdictBorder: hasFlags ? t.warnFg : t.okFg,
      payLabel: hasFlags ? 'Pay now' : 'Ready to pay',
      payBig: this.big(c.payN), payStr: this.fmt(c.payN), holdStr: this.fmt(c.holdP), holdLots: holdLots,
      toBreakdown: () => this.setState({ screen: 'breakdown' }),
      flaggedLines: flaggedLines, payLines: payLines,
      payChargesStr: this.fmt(c.payC), payGstStr: this.fmt(c.payG), payTdsStr: this.fmt(c.payT),
      payCountStr: c.pay.length + ' of ' + c.lines.length + (c.lines.length === 1 ? ' line' : ' lines'),
      toApprove: () => this.setState({ screen: 'approve' }),
      approve: () => {
        const paid = Object.assign({}, s.paid);
        paid[s.bill] = { payP: c.payN, holdP: c.holdP, choice: s.choice, tdsP: c.payT };
        this.setState({ paid: paid, screen: 'done', payStatus: 'processing' });
        clearTimeout(this._pt);
        this._pt = setTimeout(() => this.setState({ payStatus: 'paid' }), 1600);
      },
      statusLabel: s.payStatus === 'paid' ? 'Paid' : 'Processing',
      statusPillStyle: s.payStatus === 'paid' ? pill(t.okFg, t.okBg) : pill(t.infoFg, t.infoBg),
      statusContext: s.payStatus === 'paid' ? 'Credited to ' + b.account + '. The bill and its lots are closed' + (c.holdP > 0 ? ', except ' + holdLots + ', which stays on hold.' : '.') : 'Sent to ' + b.account + '. Usually lands within a couple of minutes — we will update this screen.',
      doneBig: this.big(doneP), doneStr: this.fmt(doneP), stmtLines: stmtLines,
      showQuery: hasFlags && s.choice !== 'billed', queryText: queryText,
      langEnChecked: s.lang === 'en' ? 'true' : 'false', langHiChecked: s.lang === 'hi' ? 'true' : 'false',
      langEnStyle: langStyle(s.lang === 'en'), langHiStyle: langStyle(s.lang === 'hi'),
      setEn: () => this.setState({ lang: 'en' }), setHi: () => this.setState({ lang: 'hi' }),
      shareStatement: () => this.flash('Statement ready to share with ' + b.worker),
      shareQuery: () => this.flash('Query ready to send to ' + b.worker),
      hasNextBill: !!nextUnpaid,
      nextBill: () => { if (nextUnpaid) { this.pickBill(nextUnpaid); } },
      hasToast: !!s.toast, toast: s.toast
    };
  }

  render() {
    const v = this.renderVals();
    return html`<div style="width: 390px; height: 844px; position: relative; overflow: hidden; background: ${v.t.bg}; color: ${v.t.ink}; font-family: 'Manrope', 'Noto Sans Devanagari', system-ui, sans-serif; font-size: 14px; line-height: 1.4">


<div aria-hidden="true" style="position: absolute; left: 0; right: 0; top: 0; height: 47px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 0 30px 0 38px; background: ${v.t.bg}; color: ${v.t.ink}; z-index: 8">
<span style="font-size: 16px; font-weight: 700; letter-spacing: -0.01em; font-family: -apple-system, 'SF Pro Text', 'Manrope', system-ui, sans-serif">9:41</span>
<span style="display: flex; align-items: center; gap: 6px">
<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"></rect><rect x="5" y="5.5" width="3" height="6.5" rx="1"></rect><rect x="10" y="3" width="3" height="9" rx="1"></rect><rect x="15" y="0" width="3" height="12" rx="1"></rect></svg>
<svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 4.2a9.5 9.5 0 0 1 13 0"></path><path d="M4 7a6 6 0 0 1 8 0"></path><circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none"></circle></svg>
<svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity="0.4"></rect><rect x="2" y="2" width="18" height="9" rx="2" fill="currentColor"></rect><path d="M25 4.5v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.4"></path></svg>
</span>
</div>
<div aria-hidden="true" style="position: absolute; top: 11px; left: 50%; margin-left: -63px; width: 126px; height: 37px; border-radius: 20px; background: #000000; z-index: 9"></div>
<div aria-hidden="true" style="position: absolute; bottom: 8px; left: 50%; margin-left: -67px; width: 134px; height: 5px; border-radius: 3px; background: ${v.t.ink}; opacity: 0.9; z-index: 9"></div>

${(v.isHome) ? html`
<div style="position: absolute; left: 0; right: 0; top: 47px; bottom: 84px; display: flex; flex-direction: column">
<div style="flex: none; display: flex; align-items: center; gap: 12px; padding: 14px 16px 10px">
<div style="width: 40px; height: 40px; border-radius: 12px; background: ${v.t.surface2}; border: 1px solid ${v.t.border}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px">MF</div>
<div style="flex: 1; min-width: 0">
<div style="font-weight: 700; font-size: 16px">Mehta Fashions</div>
<div style="font-size: 12px; color: ${v.t.ink3}">Business account ••2290</div>
</div>
<button onClick=${v.toggleTheme} aria-label=${v.themeLabel} title=${v.themeLabel} style="width: 44px; height: 44px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink2}; display: flex; align-items: center; justify-content: center">
${(v.isDark) ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>` : null}
${(v.isLight) ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` : null}
</button>
<button aria-label="Notifications" style="width: 44px; height: 44px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink2}; display: flex; align-items: center; justify-content: center">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
</button>
</div>

<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 4px 16px 24px; display: flex; flex-direction: column; gap: 16px">

<div style="border-radius: 20px; padding: 20px; background: ${v.t.hero}; border: 1px solid ${v.t.border}; display: flex; flex-direction: column; gap: 14px">
<div style="font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: ${v.t.ink2}">Job work bills</div>
<div>
<div style="font-size: 26px; font-weight: 800; letter-spacing: -0.02em">${v.homeTitle}</div>
<div style="font-size: 13px; color: ${v.t.ink2}; margin-top: 4px">${v.homeSub}</div>
</div>
<div style="display: flex; gap: 10px">
<button onClick=${v.startCheck} style="flex: 1; height: 48px; border-radius: 12px; border: none; background: ${v.accent}; color: #FFFFFF; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
Check a bill
</button>
<button onClick=${v.openChallan} style="height: 48px; padding: 0 14px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}; font-weight: 600; font-size: 14px">Send goods out</button>
</div>
</div>

${(v.showNudge) ? html`
<div style="position: relative; border-radius: 16px; padding: 16px 48px 16px 16px; background: #0E1A3A; color: #FFFFFF; display: flex; gap: 12px; align-items: flex-start">
<div style="flex: none; width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
</div>
<div style="display: flex; flex-direction: column; gap: 6px">
<div style="display: flex; align-items: center; gap: 8px"><span style="font-weight: 700">Hisaab</span><span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; background: #2F6BEB">NEW</span></div>
<div style="font-size: 13px; color: #C7D2F0">Snap a job worker's bill. We check it against what actually came back before you pay.</div>
<button onClick=${v.startCheck} style="align-self: flex-start; margin-top: 2px; min-height: 36px; padding: 0 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.35); background: transparent; color: #FFFFFF; font-weight: 600; font-size: 13px">Try it</button>
</div>
<button onClick=${v.dismissNudge} aria-label="Dismiss" style="position: absolute; top: 4px; right: 4px; width: 44px; height: 44px; border: none; background: transparent; color: #C7D2F0; display: flex; align-items: center; justify-content: center">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
` : null}

<div style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: center; justify-content: space-between">
<div style="font-weight: 700; font-size: 16px">Job workers</div>
<div style="font-size: 12px; color: ${v.t.ink3}">October</div>
</div>
<div role="radiogroup" aria-label="Filter job workers" style="display: flex; gap: 8px">
${(v.filters || []).map((f, $index) => html`
<button role="radio" aria-checked=${f.checked} onClick=${f.pick} style=${f.style}>${f.label}</button>
`)}
</div>
${(v.rows || []).map((r, $index) => html`
<button onClick=${r.open} style="width: 100%; text-align: left; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}">
<div style="flex: none; width: 40px; height: 40px; border-radius: 999px; background: ${v.t.surface2}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: ${v.t.ink2}">${r.initials}</div>
<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px">
<div style="display: flex; align-items: center; gap: 8px"><span style="font-weight: 700; font-size: 15px">${r.name}</span><span style="font-size: 12px; color: ${v.t.ink3}">${r.process}</span></div>
<div style="font-size: 13px; color: ${v.t.ink2}">${r.sub}</div>
</div>
<span style=${r.pillStyle}>${r.status}</span>
</button>
`)}
${(v.rowsEmpty) ? html`
<div style="padding: 20px 16px; border-radius: 16px; border: 1px dashed ${v.t.border}; color: ${v.t.ink2}; font-size: 13px; display: flex; flex-direction: column; gap: 4px">
<span style="font-weight: 700; color: ${v.t.ink}">${v.emptyTitle}</span>
<span>${v.emptyText}</span>
</div>
` : null}
</div>
</div>

</div>
` : null}

${(v.isInventory) ? html`
<div style="position: absolute; left: 0; right: 0; top: 47px; bottom: 84px; display: flex; flex-direction: column">
<div style="flex: none; padding: 14px 16px 8px; display: flex; align-items: center; gap: 12px">
<div style="flex: 1; min-width: 0">
<div style="font-weight: 800; font-size: 22px; letter-spacing: -0.01em">Inventory</div>
<div style="font-size: 13px; color: ${v.t.ink3}">Raw material to finished goods, at cost</div>
</div>
<button onClick=${v.toggleTheme} aria-label=${v.themeLabel} title=${v.themeLabel} style="width: 44px; height: 44px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink2}; display: flex; align-items: center; justify-content: center">
${(v.isDark) ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>` : null}
${(v.isLight) ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` : null}
</button>
</div>
<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 4px 16px 24px; display: flex; flex-direction: column; gap: 14px">
<div role="radiogroup" aria-label="Inventory state" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
${(v.invTiles || []).map((ti, $index) => html`
<button role="radio" aria-checked=${ti.checked} onClick=${ti.pick} style=${ti.style}>
<span style="font-size: 11px; font-weight: 700; color: ${v.t.ink2}; text-transform: uppercase; letter-spacing: 0.03em">${ti.label}</span>
<span style="font-size: 17px; font-weight: 800">${ti.value}</span>
<span style="font-size: 11px; color: ${ti.subColor}; font-weight: 600">${ti.sub}</span>
</button>
`)}
</div>

${(v.invRaw) ? html`
<div style="display: flex; flex-direction: column; gap: 10px">
<div style="font-size: 13px; color: ${v.t.ink2}; font-weight: 600">${v.rawHeader}</div>
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 2px 14px">
${(v.rawRows || []).map((rr, $index) => html`
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 12px 0; border-bottom: 1px solid ${v.t.border}">
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span style="font-weight: 700">${rr.name}</span><span style="font-size: 12px; color: ${v.t.ink3}">${rr.sub}</span></div>
<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px; white-space: nowrap"><span style="font-weight: 700">${rr.qty}</span><span style="font-size: 12px; color: ${v.t.ink2}">${rr.value}</span></div>
</div>
`)}
</div>
<div style="font-size: 12px; color: ${v.t.ink3}">Raw material leaves this list when you send it out on a challan.</div>
</div>
` : null}

${(v.invProcess) ? html`
<div style="display: flex; flex-direction: column; gap: 10px">
<div style="font-size: 13px; color: ${v.t.ink2}; font-weight: 600">${v.processHeader}</div>
${(v.agencyRows || []).map((a, $index) => html`
<button onClick=${a.open} style="width: 100%; text-align: left; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}">
<span style="flex: none; width: 40px; height: 40px; border-radius: 999px; background: ${v.t.surface2}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: ${v.t.ink2}">${a.initials}</span>
<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px">
<span style="display: flex; align-items: center; gap: 8px"><span style="font-weight: 700; font-size: 15px">${a.name}</span><span style="font-size: 12px; color: ${v.t.ink3}">${a.process}</span></span>
<span style="font-size: 13px; color: ${v.t.ink2}">${a.summary}</span>
</span>
<span style=${a.pillStyle}>${a.pillText}</span>
</button>
`)}
<div style="font-size: 13px; color: ${v.t.ink2}; font-weight: 600; margin-top: 6px">Between steps, in your store</div>
${(v.betweenRows || []).map((bw, $index) => html`
<button onClick=${bw.open} style="width: 100%; text-align: left; display: flex; justify-content: space-between; gap: 10px; padding: 14px; border-radius: 16px; border: 1px dashed ${v.t.border}; background: transparent; color: ${v.t.ink}">
<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-weight: 700">${bw.name}</span><span style="font-size: 12px; color: ${v.t.ink3}">${bw.sub}</span></span>
<span style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px; white-space: nowrap"><span style="font-weight: 700">${bw.qty}</span><span style="font-size: 12px; color: ${v.t.ink2}">${bw.value}</span></span>
</button>
`)}
</div>
` : null}

${(v.invFinished) ? html`
<div style="display: flex; flex-direction: column; gap: 10px">
<div style="font-size: 13px; color: ${v.t.ink2}; font-weight: 600">${v.finishedHeader}</div>
${(v.products || []).map((pr, $index) => html`
<button onClick=${pr.open} style="width: 100%; text-align: left; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}">
<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px">
<span style="font-weight: 700; font-size: 15px">${pr.name}</span>
<span style="font-size: 13px; color: ${v.t.ink2}">${pr.sub}</span>
</span>
<span style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px; white-space: nowrap"><span style="font-weight: 800">${pr.stockStr}</span><span style="font-size: 12px; color: ${v.t.ink2}">${pr.valueStr}</span></span>
</button>
`)}
<div style="font-size: 12px; color: ${v.t.ink3}">Costs come from the bills you check and pay, and exclude GST you claim back as input credit.</div>
</div>
` : null}
</div>
</div>
` : null}

${(v.isBatch) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; overflow-y: auto; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px">
<div style="border-radius: 20px; border: 1px solid ${v.t.border}; background: ${v.t.hero}; padding: 18px; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px"><span style="font-weight: 700; font-size: 15px">${v.sel.name}</span><span style=${v.sel.pillStyle}>${v.sel.status}</span></div>
<div>
<div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">${v.sel.heroLabel}</div>
<div style="display: flex; align-items: baseline; gap: 2px"><span style="font-size: 20px; font-weight: 600; color: ${v.t.ink2}">₹</span><span style="font-size: 36px; font-weight: 800; letter-spacing: -0.02em">${v.sel.heroBig.w}</span><span style="font-size: 18px; font-weight: 600; color: ${v.t.ink2}">${v.sel.heroBig.d}</span></div>
<div style="font-size: 13px; color: ${v.t.ink2}">${v.sel.heroSub}</div>
</div>
<div role="img" aria-label=${v.sel.barLabel} style="display: flex; height: 12px; border-radius: 6px; overflow: hidden; gap: 2px">
${(v.sel.bar || []).map((bs, $index) => html`<span style=${bs.style}></span>`)}
</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 14px">
${(v.sel.bar || []).map((bs, $index) => html`
<div style="display: flex; align-items: center; gap: 6px; font-size: 12px"><span style=${bs.dotStyle}></span><span style="color: ${v.t.ink2}">${bs.label}</span><span style="font-weight: 700; margin-left: auto">${bs.pct}</span></div>
`)}
</div>
</div>
<div style="font-weight: 700">From raw material to finished goods</div>
${(v.sel.stages || []).map((st, $index) => html`
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px"><span style="display: flex; align-items: center; gap: 8px"><span style=${st.dotStyle}></span><span style="font-weight: 700">${st.label}</span></span><span style=${st.pillStyle}>${st.status}</span></div>
<div style="font-size: 13px; color: ${v.t.ink2}">${st.who} · ${st.lot}</div>
<div style="display: flex; justify-content: space-between; gap: 8px; font-size: 13px"><span style="color: ${v.t.ink3}">${st.flow}</span><span style="font-weight: 700; white-space: nowrap">${st.costStr}</span></div>
${(st.hasExtra) ? html`<div style="font-size: 12px; color: ${st.extraColor}">${st.extra}</div>` : null}
</div>
`)}
<div style="border-radius: 12px; background: ${v.t.surface2}; padding: 12px; display: flex; flex-direction: column; gap: 6px; font-size: 13px">
<div style="font-weight: 700">${v.sel.lostNote}</div>
<div style="color: ${v.t.ink2}">Costs exclude GST you claim back as input credit. TDS is not a cost — it is tax you deposit on the job worker's behalf.</div>
</div>
</div>
` : null}

${(v.isAgency) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; overflow-y: auto; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px">
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.hero}; padding: 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
<div><div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">With them</div><div style="font-size: 20px; font-weight: 800">${v.selAgency.outN}</div></div>
<div><div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">Overdue</div><div style="font-size: 20px; font-weight: 800; color: ${v.selAgency.overdueColor}">${v.selAgency.overdueN}</div></div>
<div><div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">On time</div><div style="font-size: 20px; font-weight: 800">${v.selAgency.onTimeStr}</div></div>
<div style="grid-column: 1 / -1; font-size: 12px; color: ${v.t.ink2}">Usual turnaround ${v.selAgency.tat} days. Expected dates are worked out from the day each consignment was sent.</div>
</div>
<div style="font-weight: 700">With them now</div>
${(v.selAgency.outList || []).map((o, $index) => html`
<div style="border-radius: 16px; border: 1px solid ${o.borderColor}; background: ${v.t.surface}; padding: 14px; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px"><span><span style="font-weight: 700">${o.ch}</span> <span style="font-size: 13px; color: ${v.t.ink3}">· ${o.lot}</span></span><span style=${o.pillStyle}>${o.status}</span></div>
<div style="font-size: 14px; font-weight: 600">${o.item}</div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; font-size: 12px">
<div><div style="color: ${v.t.ink3}">Sent</div><div style="font-weight: 700; font-size: 14px">${o.qty}</div></div>
<div><div style="color: ${v.t.ink3}">On</div><div style="font-weight: 700; font-size: 14px">${o.sentStr}</div></div>
<div><div style="color: ${v.t.ink3}">Out for</div><div style="font-weight: 700; font-size: 14px">${o.daysOutStr}</div></div>
</div>
<div style="font-size: 13px; font-weight: 600; color: ${o.noteColor}">${o.note}</div>
${(o.overdue) ? html`
<button onClick=${o.remind} style="height: 44px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface2}; color: ${v.t.ink}; font-weight: 700">Send reminder</button>
` : null}
</div>
`)}
${(v.selAgency.noOut) ? html`
<div style="padding: 16px; border-radius: 16px; border: 1px dashed ${v.t.border}; color: ${v.t.ink2}; font-size: 13px">Nothing with ${v.selAgency.name} right now. Send goods out on a challan and it will show here.</div>
` : null}
<div style="font-weight: 700">Recently returned</div>
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 2px 14px">
${(v.selAgency.retList || []).map((r, $index) => html`
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 12px 0; border-bottom: 1px solid ${v.t.border}">
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span style="font-weight: 700; font-size: 13px">${r.lot} · ${r.item}</span><span style="font-size: 12px; color: ${v.t.ink3}">${r.datesStr}</span><span style="font-size: 12px; color: ${v.t.ink3}">${r.outStr} out → ${r.backStr} back</span></div>
<span style="font-size: 12px; font-weight: 700; color: ${r.resultColor}; white-space: nowrap">${r.result}</span>
</div>
`)}
</div>
</div>
` : null}

${(v.isProduct) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; overflow-y: auto; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px">
<div style="border-radius: 20px; border: 1px solid ${v.t.border}; background: ${v.t.hero}; padding: 18px; display: flex; flex-direction: column; gap: 8px">
<div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">In stock</div>
<div style="display: flex; align-items: baseline; gap: 6px"><span style="font-size: 36px; font-weight: 800; letter-spacing: -0.02em">${v.selProduct.stock}</span><span style="font-size: 16px; font-weight: 600; color: ${v.t.ink2}">pieces</span></div>
<div style="font-size: 13px; color: ${v.t.ink2}">${v.selProduct.valueStr} at cost · average ${v.selProduct.avgStr} per piece</div>
</div>
<div style="font-weight: 700">Batches, newest first</div>
${(v.selProduct.cards || []).map((bc, $index) => html`
<button onClick=${bc.open} style="width: 100%; text-align: left; border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}; padding: 14px; display: flex; flex-direction: column; gap: 10px">
<span style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 8px"><span style="font-weight: 800; font-size: 15px">${bc.id}</span><span style="font-size: 12px; color: ${v.t.ink2}; font-weight: 600">Received ${bc.receivedStr}</span></span>
<span style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; width: 100%; font-size: 12px">
<span style="display: flex; flex-direction: column"><span style="color: ${v.t.ink3}">Batch size</span><span style="font-weight: 700; font-size: 14px">${bc.made} pcs</span></span>
<span style="display: flex; flex-direction: column"><span style="color: ${v.t.ink3}">In stock</span><span style="font-weight: 700; font-size: 14px">${bc.stock} pcs</span></span>
<span style="display: flex; flex-direction: column"><span style="color: ${v.t.ink3}">Per piece</span><span style="font-weight: 700; font-size: 14px">${bc.perStr}</span></span>
</span>
<span style="display: flex; justify-content: space-between; width: 100%; gap: 8px; font-size: 12px"><span style="color: ${v.t.ink3}">Batch cost ${bc.totalStr}</span><span style="font-weight: 700; color: ${bc.deltaColor}">${bc.delta}</span></span>
</button>
`)}
</div>
` : null}

${(v.isPayouts) ? html`
<div style="position: absolute; left: 0; right: 0; top: 47px; bottom: 84px; display: flex; flex-direction: column">
<div style="flex: none; padding: 14px 16px 8px">
<div style="font-weight: 800; font-size: 22px; letter-spacing: -0.01em">Payouts</div>
<div style="font-size: 13px; color: ${v.t.ink3}">Money out from your business account</div>
</div>
<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 4px 16px 24px; display: flex; flex-direction: column; gap: 14px">
<div style="border-radius: 20px; border: 1px solid ${v.t.border}; background: ${v.t.hero}; padding: 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
<div><div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">Paid in Oct</div><div style="font-size: 17px; font-weight: 800">${v.paySum.paid}</div></div>
<div><div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">On hold</div><div style="font-size: 17px; font-weight: 800; color: ${v.paySum.holdColor}">${v.paySum.hold}</div></div>
<div><div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">TDS in Oct</div><div style="font-size: 17px; font-weight: 800">${v.paySum.tds}</div></div>
</div>
<div role="radiogroup" aria-label="Filter payouts" style="display: flex; gap: 8px">
${(v.payFilters || []).map((pf, $index) => html`
<button role="radio" aria-checked=${pf.checked} onClick=${pf.pick} style=${pf.style}>${pf.label}</button>
`)}
</div>
${(v.payRows || []).map((pr, $index) => html`
<button onClick=${pr.open} style="width: 100%; text-align: left; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}">
<span style="flex: none; width: 40px; height: 40px; border-radius: 999px; background: ${v.t.surface2}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: ${v.t.ink2}">${pr.initials}</span>
<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px">
<span style="font-weight: 700; font-size: 14px">${pr.who}</span>
<span style="font-size: 12px; color: ${v.t.ink3}">${pr.sub}</span>
<span style="font-size: 12px; color: ${pr.tagColor}; font-weight: 600">${pr.tag}</span>
</span>
<span style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; white-space: nowrap"><span style="font-weight: 800">${pr.amount}</span><span style=${pr.pillStyle}>${pr.status}</span></span>
</button>
`)}
${(v.payEmpty) ? html`
<div style="padding: 16px; border-radius: 16px; border: 1px dashed ${v.t.border}; color: ${v.t.ink2}; font-size: 13px">Nothing on hold. When you hold a line on a job worker's bill, it waits here until a revised bill comes.</div>
` : null}
<div style="font-size: 12px; color: ${v.t.ink3}">Amounts are after TDS. GST 5% and TDS 1% are illustrative rates for this demo.</div>
</div>
</div>
` : null}

${(v.isGst) ? html`
<div style="position: absolute; left: 0; right: 0; top: 47px; bottom: 84px; display: flex; flex-direction: column">
<div style="flex: none; padding: 14px 16px 8px">
<div style="font-weight: 800; font-size: 22px; letter-spacing: -0.01em">GST</div>
<div style="font-size: 13px; color: ${v.t.ink3}">Input credit on purchase and job-work bills, checked against vendor filings</div>
</div>
<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 4px 16px 24px; display: flex; flex-direction: column; gap: 14px">
<div role="radiogroup" aria-label="Month" style="display: flex; gap: 8px">
${(v.gstPeriods || []).map((gp, $index) => html`
<button role="radio" aria-checked=${gp.checked} onClick=${gp.pick} style=${gp.style}>${gp.label}</button>
`)}
</div>
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.hero}; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px">
<span style="font-size: 13px; color: ${v.t.ink2}; font-weight: 700">${v.gstHero.label}</span>
<span style="display: flex; align-items: baseline; gap: 1px; white-space: nowrap"><span style="font-size: 14px; font-weight: 600; color: ${v.t.ink2}">₹</span><span style="font-size: 22px; font-weight: 800; letter-spacing: -0.01em">${v.gstHero.big.w}</span><span style="font-size: 13px; font-weight: 600; color: ${v.t.ink2}">${v.gstHero.big.d}</span></span>
</div>
<div style="display: flex; gap: 6px; flex-wrap: wrap">
${(v.gstHero.rows || []).map((gh, $index) => html`
<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: ${v.t.surface}; border: 1px solid ${v.t.border}; font-size: 12px; white-space: nowrap"><span style=${gh.dotStyle}></span><span style="color: ${v.t.ink2}">${gh.label}</span><span style="font-weight: 700; color: ${gh.color}">${gh.amount}</span></span>
`)}
</div>
</div>
<div style="font-weight: 700">Vendors</div>
${(v.gstVendors || []).map((gv, $index) => html`
<button onClick=${gv.open} style="width: 100%; text-align: left; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}">
<span style="flex: none; width: 40px; height: 40px; border-radius: 999px; background: ${v.t.surface2}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: ${v.t.ink2}">${gv.initials}</span>
<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px">
<span style="font-weight: 700; font-size: 15px">${gv.name}</span>
<span style="font-size: 13px; color: ${v.t.ink2}">${gv.sub}</span>
</span>
<span style=${gv.pillStyle}>${gv.pill}</span>
</button>
`)}
<div style="font-size: 12px; color: ${v.t.ink3}">Demo data. In production this reads your vendors' filings through a GST service provider's API. Input credit can generally be claimed only once the vendor's bill shows in your GSTR-2B — confirm with your CA.</div>
</div>
</div>
` : null}

${(v.isGstVendor) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; overflow-y: auto; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px">
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.hero}; padding: 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
<div><div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">GST on bills</div><div style="font-size: 16px; font-weight: 800">${v.selGst.totalStr}</div></div>
<div><div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">Matched</div><div style="font-size: 16px; font-weight: 800; color: ${v.t.okFg}">${v.selGst.matchedStr}</div></div>
<div><div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">To fix</div><div style="font-size: 16px; font-weight: 800; color: ${v.selGst.fixColor}">${v.selGst.fixStr}</div></div>
</div>
${(v.selGst.bills || []).map((gb, $index) => html`
<div style="border-radius: 16px; border: 1px solid ${gb.borderColor}; background: ${v.t.surface}; padding: 14px; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px"><span><span style="font-weight: 700">Bill ${gb.no}</span> <span style="font-size: 13px; color: ${v.t.ink3}">· ${gb.date}</span></span><span style=${gb.pillStyle}>${gb.status}</span></div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; font-size: 12px">
<div><div style="color: ${v.t.ink3}">Taxable</div><div style="font-weight: 700; font-size: 13px">${gb.taxStr}</div></div>
<div><div style="color: ${v.t.ink3}">GST on bill</div><div style="font-weight: 700; font-size: 13px">${gb.gstStr}</div></div>
<div><div style="color: ${v.t.ink3}">Vendor filed</div><div style="font-weight: 700; font-size: 13px; color: ${gb.filedColor}">${gb.filedStr}</div></div>
</div>
<div style="font-size: 13px; color: ${v.t.ink2}">${gb.explain}</div>
${(gb.hasAction) ? html`
<button onClick=${gb.act} style="height: 44px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface2}; color: ${v.t.ink}; font-weight: 700">${gb.actLabel}</button>
` : null}
</div>
`)}
</div>
` : null}

${(v.isTab) ? html`
<nav aria-label="Main" style="position: absolute; left: 0; right: 0; bottom: 0; height: 84px; box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border-top: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 6px 2px 28px; z-index: 4">
<button onClick=${v.goHome} aria-current=${v.navHomeCur} style=${v.navHomeStyle}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5V21H3z"></path></svg>Home</button>
<button onClick=${v.openInventory} aria-current=${v.navInvCur} style=${v.navInvStyle}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"></path><path d="M3 8l9 5 9-5M12 13v8"></path></svg>Inventory</button>
<button onClick=${v.openPayouts} aria-current=${v.navPayCur} style=${v.navPayStyle}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"></path></svg>Payouts</button>
<button onClick=${v.openGst} aria-current=${v.navGstCur} style=${v.navGstStyle}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"></path><path d="M9 14l6-6"></path><circle cx="9.5" cy="8.5" r="1"></circle><circle cx="14.5" cy="13.5" r="1"></circle></svg>GST</button>
<button style=${v.navOffStyle}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="5" cy="12" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle></svg>More</button>
</nav>
` : null}

${(v.isFlow) ? html`
<div style="position: absolute; left: 0; right: 0; top: 47px; height: 64px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-end; background: ${v.t.bg}; z-index: 3">
<div style="display: flex; align-items: center; gap: 4px; padding: 0 8px 8px">
<button onClick=${v.back} aria-label="Back" style="width: 44px; height: 44px; border: none; background: transparent; color: ${v.t.ink}; display: flex; align-items: center; justify-content: center">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
</button>
<div style="flex: 1; min-width: 0">
<div style="font-weight: 700; font-size: 16px">${v.flowTitle}</div>
<div style="font-size: 12px; color: ${v.t.ink3}">${v.flowSub}</div>
</div>
</div>
<div style="height: 3px; background: ${v.t.surface2}">
<div style="height: 3px; width: ${v.stepPct}; background: ${v.accent}"></div>
</div>
</div>
` : null}

${(v.isSnap) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; overflow-y: auto; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px">
<div style="border: 1.5px dashed ${v.t.ink3}; border-radius: 20px; padding: 28px 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; background: ${v.t.surface}">
<div style="width: 56px; height: 56px; border-radius: 16px; background: ${v.t.surface2}; display: flex; align-items: center; justify-content: center; color: ${v.t.ink2}">
<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
</div>
<div style="font-weight: 700; font-size: 16px">Snap the job worker's bill</div>
<div style="font-size: 13px; color: ${v.t.ink2}; max-width: 270px">Printed or handwritten. Lines are read and matched to the lots you sent.</div>
<button disabled=${true} style="margin-top: 4px; height: 44px; padding: 0 18px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface2}; color: ${v.t.ink3}; font-weight: 600">Open camera (off in demo)</button>
</div>
<div style="display: flex; align-items: center; gap: 12px; color: ${v.t.ink3}; font-size: 12px; font-weight: 700"><div style="flex: 1; height: 1px; background: ${v.t.border}"></div>OR PICK A SAMPLE BILL<div style="flex: 1; height: 1px; background: ${v.t.border}"></div></div>
${(v.samples || []).map((b, $index) => html`
<button onClick=${b.pick} style="width: 100%; text-align: left; display: flex; gap: 14px; align-items: center; padding: 12px; border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}">
<div style="flex: none; width: 64px; height: 80px; border-radius: 6px; background: #F7F3EA; color: #2B2B2B; padding: 6px; box-sizing: border-box; font-size: 8px; line-height: 1.3; font-family: ${b.paperFont}; overflow: hidden">
<div style="font-weight: 700; font-size: 9px">${b.worker}</div>
<div>${b.billNo}</div>
<div style="margin-top: 4px; border-top: 1px solid #C9C2B3; padding-top: 3px">${b.miniLine1}</div>
<div>${b.miniLine2}</div>
</div>
<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px">
<div style="font-weight: 700; font-size: 15px">${b.worker}</div>
<div style="font-size: 13px; color: ${v.t.ink2}">${b.billNo} · ${b.date} · ${b.kind}</div>
<div style="font-size: 13px; color: ${v.t.ink3}">${b.totalStr} billed · ${b.lineCount} lines</div>
</div>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color: ${v.t.ink3}"><path d="M9 18l6-6-6-6"></path></svg>
</button>
`)}
</div>
` : null}

${(v.isRead) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; display: flex; flex-direction: column">
<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; gap: 12px; align-items: stretch">
<div style="flex: none; width: 112px; border-radius: 8px; background: #F7F3EA; color: #2B2B2B; padding: 10px; box-sizing: border-box; font-family: ${v.bill.paperFont}; font-size: 11px; line-height: 1.35; box-shadow: 0 1px 0 rgba(0,0,0,0.08)">
<div style="font-weight: 700; font-size: 12px">${v.bill.worker}</div>
<div>${v.bill.billNo}</div>
<div>${v.bill.date}</div>
<div style="margin-top: 6px; border-top: 1px solid #C9C2B3; padding-top: 4px">
${(v.lines || []).map((l, $index) => html`<div>${l.readText}</div>`)}
</div>
<div style="margin-top: 6px; font-weight: 700">Total ${v.billTotalStr}</div>
</div>
<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; justify-content: center">
${(v.reading) ? html`
<div style="display: flex; flex-direction: column; gap: 8px">
<div style="font-weight: 700">Reading bill…</div>
<div style="height: 10px; border-radius: 6px; background: ${v.t.surface2}; width: 90%"></div>
<div style="height: 10px; border-radius: 6px; background: ${v.t.surface2}; width: 70%"></div>
<div style="height: 10px; border-radius: 6px; background: ${v.t.surface2}; width: 80%"></div>
</div>
` : null}
${(v.readDone) ? html`
<div style="display: flex; flex-direction: column; gap: 6px">
<span style="align-self: flex-start; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: ${v.t.infoBg}; color: ${v.t.infoFg}">Read by AI</span>
<div style="font-weight: 700; font-size: 15px">${v.readHeadline}</div>
<div style="font-size: 12px; color: ${v.t.ink2}">${v.readSub}</div>
</div>
` : null}
</div>
</div>

${(v.readDone) ? html`
<div style="display: flex; flex-direction: column; gap: 14px">
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 4px 14px">
<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${v.t.border}"><span style="color: ${v.t.ink2}">Job worker</span><span style="font-weight: 600">${v.bill.worker} <span style="color: ${v.t.okFg}">✓</span></span></div>
<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${v.t.border}"><span style="color: ${v.t.ink2}">Bill</span><span style="font-weight: 600">${v.bill.billNo} · ${v.bill.date}</span></div>
<div style="display: flex; justify-content: space-between; padding: 10px 0"><span style="color: ${v.t.ink2}">GST on bill</span><span style="font-weight: 600">${v.bill.gst}%</span></div>
</div>
<div style="font-weight: 700">Lines and the lots they belong to</div>
${(v.lines || []).map((l, $index) => html`
<div style="border-radius: 16px; border: 1px solid ${l.readBorder}; background: ${v.t.surface}; padding: 14px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; justify-content: space-between; gap: 8px">
<span style="color: ${v.t.ink2}">Read as “${l.readText}”</span>
<span style="font-weight: 600">${l.billedChargesStr}</span>
</div>
<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
<span style="font-size: 12px; color: ${v.t.ink3}">Linked to</span>
<span style="font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: ${v.t.surface2}">${l.lot} · ${l.desc}</span>
<span style="font-size: 12px; color: ${l.linkColor}; font-weight: 600">${l.linkState}</span>
</div>
${(l.needsConfirm) ? html`
<div style="border-radius: 12px; background: ${v.t.warnBg}; padding: 12px; display: flex; flex-direction: column; gap: 10px">
<div style="font-size: 13px; color: ${v.t.ink}">Handwriting is unclear. Is this lot <b>${l.lot}</b> (${l.desc}, ${l.out} m sent on ${l.sentOn})?</div>
<div style="display: flex; gap: 8px">
<button onClick=${v.confirmLink} style="flex: 1; height: 44px; border-radius: 10px; border: none; background: ${v.accent}; color: #FFFFFF; font-weight: 700">Yes, ${l.lot}</button>
<button style="flex: 1; height: 44px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}; font-weight: 600">Pick another lot</button>
</div>
</div>
` : null}
</div>
`)}
</div>
` : null}
</div>
<div style="flex: none; padding: 12px 16px 34px; border-top: 1px solid ${v.t.border}; background: ${v.t.bg}">
<button onClick=${v.toVerdict} disabled=${v.checkDisabled} style=${v.checkBtnStyle}>Check this bill</button>
</div>
</div>
` : null}

${(v.isVerdict) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; display: flex; flex-direction: column">
<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px">
<div style="border-radius: 20px; padding: 18px; background: ${v.verdictBg}; border: 1px solid ${v.verdictBorder}; display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; align-items: center; gap: 10px">
<div style="width: 36px; height: 36px; border-radius: 999px; background: ${v.verdictColor}; color: ${v.t.bg}; display: flex; align-items: center; justify-content: center">
${(v.allMatch) ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"></path></svg>` : null}
${(v.hasFlags) ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 7v6M12 17h.01"></path></svg>` : null}
</div>
<div style="font-weight: 800; font-size: 18px">${v.verdictTitle}</div>
</div>
<div style="font-size: 13px; color: ${v.t.ink2}">${v.verdictContext}</div>
<div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 12px">
<div>
<div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">${v.payLabel}</div>
<div style="display: flex; align-items: baseline; gap: 2px"><span style="font-size: 18px; font-weight: 600; color: ${v.t.ink2}">₹</span><span style="font-size: 32px; font-weight: 800; letter-spacing: -0.02em">${v.payBig.w}</span><span style="font-size: 16px; font-weight: 600; color: ${v.t.ink2}">${v.payBig.d}</span></div>
</div>
${(v.hasHold) ? html`
<div style="text-align: right">
<div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">On hold</div>
<div style="font-weight: 700; color: ${v.t.warnFg}">${v.holdStr}</div>
</div>
` : null}
</div>
</div>

<div style="font-weight: 700">Checked line by line</div>
${(v.lines || []).map((l, $index) => html`
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 14px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px">
<div><span style="font-weight: 700">${l.lot}</span> <span style="color: ${v.t.ink3}; font-size: 13px">${l.desc}</span></div>
<span style=${l.chipStyle}>${l.chip}</span>
</div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; font-size: 12px">
<div><div style="color: ${v.t.ink3}">Sent</div><div style="font-weight: 700; font-size: 14px">${l.out} m</div></div>
<div><div style="color: ${v.t.ink3}">Came back</div><div style="font-weight: 700; font-size: 14px">${l.back} m</div></div>
<div><div style="color: ${v.t.ink3}">Loss</div><div style="font-weight: 700; font-size: 14px; color: ${l.lossColor}">${l.lossPctStr}</div></div>
</div>
<div style="font-size: 13px; color: ${v.t.ink2}">Billed ${l.billed} m × ₹${v.bill.rate} = ${l.billedChargesStr}</div>
${(l.flags || []).map((fl, $index) => html`
<div style="border-radius: 12px; background: ${v.t.warnBg}; padding: 10px 12px; display: flex; flex-direction: column; gap: 3px">
<div style="font-weight: 700; color: ${v.t.warnFg}; font-size: 13px">${fl.title}</div>
<div style="font-size: 13px; color: ${v.t.ink}">${fl.text}</div>
<div style="font-size: 12px; color: ${v.t.ink2}">${fl.impact}</div>
</div>
`)}
</div>
`)}
</div>
<div style="flex: none; padding: 12px 16px 34px; border-top: 1px solid ${v.t.border}; background: ${v.t.bg}">
<button onClick=${v.toBreakdown} style="width: 100%; height: 52px; border-radius: 12px; border: none; background: ${v.accent}; color: #FFFFFF; font-weight: 700; font-size: 16px">See how it adds up</button>
</div>
</div>
` : null}

${(v.isBreakdown) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; display: flex; flex-direction: column">
<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px">
${(v.flaggedLines || []).map((l, $index) => html`
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 14px; display: flex; flex-direction: column; gap: 10px">
<div style="font-weight: 700">${l.lot}: what should happen to this line?</div>
<div role="radiogroup" aria-label="Choice for this line" style="display: flex; flex-direction: column; gap: 8px">
${(l.options || []).map((o, $index) => html`
<button role="radio" aria-checked=${o.checked} onClick=${o.pick} style=${o.style}>
<span style=${o.dotStyle}></span>
<span style="display: flex; flex-direction: column; gap: 2px; text-align: left">
<span style="font-weight: 700">${o.label}</span>
<span style="font-size: 12px; color: ${v.t.ink2}">${o.help}</span>
</span>
</button>
`)}
</div>
<div style="font-size: 12px; color: ${v.t.ink3}">Extra loss is never deducted automatically. Raise it in the query if you want it made good.</div>
</div>
`)}

<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 4px 14px">
${(v.payLines || []).map((pl, $index) => html`
<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px">
<span style="color: ${v.t.ink2}">${pl.lot} · ${pl.billable} m × ₹${v.bill.rate}</span>
<span style="font-weight: 600">${pl.chargesStr}</span>
</div>
`)}
<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${v.t.border}"><span style="color: ${v.t.ink2}">Charges</span><span style="font-weight: 600">${v.payChargesStr}</span></div>
<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${v.t.border}"><span style="color: ${v.t.ink2}">GST ${v.bill.gst}%</span><span style="font-weight: 600">+ ${v.payGstStr}</span></div>
<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${v.t.border}"><span style="color: ${v.t.ink2}">TDS ${v.bill.tds}% on charges</span><span style="font-weight: 600">− ${v.payTdsStr}</span></div>
<div style="display: flex; justify-content: space-between; align-items: baseline; padding: 12px 0">
<span style="font-weight: 700">Pay now</span>
<span style="display: flex; align-items: baseline; gap: 1px"><span style="font-size: 14px; font-weight: 600; color: ${v.t.ink2}">₹</span><span style="font-size: 24px; font-weight: 800">${v.payBig.w}</span><span style="font-size: 13px; font-weight: 600; color: ${v.t.ink2}">${v.payBig.d}</span></span>
</div>
${(v.hasHold) ? html`
<div style="display: flex; justify-content: space-between; padding: 0 0 12px"><span style="color: ${v.t.ink2}">On hold (stays on the card)</span><span style="font-weight: 700; color: ${v.t.warnFg}">${v.holdStr}</span></div>
` : null}
</div>
<div style="font-size: 12px; color: ${v.t.ink3}">GST ${v.bill.gst}% and TDS ${v.bill.tds}% are illustrative rates for this demo. Every figure is worked out from your lots and the agreed rate of ₹${v.bill.rate}/m — not by AI.</div>
</div>
<div style="flex: none; padding: 12px 16px 34px; border-top: 1px solid ${v.t.border}; background: ${v.t.bg}">
<button onClick=${v.toApprove} style="width: 100%; height: 52px; border-radius: 12px; border: none; background: ${v.accent}; color: #FFFFFF; font-weight: 700; font-size: 16px">Review payout · ${v.payStr}</button>
</div>
</div>
` : null}

${(v.isApprove) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; display: flex; flex-direction: column">
<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px">
<div style="border-radius: 20px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 18px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: center; gap: 12px">
<div style="width: 44px; height: 44px; border-radius: 999px; background: ${v.t.surface2}; display: flex; align-items: center; justify-content: center; font-weight: 700; color: ${v.t.ink2}">${v.bill.initials}</div>
<div><div style="font-weight: 700; font-size: 16px">${v.bill.worker}</div><div style="font-size: 13px; color: ${v.t.ink3}">${v.bill.account}</div></div>
</div>
<div>
<div style="font-size: 12px; color: ${v.t.ink3}; font-weight: 600">You pay</div>
<div style="display: flex; align-items: baseline; gap: 2px"><span style="font-size: 20px; font-weight: 600; color: ${v.t.ink2}">₹</span><span style="font-size: 36px; font-weight: 800; letter-spacing: -0.02em">${v.payBig.w}</span><span style="font-size: 18px; font-weight: 600; color: ${v.t.ink2}">${v.payBig.d}</span></div>
</div>
<div style="display: flex; flex-direction: column; gap: 0; border-top: 1px solid ${v.t.border}">
<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px"><span style="color: ${v.t.ink2}">Bill</span><span style="font-weight: 600">${v.bill.billNo} · ${v.payCountStr}</span></div>
<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px"><span style="color: ${v.t.ink2}">TDS deducted</span><span style="font-weight: 600">${v.payTdsStr}</span></div>
${(v.hasHold) ? html`
<div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px"><span style="color: ${v.t.ink2}">Stays on hold</span><span style="font-weight: 600; color: ${v.t.warnFg}">${v.holdLots} · ${v.holdStr}</span></div>
` : null}
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 8px">
<div style="font-size: 13px; font-weight: 600">OTP sent to ••••90</div>
<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px">
<div style="height: 48px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px">4</div>
<div style="height: 48px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px">2</div>
<div style="height: 48px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px">1</div>
<div style="height: 48px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px">9</div>
<div style="height: 48px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px">0</div>
<div style="height: 48px; border-radius: 10px; border: 1px solid ${v.accent}; background: ${v.t.surface}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px">7</div>
</div>
<div style="font-size: 12px; color: ${v.t.ink3}">Auto-filled for the demo. Nothing is marked paid until the payout succeeds.</div>
</div>
</div>
<div style="flex: none; padding: 12px 16px 34px; border-top: 1px solid ${v.t.border}; background: ${v.t.bg}">
<button onClick=${v.approve} style="width: 100%; height: 52px; border-radius: 12px; border: none; background: ${v.accent}; color: #FFFFFF; font-weight: 700; font-size: 16px">Approve & pay ${v.payStr}</button>
</div>
</div>
` : null}

${(v.isDone) ? html`
<div style="position: absolute; left: 0; right: 0; top: 47px; bottom: 0; display: flex; flex-direction: column">
<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; padding: 8px 0 4px">
<span style=${v.statusPillStyle}>${v.statusLabel}</span>
<div style="display: flex; align-items: baseline; gap: 2px"><span style="font-size: 20px; font-weight: 600; color: ${v.t.ink2}">₹</span><span style="font-size: 36px; font-weight: 800; letter-spacing: -0.02em">${v.doneBig.w}</span><span style="font-size: 18px; font-weight: 600; color: ${v.t.ink2}">${v.doneBig.d}</span></div>
<div style="font-size: 14px; font-weight: 600">to ${v.bill.worker}</div>
<div style="font-size: 13px; color: ${v.t.ink2}; max-width: 300px">${v.statusContext}</div>
</div>

<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 14px; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; justify-content: space-between; align-items: center"><span style="font-weight: 700">Statement for ${v.bill.worker}</span><span style="font-size: 12px; color: ${v.t.ink3}">${v.bill.billNo}</span></div>
${(v.stmtLines || []).map((sl, $index) => html`
<div style="display: flex; justify-content: space-between; gap: 8px; font-size: 13px; padding: 8px 0; border-top: 1px solid ${v.t.border}">
<div style="display: flex; flex-direction: column; gap: 2px"><span style="font-weight: 600">${sl.lot} · ${sl.desc}</span><span style="color: ${v.t.ink3}; font-size: 12px">${sl.detail}</span></div>
<span style="font-weight: 700; color: ${sl.color}; white-space: nowrap">${sl.amount}</span>
</div>
`)}
<div style="display: flex; justify-content: space-between; font-size: 13px; padding-top: 8px; border-top: 1px solid ${v.t.border}"><span style="color: ${v.t.ink2}">Paid today (after TDS ${v.payTdsStr})</span><span style="font-weight: 800">${v.doneStr}</span></div>
<button onClick=${v.shareStatement} style="height: 44px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface2}; color: ${v.t.ink}; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M16 6l-4-4-4 4"></path><path d="M12 2v13"></path></svg>
Share statement</button>
</div>

${(v.showQuery) ? html`
<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 14px; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; justify-content: space-between; align-items: center">
<span style="font-weight: 700">Query for the held line</span>
<span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: ${v.t.infoBg}; color: ${v.t.infoFg}">Drafted by AI · edit before sending</span>
</div>
<div role="radiogroup" aria-label="Language" style="display: flex; gap: 8px">
<button role="radio" aria-checked=${v.langEnChecked} onClick=${v.setEn} style=${v.langEnStyle}>English</button>
<button role="radio" aria-checked=${v.langHiChecked} onClick=${v.setHi} style=${v.langHiStyle}>हिंदी</button>
</div>
<div style="font-size: 14px; line-height: 1.55; padding: 12px; border-radius: 12px; background: ${v.t.surface2}">${v.queryText}</div>
<button onClick=${v.shareQuery} style="height: 44px; border-radius: 10px; border: none; background: ${v.accent}; color: #FFFFFF; font-weight: 700">Send query</button>
</div>
` : null}
</div>
<div style="flex: none; padding: 12px 16px 34px; border-top: 1px solid ${v.t.border}; background: ${v.t.bg}; display: flex; gap: 10px">
<button onClick=${v.goHome} style="flex: 1; height: 52px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}; font-weight: 700">Back to home</button>
${(v.hasNextBill) ? html`
<button onClick=${v.nextBill} style="flex: 1; height: 52px; border-radius: 12px; border: none; background: ${v.accent}; color: #FFFFFF; font-weight: 700">Check next bill</button>
` : null}
</div>
</div>
` : null}

${(v.isChallan) ? html`
<div style="position: absolute; left: 0; right: 0; top: 111px; bottom: 0; display: flex; flex-direction: column">
<div style="flex: 1; min-height: 0; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px">
${(v.challanForm) ? html`
<div style="display: flex; flex-direction: column; gap: 16px">
<div style="font-size: 13px; color: ${v.t.ink2}">The delivery challan you need anyway becomes the record that bills are checked against. Only goods in your store can be sent.</div>

<div style="display: flex; flex-direction: column; gap: 8px">
<div style="font-size: 12px; font-weight: 700; color: ${v.t.ink2}; text-transform: uppercase; letter-spacing: 0.03em">Send to</div>
<div role="radiogroup" aria-label="Job worker" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
${(v.cfAgencies || []).map((ca, $index) => html`
<button role="radio" aria-checked=${ca.checked} onClick=${ca.pick} style=${ca.style}>
<span style="font-weight: 700; font-size: 14px">${ca.name}</span>
<span style="font-size: 12px; color: ${v.t.ink3}">${ca.process}</span>
</button>
`)}
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 8px">
<div style="font-size: 12px; font-weight: 700; color: ${v.t.ink2}; text-transform: uppercase; letter-spacing: 0.03em">From your store</div>
<div role="radiogroup" aria-label="Goods to send" style="display: flex; flex-direction: column; gap: 8px">
${(v.cfItems || []).map((ci, $index) => html`
<button role="radio" aria-checked=${ci.checked} aria-disabled=${ci.ariaDisabled} disabled=${ci.disabled} onClick=${ci.pick} style=${ci.style}>
<span style=${ci.dotStyle}></span>
<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; text-align: left">
<span style="font-weight: 700; font-size: 14px">${ci.name}</span>
<span style="font-size: 12px; color: ${v.t.ink3}">${ci.kind}</span>
</span>
<span style="font-size: 13px; font-weight: 700; color: ${ci.availColor}; white-space: nowrap">${ci.availStr}</span>
</button>
`)}
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 8px">
<div style="font-size: 12px; font-weight: 700; color: ${v.t.ink2}; text-transform: uppercase; letter-spacing: 0.03em">Quantity</div>
<div style="display: flex; align-items: center; gap: 10px">
<button onClick=${v.cfDec} aria-label="Decrease by 50 metres" style="width: 48px; height: 48px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}; font-size: 22px; font-weight: 700">−</button>
<div style="flex: 1; height: 48px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; display: flex; align-items: center; justify-content: center; gap: 4px"><span style="font-size: 22px; font-weight: 800">${v.cfQty}</span><span style="font-size: 14px; color: ${v.t.ink2}; font-weight: 600">m</span></div>
<button onClick=${v.cfInc} aria-label="Increase by 50 metres" style="width: 48px; height: 48px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}; font-size: 22px; font-weight: 700">+</button>
<button onClick=${v.cfMax} style="height: 48px; padding: 0 14px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface2}; color: ${v.t.ink}; font-weight: 700">All</button>
</div>
<div style="font-size: 13px; font-weight: 600; color: ${v.cfHelpColor}">${v.cfHelp}</div>
</div>

<div style="border-radius: 16px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 4px 14px">
<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px"><span style="color: ${v.t.ink2}">Value of goods (at cost)</span><span style="font-weight: 700">${v.cfValueStr}</span></div>
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 10px 0; font-size: 13px"><span style="color: ${v.t.ink2}">Process and agreed rate</span><span style="font-weight: 700; text-align: right">${v.cfRate}</span></div>
</div>
</div>
` : null}
${(v.challanDone) ? html`
<div style="border-radius: 20px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; padding: 18px; display: flex; flex-direction: column; gap: 12px">
<span style="align-self: flex-start; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: ${v.t.okBg}; color: ${v.t.okFg}">Challan created</span>
<div style="font-weight: 800; font-size: 20px">${v.lastCh.ch} · Lot ${v.lastCh.lot}</div>
<div style="font-size: 14px; color: ${v.t.ink2}">${v.lastCh.summary}</div>
<div style="display: flex; justify-content: space-between; font-size: 13px; padding: 10px 0; border-top: 1px solid ${v.t.border}"><span style="color: ${v.t.ink2}">Left in your store</span><span style="font-weight: 700">${v.lastCh.leftStr}</span></div>
<div style="border-radius: 12px; background: ${v.t.surface2}; padding: 12px; display: flex; flex-direction: column; gap: 4px">
<div style="font-weight: 700; font-size: 13px">Return clock started</div>
<div style="font-size: 13px; color: ${v.t.ink2}">${v.lastCh.clock}</div>
</div>
<div style="font-size: 13px; color: ${v.t.ink2}">${v.lastCh.next}</div>
</div>

<div style="border-radius: 20px; border: 1px solid ${v.ewbBorder}; background: ${v.t.surface}; padding: 18px; display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px">
<span style="font-weight: 800; font-size: 16px">E-way bill</span>
<span style=${v.ewbPillStyle}>${v.ewbPill}</span>
</div>
<div style="font-size: 13px; color: ${v.t.ink2}">${v.ewbReason}</div>

${(v.ewbNone) ? html`
<button onClick=${v.startEwb} style=${v.ewbStartStyle}>Create e-way bill from this challan</button>
` : null}

${(v.ewbForm) ? html`
<div style="display: flex; flex-direction: column; gap: 12px">
<div style="font-size: 12px; color: ${v.t.ink3}">Filled in from challan ${v.lastCh.ch}. Check before generating.</div>
<div style="border-radius: 12px; border: 1px solid ${v.t.border}; padding: 2px 12px">
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px"><span style="color: ${v.t.ink2}">Supply type</span><span style="font-weight: 600; text-align: right">Outward · Job work</span></div>
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px"><span style="color: ${v.t.ink2}">Document</span><span style="font-weight: 600; text-align: right">Delivery challan ${v.lastCh.ch}</span></div>
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px"><span style="color: ${v.t.ink2}">From → to</span><span style="font-weight: 600; text-align: right">Mehta Fashions → ${v.lastCh.agName}</span></div>
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px"><span style="color: ${v.t.ink2}">GSTINs</span><span style="font-weight: 600; text-align: right">From your and the job worker's profiles</span></div>
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px"><span style="color: ${v.t.ink2}">Goods</span><span style="font-weight: 600; text-align: right">${v.lastCh.goods}</span></div>
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${v.t.border}; font-size: 13px"><span style="color: ${v.t.ink2}">HSN</span><span style="font-weight: 600; text-align: right">From your item master</span></div>
<div style="display: flex; justify-content: space-between; gap: 10px; padding: 9px 0; font-size: 13px"><span style="color: ${v.t.ink2}">Value</span><span style="font-weight: 600; text-align: right">${v.lastCh.valueStr}</span></div>
</div>
<div style="display: flex; flex-direction: column; gap: 6px">
<div style="font-size: 12px; font-weight: 700; color: ${v.t.ink2}; text-transform: uppercase; letter-spacing: 0.03em">Transport</div>
<div role="radiogroup" aria-label="Transport" style="display: flex; gap: 8px">
<button role="radio" aria-checked=${v.ewbOwnChecked} onClick=${v.ewbOwn} style=${v.ewbOwnStyle}>Own vehicle</button>
<button role="radio" aria-checked=${v.ewbTptChecked} onClick=${v.ewbTpt} style=${v.ewbTptStyle}>Transporter</button>
</div>
</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">
<div style="display: flex; flex-direction: column; gap: 6px"><label for="ewv" style="font-size: 12px; font-weight: 600; color: ${v.t.ink2}">${v.ewbVehicleLabel}</label><input id="ewv" readonly value=${v.ewbVehicle} style="height: 44px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface2}; color: ${v.t.ink}; padding: 0 12px; min-width: 0" /></div>
<div style="display: flex; flex-direction: column; gap: 6px"><label for="ewd" style="font-size: 12px; font-weight: 600; color: ${v.t.ink2}">Distance</label><input id="ewd" readonly value=${v.lastCh.distance} style="height: 44px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface2}; color: ${v.t.ink}; padding: 0 12px; min-width: 0" /></div>
</div>
<button onClick=${v.genEwb} style="height: 48px; border-radius: 12px; border: none; background: ${v.accent}; color: #FFFFFF; font-weight: 700; font-size: 15px">Generate e-way bill</button>
<div style="font-size: 12px; color: ${v.t.ink3}">Demo only. In production this files through a GST service provider's e-way bill API; nothing is sent to the GST portal here.</div>
</div>
` : null}

${(v.ewbDone) ? html`
<div style="display: flex; flex-direction: column; gap: 10px">
<div style="border-radius: 12px; background: ${v.t.okBg}; padding: 12px; display: flex; flex-direction: column; gap: 4px">
<div style="font-size: 12px; font-weight: 700; color: ${v.t.okFg}">Generated · demo number</div>
<div style="font-size: 20px; font-weight: 800; letter-spacing: 0.04em">${v.ewbNo}</div>
<div style="font-size: 13px; color: ${v.t.ink2}">Linked to ${v.lastCh.ch} · ${v.ewbVehicle} · ${v.lastCh.distance}. Validity is set by the portal from the distance.</div>
</div>
<button onClick=${v.shareEwb} style="height: 44px; border-radius: 10px; border: 1px solid ${v.t.border}; background: ${v.t.surface2}; color: ${v.t.ink}; font-weight: 700">Share with driver</button>
</div>
` : null}
</div>
` : null}
</div>
<div style="flex: none; padding: 12px 16px 34px; border-top: 1px solid ${v.t.border}; background: ${v.t.bg}">
${(v.challanForm) ? html`
<button onClick=${v.createChallan} disabled=${v.cfDisabled} style=${v.cfBtnStyle}>${v.cfBtnLabel}</button>
` : null}
${(v.challanDone) ? html`
<button onClick=${v.goHome} style="width: 100%; height: 52px; border-radius: 12px; border: 1px solid ${v.t.border}; background: ${v.t.surface}; color: ${v.t.ink}; font-weight: 700; font-size: 16px">Done</button>
` : null}
</div>
</div>
` : null}

${(v.hasToast) ? html`
<div role="status" style="position: absolute; left: 24px; right: 24px; bottom: 96px; padding: 12px 16px; border-radius: 12px; background: #0E1A3A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-align: center; z-index: 10">${v.toast}</div>
` : null}

</div>`;
  }
}
