import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { createQuotation } from '../lib/quotations';
import { useAuth } from '../contexts/AuthContext';
import type { QuotationItem, QuotationSubItem } from '../types';

// ── local form types ──────────────────────────────────────────────────────────
interface SubRow { desc: string; size: string; unitPrice: string; qty: string; }
interface Item   { name: string; subs: SubRow[]; }

const EMPTY_SUB: SubRow = { desc: '', size: '', unitPrice: '', qty: '1' };

function calcSubtotal(items: Item[]): number {
  return items.reduce((acc, item) =>
    acc + item.subs.reduce((a, s) => a + (parseFloat(s.unitPrice) || 0) * (parseFloat(s.qty) || 0), 0)
  , 0);
}

function fmtINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string): string {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}-${m}-${y}`;
}

// ── PDF generation (mirrors quotation.html logic) ─────────────────────────────

function buildPdfHtml(params: {
  custName: string; custPlace: string; qNo: string; hsn: string;
  qDate: string; qValid: string; approvedBy: string; approverPhone: string;
  packing: number; gstPct: number; items: Item[];
}): string {
  const { custName, custPlace, qNo, hsn, qDate, qValid, approvedBy, approverPhone, packing, gstPct, items } = params;

  let subtotal = 0;
  let itemsHtml = '';
  let specsHtml = '';
  const subLabels = ['a','b','c','d','e','f','g','h','i','j'];

  items.forEach((item, i) => {
    let itemTotal = 0;
    item.subs.forEach(s => { itemTotal += (parseFloat(s.unitPrice)||0) * (parseFloat(s.qty)||0); });
    subtotal += itemTotal;

    itemsHtml += `<div style="display:grid;grid-template-columns:32px 1fr 100px 50px 100px;border-bottom:1px solid #f0f0f0;">
      <div style="padding:8px;color:#1a1a1a;font-weight:700;">${i+1}.</div>
      <div style="padding:8px;font-weight:600;color:#1a1a1a;">${esc(item.name)}</div>
      <div></div><div></div><div></div>
    </div>`;

    item.subs.forEach((sub, j) => {
      const amt = (parseFloat(sub.unitPrice)||0) * (parseFloat(sub.qty)||0);
      itemsHtml += `<div style="display:grid;grid-template-columns:32px 1fr 100px 50px 100px;border-bottom:1px solid #f8f8f8;">
        <div style="padding:6px 8px;color:#e85d04;font-weight:700;">${subLabels[j]??j+1}.</div>
        <div style="padding:6px 8px;font-size:12px;color:#333;">${esc(sub.desc)}${sub.size ? `<br><span style="color:#888;font-size:11px;">Size: ${esc(sub.size)}</span>` : ''}</div>
        <div style="padding:6px 8px;text-align:right;font-size:12px;">${sub.unitPrice ? fmtINRraw(parseFloat(sub.unitPrice)||0) : ''}</div>
        <div style="padding:6px 8px;text-align:center;font-size:12px;">${sub.qty||''}</div>
        <div style="padding:6px 8px;text-align:right;font-size:12px;font-weight:600;">${amt>0 ? fmtINRraw(amt) : ''}</div>
      </div>`;
    });

    specsHtml += `<div style="margin:18px 32px 0;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
      <div style="display:flex;justify-content:space-between;align-items:center;background:#f7f7f7;padding:8px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#555;border-bottom:1px solid #e0e0e0;">
        <span>ITEM ${i+1}</span>
        <span style="font-size:12px;color:#e85d04;font-weight:700;text-transform:none;letter-spacing:0;">${esc(item.name)}</span>
      </div>
      <div style="display:flex;">
        <div style="width:160px;min-height:120px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-right:1px solid #e0e0e0;font-size:11px;color:#aaa;">No image</div>
        <div style="padding:14px 16px;flex:1;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.08em;margin-bottom:8px;">SPECIFICATIONS</div>
          <ul style="list-style:none;padding:0;">
            ${item.subs.filter(s=>s.desc).map(sub =>
              `<li style="font-size:11px;color:#333;margin-bottom:5px;display:flex;flex-wrap:wrap;align-items:center;gap:5px;">
                <span style="color:#e85d04;font-weight:900;margin-right:4px;">•</span>
                <strong>${esc(sub.desc)}</strong>
                ${sub.size ? `<span style="display:inline-block;border:1px solid #ccc;border-radius:4px;padding:1px 7px;font-size:10px;color:#333;font-weight:600;">${esc(sub.size)} × ${sub.qty||1} Nos</span>` : ''}
              </li>`
            ).join('')}
          </ul>
        </div>
      </div>
    </div>`;
  });

  const gstAmt = (subtotal + packing) * gstPct / 100;
  const grand  = subtotal + packing + gstAmt;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Quotation — ${esc(qNo)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; font-size: 14px; background: #f4f4f4; }
  .page { background: #fff; width: 850px; margin: 32px auto; box-shadow: 0 4px 24px rgba(0,0,0,.12); border-radius: 4px; }
  @media print {
    body { background: #fff; }
    .page { box-shadow: none; margin: 0; width: 100%; page-break-after: always; }
    .page:last-child { page-break-after: avoid; }
  }
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page">
  <div style="height:6px;background:linear-gradient(90deg,#e85d04,#ff8c42);"></div>

  <div style="text-align:center;padding:28px 40px 20px;border-bottom:2px solid #f0f0f0;">
    <h2 style="font-size:26px;font-weight:900;letter-spacing:.08em;color:#1a1a1a;text-transform:uppercase;">Quotation</h2>
  </div>

  <div style="text-align:center;padding:20px 40px 16px;border-bottom:1px solid #f0f0f0;">
    <div style="font-size:22px;font-weight:900;letter-spacing:.12em;color:#1a1a1a;text-transform:uppercase;">ANTIQUE 🪷 DESIGNS</div>
    <div style="font-size:12px;color:#888;margin-top:4px;letter-spacing:.06em;">Vintage inspired decorative metal art</div>
    <div style="font-size:11px;color:#aaa;margin-top:6px;">#39/1 CHANNENAHALLI, KADABAGERE POST, MAGADI MAIN ROAD, BANGALORE SOUTH - 562130</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid #f0f0f0;">
    <div style="padding:10px 20px;border-right:1px solid #f0f0f0;font-size:12px;">
      <span style="color:#888;">GST: </span><strong>29ABTFA2399G1ZT</strong>
    </div>
    <div style="padding:10px 20px;border-right:1px solid #f0f0f0;text-align:center;font-size:13px;font-weight:700;">
      ${esc(qNo)}
    </div>
    <div style="padding:10px 20px;font-size:12px;text-align:right;">
      <span style="color:#888;">EMAIL: </span><strong>hello@antique-designs.com</strong>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid #f0f0f0;">
    <div style="padding:10px 20px;border-right:1px solid #f0f0f0;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:3px;">Approved By</div>
      <div style="font-size:13px;font-weight:700;">${esc(approvedBy)} (${esc(approverPhone)})</div>
    </div>
    <div style="padding:10px 20px;border-right:1px solid #f0f0f0;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:3px;">HSN Code</div>
      <div style="font-size:13px;font-weight:700;">${esc(hsn)}</div>
    </div>
    <div style="padding:10px 20px;display:grid;grid-template-columns:1fr 1fr;">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:3px;">Date</div>
        <div style="font-size:13px;font-weight:700;">${fmtDate(qDate)}</div>
      </div>
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:3px;">Valid Until</div>
        <div style="font-size:13px;font-weight:700;">${fmtDate(qValid)}</div>
      </div>
    </div>
  </div>

  <div style="padding:14px 24px;border-bottom:2px solid #f0f0f0;font-size:13px;">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:6px;">Bill To</div>
    <div><span style="color:#888;">Name:</span> <strong>${custName.toUpperCase()}</strong></div>
    <div style="margin-left:24px;margin-top:2px;"><span style="color:#888;">Place:</span> <strong>${custPlace.toUpperCase()}</strong></div>
  </div>

  <!-- Items table -->
  <div style="margin:0;">
    <div style="display:grid;grid-template-columns:32px 1fr 100px 50px 100px;background:#f7f7f7;border-bottom:2px solid #e0e0e0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;">
      <div style="padding:10px 8px;">#</div>
      <div style="padding:10px 8px;">Description</div>
      <div style="padding:10px 8px;text-align:right;">Unit Price</div>
      <div style="padding:10px 8px;text-align:center;">Qty</div>
      <div style="padding:10px 8px;text-align:right;">Amount</div>
    </div>
    ${itemsHtml || '<div style="padding:20px;text-align:center;color:#aaa;font-size:12px;">No items</div>'}
  </div>

  <!-- Totals + Bank -->
  <div style="display:grid;grid-template-columns:1fr 260px;border-top:2px solid #f0f0f0;margin-top:8px;">
    <div style="padding:16px 20px;border-right:1px solid #f0f0f0;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:8px;">Bank Details</div>
      ${[['Bank','UNION BANK OF INDIA'],['A/C No','317225140000004'],['IFSC','UBIN0931721'],['Branch','CHANNENAHALLI']].map(([k,v])=>
        `<div style="display:flex;gap:10px;font-size:12px;margin-bottom:3px;"><span style="color:#888;min-width:52px;">${k}</span><span style="font-weight:600;">${v}</span></div>`
      ).join('')}
    </div>
    <div style="padding:16px 20px;">
      ${[['Subtotal', fmtINR(subtotal)],['Packing & Transport', fmtINR(packing)],[`GST (${gstPct}%)`, fmtINR(gstAmt)]].map(([l,v])=>
        `<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;"><span style="color:#555;">${l}</span><span>${v}</span></div>`
      ).join('')}
      <div style="height:1px;background:#e0e0e0;margin:8px 0;"></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:800;">
        <span>Grand Total</span><span style="color:#e85d04;">${fmtINR(grand)}</span>
      </div>
    </div>
  </div>

  <!-- Terms -->
  <div style="padding:16px 24px;background:#fdf8f4;border-top:1px solid #f0e8e2;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#e85d04;letter-spacing:.06em;margin-bottom:8px;">Terms & Conditions</div>
    <ol style="padding-left:18px;font-size:11px;color:#555;line-height:1.7;">
      <li>The delivery period is <strong>45 days</strong> from the approval date of the decorative metal artwork, subject to receipt of advance payment and templates.</li>
      <li><strong>75%</strong> must be paid in advance, and the remaining balance is due before delivery.</li>
      <li>Once an order is placed, <strong>it cannot be cancelled</strong>.</li>
      <li>We will supply the materials only. Installation/fixing must be carried out by your <strong>own carpenter</strong>.</li>
      <li>We hope the above meets your requirements and look forward to serving you with your valued order.</li>
      <li>Kindly issue all cheques in favour of "<strong>ANTIQUE DESIGNS</strong>."</li>
    </ol>
  </div>

  <div style="border-top:1px solid #f0f0f0;padding:10px 24px;display:flex;justify-content:space-between;font-size:10px;color:#aaa;">
    <span>GENERATED VIA ANTIQUE DESIGNS</span><span>PAGE 1 OF 2</span>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page" style="margin-top:24px;">
  <div style="height:6px;background:linear-gradient(90deg,#e85d04,#ff8c42);"></div>

  <div style="text-align:center;padding:28px 40px 18px;border-bottom:2px solid #e85d04;">
    <h2 style="font-size:18px;font-weight:900;letter-spacing:.1em;color:#e85d04;text-transform:uppercase;">Product Specifications &amp; Images</h2>
  </div>

  ${specsHtml || '<div style="padding:24px;text-align:center;color:#aaa;font-size:12px;">No items</div>'}

  <div style="border-top:1px solid #f0f0f0;padding:10px 24px;display:flex;justify-content:space-between;font-size:10px;color:#aaa;margin-top:24px;">
    <span>GENERATED VIA ANTIQUE DESIGNS</span><span>PAGE 2 OF 2</span>
  </div>
