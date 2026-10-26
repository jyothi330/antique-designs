import type { Quotation } from '../types';
import logoB64 from '../assets/logo.jpeg?inline';
import { getSettings } from './settings';

/** Subset of AppSettings needed by the PDF */
export interface PdfSettings {
  companyName:      string;
  gstNumber:        string;
  address:          string;
  email:            string;
  bankName:         string;
  bankAccount:      string;
  bankIfsc:         string;
  bankBranch:       string;
  advancePercent:   number;
  deliveryLeadDays: number;
}

const FALLBACK_SETTINGS: PdfSettings = {
  companyName:      'ANTIQUE DESIGNS',
  gstNumber:        '29ABTFA2399G1ZT',
  address:          '#39/1 CHANNENAHALLI, KADABAGERE POST, MAGADI MAIN ROAD, BANGALORE SOUTH - 562130',
  email:            'hello@antique-designs.com',
  bankName:         'UNION BANK OF INDIA',
  bankAccount:      '317225140000004',
  bankIfsc:         'UBIN0931721',
  bankBranch:       'CHANNENAHALLI',
  advancePercent:   75,
  deliveryLeadDays: 45,
};

/** Load PdfSettings from Firestore, falling back to hardcoded defaults */
export async function loadPdfSettings(): Promise<PdfSettings> {
  try {
    const s = await getSettings();
    if (!s) return FALLBACK_SETTINGS;
    return {
      companyName:      s.companyName      || FALLBACK_SETTINGS.companyName,
      gstNumber:        s.gstNumber        || FALLBACK_SETTINGS.gstNumber,
      address:          s.address          || FALLBACK_SETTINGS.address,
      email:            s.email            || FALLBACK_SETTINGS.email,
      bankName:         s.bankName         || FALLBACK_SETTINGS.bankName,
      bankAccount:      s.bankAccount      || FALLBACK_SETTINGS.bankAccount,
      bankIfsc:         s.bankIfsc         || FALLBACK_SETTINGS.bankIfsc,
      bankBranch:       s.bankBranch       || FALLBACK_SETTINGS.bankBranch,
      advancePercent:   s.advancePercent   ?? FALLBACK_SETTINGS.advancePercent,
      deliveryLeadDays: s.deliveryLeadDays ?? FALLBACK_SETTINGS.deliveryLeadDays,
    };
  } catch {
    return FALLBACK_SETTINGS;
  }
}