</div>

</body>
</html>`;
}

function esc(v: string): string {
  return (v || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtINRraw(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CreateQuotationPage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { firebaseUser } = useAuth();

  // Pre-fill from Customers page "New Quote" button
  const locState = (location.state || {}) as { customerName?: string; customerPlace?: string; customerId?: string };

  const [custName,  setCustName]  = useState(locState.customerName  || '');
  const [custPlace, setCustPlace] = useState(locState.customerPlace || '');
  const [customerId]              = useState(locState.customerId    || '');

  const [qNo,           setQNo]           = useState('');
  const [hsn,           setHsn]           = useState('74199930');
  const [qDate,         setQDate]         = useState(() => new Date().toISOString().slice(0, 10));
  const [qValid,        setQValid]        = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10);
  });
  const [approvedBy,    setApprovedBy]    = useState('ABHISHEK');
  const [approverPhone, setApproverPhone] = useState('9620202221');
  const [packingCharge, setPackingCharge] = useState('1000');
  const [gstPct,        setGstPct]        = useState('5');
  const [items,         setItems]         = useState<Item[]>([]);
  const [saving,        setSaving]        = useState(false);

  const subtotal = calcSubtotal(items);
  const packing  = parseFloat(packingCharge) || 0;
  const gstAmt   = (subtotal + packing) * (parseFloat(gstPct) || 0) / 100;
  const grand    = subtotal + packing + gstAmt;

  // ── Item helpers ────────────────────────────────────────────────────────────
  function addItem()             { setItems(p => [...p, { name: '', subs: [{ ...EMPTY_SUB }] }]); }
  function removeItem(i: number) { setItems(p => p.filter((_, idx) => idx !== i)); }
  function setItemName(i: number, v: string) {
    setItems(p => p.map((it, idx) => idx === i ? { ...it, name: v } : it));
  }
  function addSub(i: number) {
    setItems(p => p.map((it, idx) => idx === i ? { ...it, subs: [...it.subs, { ...EMPTY_SUB }] } : it));
  }
  function removeSub(i: number, j: number) {
    setItems(p => p.map((it, idx) => idx === i ? { ...it, subs: it.subs.filter((_, si) => si !== j) } : it));
  }
  function setSub(i: number, j: number, field: keyof SubRow, v: string) {
    setItems(p => p.map((it, idx) => idx !== i ? it : {
      ...it, subs: it.subs.map((s, si) => si !== j ? s : { ...s, [field]: v }),
    }));
  }

  // ── Save to Firestore ───────────────────────────────────────────────────────
  async function saveQuotation() {
    if (!custName.trim() || !custPlace.trim()) {
      alert('Customer name and place are required.');
      return;
    }
    if (items.length === 0) { alert('Add at least one line item.'); return; }
    setSaving(true);
    try {
      const qItems: QuotationItem[] = items.map(it => ({
        name: it.name,
        subItems: it.subs.map(s => {
          const up = parseFloat(s.unitPrice) || 0;
          const q  = parseFloat(s.qty) || 0;
          return { desc: s.desc, size: s.size, unitPrice: up, qty: q, amount: up * q } as QuotationSubItem;
        }),
      }));
      const { quotationNo } = await createQuotation({
        customerId: customerId || '',
        customerName: custName.trim(),
        customerPlace: custPlace.trim(),
        hsnCode: hsn,
        items: qItems,
        subtotal,
        packingCharge: packing,
        gstPercent: parseFloat(gstPct) || 0,
        gstAmount: gstAmt,
        grandTotal: grand,
        approvedBy,
        approverPhone,
        status: 'pending',
        date:       Timestamp.fromDate(new Date(qDate)),
        validUntil: Timestamp.fromDate(new Date(qValid)),
        createdBy: firebaseUser!.uid,
      });
      alert(`Quotation ${quotationNo} saved!`);
      navigate('/quotations');
    } catch (e) {
      alert('Save failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }

  // ── PDF helpers ──────────────────────────────────────────────────────────────
  function getPdfHtml() {
    return buildPdfHtml({
      custName, custPlace, qNo, hsn, qDate, qValid,
      approvedBy, approverPhone,
      packing, gstPct: parseFloat(gstPct) || 0,
      items,
    });
  }

  // Opens a new window and immediately triggers the browser's Print → Save as PDF dialog
  function previewPdf() {
    const html = getPdfHtml();
    const win = window.open('', '_blank');
    if (!win) { alert('Pop-up blocked. Allow pop-ups for this site and try again.'); return; }
    win.document.write(html);
    win.document.close();
    // Small delay lets the browser fully render before print dialog
    win.addEventListener('load', () => win.print(), { once: true });
    // Fallback if load already fired
    setTimeout(() => { try { win.print(); } catch {} }, 800);
  }

  // Direct download as .html file (opens perfectly in any browser, printable as PDF from there)
  function downloadPdf() {
    const html = getPdfHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const filename = [
      custName.trim().replace(/\s+/g, '_').toUpperCase() || 'QUOTATION',
      custPlace.trim().replace(/\s+/g, '_').toUpperCase() || '',
      new Date(qDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }).replace(/ /g, ''),
    ].filter(Boolean).join('_') + '.html';
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const subAlpha = ['a','b','c','d','e','f','g','h','i','j'];
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-amber-500';
  const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800">Create Quotation</h2>
        <button onClick={() => navigate('/quotations')} className="text-sm text-gray-500 hover:underline">← Back</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Form ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer & Meta */}
          <div className="bg-white border border-[#ede5d4] rounded-xl p-5">
            <h3 className="font-semibold text-gray-700 text-sm mb-4 pb-3 border-b border-gray-100">
              Customer &amp; Quotation Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Customer Name *</label>
                <input type="text" value={custName} onChange={e => setCustName(e.target.value)}
                  placeholder="e.g. Mahadeva A S" className={inp} />
              </div>
              <div>
                <label className={lbl}>Place / City *</label>
                <input type="text" value={custPlace} onChange={e => setCustPlace(e.target.value)}
                  placeholder="e.g. Mysore" className={inp} />
              </div>
              <div>
                <label className={lbl}>Quotation No.</label>
                <input type="text" value={qNo} onChange={e => setQNo(e.target.value)}
                  placeholder="Auto-generated on save" className={inp} />
              </div>
              <div>
                <label className={lbl}>HSN Code</label>
                <input type="text" value={hsn} onChange={e => setHsn(e.target.value)}
                  placeholder="74199930" className={inp} />
              </div>
              <div>
                <label className={lbl}>Date</label>
                <input type="date" value={qDate} onChange={e => setQDate(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Valid Until</label>
                <input type="date" value={qValid} onChange={e => setQValid(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Approved By</label>
                <input type="text" value={approvedBy} onChange={e => setApprovedBy(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Approver Phone</label>
                <input type="text" value={approverPhone} onChange={e => setApproverPhone(e.target.value)} className={inp} />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white border border-[#ede5d4] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700 text-sm">Line Items</h3>
              <button onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90">
                + Add Item
              </button>
            </div>

            {items.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-sm text-gray-400 hover:border-amber-300 cursor-pointer transition-colors"
                onClick={addItem}>
                + Click to add the first item
              </div>
            )}

            {items.map((item, i) => (
              <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-700">Item {i + 1}</span>
                  <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 text-sm leading-none">✕</button>
                </div>
                <input type="text" value={item.name} onChange={e => setItemName(i, e.target.value)}
                  placeholder="e.g. Main Door : in Brass metal casting with antique finish"
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white mb-3 focus:outline-none focus:border-amber-500" />

                <div className="grid grid-cols-12 gap-2 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                  <div className="col-span-1"></div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-3">Size</div>
                  <div className="col-span-2">Unit ₹</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-1 text-right">Amt</div>
                </div>

                {item.subs.map((sub, j) => {
                  const amt = (parseFloat(sub.unitPrice) || 0) * (parseFloat(sub.qty) || 0);
                  return (
                    <div key={j} className="grid grid-cols-12 gap-2 mb-2 items-center">
                      <div className="col-span-1 text-xs text-amber-600 font-bold text-center">{subAlpha[j] ?? j+1}.</div>
                      <input className="col-span-4 border border-gray-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-amber-400"
                        value={sub.desc} onChange={e => setSub(i, j, 'desc', e.target.value)} placeholder="Description" />
                      <input className="col-span-3 border border-gray-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-amber-400"
                        value={sub.size} onChange={e => setSub(i, j, 'size', e.target.value)} placeholder='18"×24"' />
                      <input type="number" className="col-span-2 border border-gray-200 rounded px-2 py-1.5 text-xs bg-white text-right focus:outline-none focus:border-amber-400"
                        value={sub.unitPrice} onChange={e => setSub(i, j, 'unitPrice', e.target.value)} placeholder="0" />
                      <input type="number" className="col-span-1 border border-gray-200 rounded px-2 py-1.5 text-xs bg-white text-center focus:outline-none focus:border-amber-400"
                        value={sub.qty} onChange={e => setSub(i, j, 'qty', e.target.value)} min="1" />
                      <div className="col-span-1 flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-gray-700 text-right flex-1">
                          {amt > 0 ? amt.toLocaleString('en-IN') : '—'}
                        </span>
                        <button onClick={() => removeSub(i, j)} className="text-gray-300 hover:text-red-400 text-sm leading-none">✕</button>
                      </div>
                    </div>
                  );
                })}

                <button onClick={() => addSub(i)}
                  className="text-xs text-amber-700 border border-dashed border-amber-300 rounded px-3 py-1 hover:bg-amber-50 font-medium mt-1">
                  + Add row
                </button>
              </div>
            ))}
          </div>

          {/* Charges */}
          <div className="bg-white border border-[#ede5d4] rounded-xl p-5">
            <h3 className="font-semibold text-gray-700 text-sm mb-4 pb-3 border-b border-gray-100">Charges &amp; Tax</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Packing &amp; Transport (₹)</label>
                <input type="number" value={packingCharge} onChange={e => setPackingCharge(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>GST (%)</label>
                <input type="number" value={gstPct} onChange={e => setGstPct(e.target.value)} className={inp} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary panel ── */}
        <div>
          <div className="bg-white border border-[#ede5d4] rounded-xl p-5 sticky top-20">
            <h3 className="font-semibold text-gray-700 text-sm mb-4 pb-3 border-b border-gray-100">Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span className="font-medium text-gray-800">{fmtINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Packing &amp; Transport</span><span className="font-medium text-gray-800">{fmtINR(packing)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST ({gstPct}%)</span><span className="font-medium text-gray-800">{fmtINR(gstAmt)}</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between font-bold text-base">
                <span className="text-gray-800">Grand Total</span>
                <span className="text-amber-700">{fmtINR(grand)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <button onClick={saveQuotation} disabled={saving}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 disabled:opacity-50">
                {saving ? 'Saving…' : '💾 Save Quotation'}
              </button>
              <button onClick={downloadPdf}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 transition-colors">
                ⬇ Download PDF
              </button>
              <button onClick={previewPdf}
                className="w-full py-2.5 rounded-lg text-sm font-bold border border-amber-600 text-amber-700 hover:bg-amber-50 transition-colors">
                🖨 Preview &amp; Print
              </button>
              <button onClick={() => navigate('/quotations')}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 border border-gray-200 transition-colors">
                Cancel
              </button>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-600">Terms applied:</strong><br/>
              45-day delivery · 75% advance · No cancellation · Customer installs
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