function esc(v: string | number | undefined | null): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtINR(n: number): string {
  return '\u20B9' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtINRraw(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtDate(ts: Quotation['date'] | undefined): string {
  if (!ts) return '--';
  const d = ts.toDate();
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Build the full PDF HTML from a saved Quotation document */
export function buildQuotationHtml(q: Quotation, s: PdfSettings = FALLBACK_SETTINGS): string {
  const subLabels = ['a','b','c','d','e','f','g','h','i','j'];
  let itemsHtml = '';
  let specsHtml = '';

  q.items.forEach((item, i) => {
    itemsHtml += `<div style="display:grid;grid-template-columns:32px 1fr 100px 50px 100px;border-bottom:1px solid #f0f0f0;">
      <div style="padding:8px;color:#1a1a1a;font-weight:700;">${i+1}.</div>
      <div style="padding:8px;font-weight:600;color:#1a1a1a;">${esc(item.name)}</div>
      <div></div><div></div><div></div>
    </div>`;

    item.subItems.forEach((sub, j) => {
      itemsHtml += `<div style="display:grid;grid-template-columns:32px 1fr 100px 50px 100px;border-bottom:1px solid #f8f8f8;">
        <div style="padding:6px 8px;color:#e85d04;font-weight:700;">${subLabels[j] ?? j+1}.</div>
        <div style="padding:6px 8px;font-size:12px;color:#333;">${esc(sub.desc)}${sub.size ? `<br><span style="color:#888;font-size:11px;">Size: ${esc(sub.size)}</span>` : ''}</div>
        <div style="padding:6px 8px;text-align:right;font-size:12px;">${sub.unitPrice ? fmtINRraw(sub.unitPrice) : ''}</div>
        <div style="padding:6px 8px;text-align:center;font-size:12px;">${sub.qty}</div>
        <div style="padding:6px 8px;text-align:right;font-size:12px;font-weight:600;">${sub.amount > 0 ? fmtINRraw(sub.amount) : ''}</div>
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
            ${item.subItems.filter(s => s.desc).map(sub =>
              `<li style="font-size:11px;color:#333;margin-bottom:5px;display:flex;flex-wrap:wrap;align-items:center;gap:5px;">
                <span style="color:#e85d04;font-weight:900;margin-right:4px;">&bull;</span>
                <strong>${esc(sub.desc)}</strong>
                ${sub.size ? `<span style="display:inline-block;border:1px solid #ccc;border-radius:4px;padding:1px 7px;font-size:10px;color:#333;font-weight:600;">${esc(sub.size)} &times; ${sub.qty} Nos</span>` : ''}
              </li>`
            ).join('')}
          </ul>
        </div>
      </div>
    </div>`;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Quotation - ${esc(q.quotationNo)}</title>
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

  <div style="text-align:center;padding:28px 40px 20px;border-bottom:1px solid #e8e8e8;">
    <h2 style="font-size:30px;font-weight:900;letter-spacing:.12em;color:#e85d04;text-transform:uppercase;">Quotation</h2>
  </div>

  <div style="text-align:center;padding:24px 40px 18px;border-bottom:1px solid #f0f0f0;">
    <div style="display:flex;align-items:center;justify-content:center;gap:14px;">
      <span style="font-size:28px;font-weight:900;letter-spacing:.14em;color:#1a1a1a;text-transform:uppercase;">${esc(s.companyName.split(' ')[0])}</span>
      <img src="${logoB64}" alt="logo" style="height:48px;width:auto;object-fit:contain;" />
      <span style="font-size:28px;font-weight:900;letter-spacing:.14em;color:#1a1a1a;text-transform:uppercase;">${esc(s.companyName.split(' ').slice(1).join(' ') || '')}</span>
    </div>
    <div style="font-size:12px;color:#888;margin-top:6px;letter-spacing:.06em;">Vintage inspired decorative metal art</div>
    <div style="font-size:11px;color:#aaa;margin-top:5px;">${esc(s.address)}</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid #f0f0f0;">
    <div style="padding:10px 20px;border-right:1px solid #f0f0f0;font-size:12px;">
      <span style="color:#888;">GST: </span><strong>${esc(s.gstNumber)}</strong>
    </div>
    <div style="padding:10px 20px;border-right:1px solid #f0f0f0;text-align:center;font-size:13px;font-weight:700;">
      ${esc(q.quotationNo)}
    </div>
    <div style="padding:10px 20px;font-size:12px;text-align:right;">
      <span style="color:#888;">EMAIL: </span><strong>${esc(s.email)}</strong>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid #f0f0f0;">
    <div style="padding:10px 20px;border-right:1px solid #f0f0f0;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:3px;">Approved By</div>
      <div style="font-size:13px;font-weight:700;">${esc(q.approvedBy)} (${esc(q.approverPhone)})</div>
    </div>
    <div style="padding:10px 20px;border-right:1px solid #f0f0f0;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:3px;">HSN Code</div>
      <div style="font-size:13px;font-weight:700;">${esc(q.hsnCode)}</div>
    </div>
    <div style="padding:10px 20px;display:grid;grid-template-columns:1fr 1fr;">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:3px;">Date</div>
        <div style="font-size:13px;font-weight:700;">${fmtDate(q.date)}</div>
      </div>
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:3px;">Valid Until</div>
        <div style="font-size:13px;font-weight:700;">${fmtDate(q.validUntil)}</div>
      </div>
    </div>
  </div>

  <div style="padding:14px 24px;border-bottom:2px solid #f0f0f0;font-size:13px;">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.06em;margin-bottom:6px;">Bill To</div>
    <div><span style="color:#888;">Name:</span> <strong>${esc(q.customerName.toUpperCase())}</strong></div>
    <div style="margin-left:24px;margin-top:2px;"><span style="color:#888;">Place:</span> <strong>${esc(q.customerPlace.toUpperCase())}</strong></div>
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
      ${[['Bank', s.bankName],['A/C No', s.bankAccount],['IFSC', s.bankIfsc],['Branch', s.bankBranch]].map(([k,v])=>
        `<div style="display:flex;gap:10px;font-size:12px;margin-bottom:3px;"><span style="color:#888;min-width:52px;">${esc(k)}</span><span style="font-weight:600;">${esc(v)}</span></div>`
      ).join('')}
    </div>
    <div style="padding:16px 20px;">
      ${[['Subtotal', fmtINR(q.subtotal)],['Packing & Transport', fmtINR(q.packingCharge)],[`GST (${q.gstPercent}%)`, fmtINR(q.gstAmount)]].map(([l,v])=>
        `<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;"><span style="color:#555;">${l}</span><span>${v}</span></div>`
      ).join('')}
      <div style="height:1px;background:#e0e0e0;margin:8px 0;"></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:800;">
        <span>Grand Total</span><span style="color:#e85d04;">${fmtINR(q.grandTotal)}</span>
      </div>
    </div>
  </div>

  <!-- Terms -->
  <div style="padding:16px 24px;background:#fdf8f4;border-top:1px solid #f0e8e2;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#e85d04;letter-spacing:.06em;margin-bottom:8px;">Terms &amp; Conditions</div>
    <ol style="padding-left:18px;font-size:11px;color:#555;line-height:1.7;">
      <li>The delivery period is <strong>${s.deliveryLeadDays} days</strong> from the approval date of the decorative metal artwork, subject to receipt of advance payment and templates.</li>
      <li><strong>${s.advancePercent}%</strong> must be paid in advance, and the remaining balance is due before delivery.</li>
      <li>Once an order is placed, <strong>it cannot be cancelled</strong>.</li>
      <li>We will supply the materials only. Installation/fixing must be carried out by your <strong>own carpenter</strong>.</li>
      <li>We hope the above meets your requirements and look forward to serving you with your valued order.</li>
      <li>Kindly issue all cheques in favour of "<strong>${esc(s.companyName)}</strong>."</li>
    </ol>
  </div>

  <div style="border-top:1px solid #f0f0f0;padding:10px 24px;display:flex;justify-content:space-between;font-size:10px;color:#aaa;">
    <span>GENERATED VIA ${esc(s.companyName.toUpperCase())}</span><span>PAGE 1 OF 2</span>
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
    <span>GENERATED VIA ${esc(s.companyName.toUpperCase())}</span><span>PAGE 2 OF 2</span>
  </div>
</div>

</body>
</html>`;
}

/** Open the quotation in a new tab and trigger browser print dialog */
export async function printQuotation(q: Quotation): Promise<void> {
  const settings = await loadPdfSettings();
  const html = buildQuotationHtml(q, settings);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (!win) {
    URL.revokeObjectURL(url);
    alert('Pop-up blocked. Allow pop-ups for this site and try again.');
    return;
  }
  win.addEventListener('load', () => {
    win.focus();
    win.print();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, { once: true });
}
