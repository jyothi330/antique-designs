# -*- coding: utf-8 -*-
"""
generate_product_pages.py
Creates one HTML page per product category: products/<category>/index.html
Each page: top nav, full image gallery grid, WhatsApp/Call CTAs, back button.
Run from the antique_designs_project folder.
"""
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from pathlib import Path
import re

BASE = Path(__file__).parent

# category_key -> (page_title, description, material, folder, prefix, count, wa_text)
CATEGORIES = [
    ("accessories",    "Accessories",            "Handcrafted brass and white metal accessories — bells, motifs, decorative fittings and embellishments by our Bengaluru artisans.",       "Brass & White Metal",  "products/accessories",    "acc_",   31, "Accessories"),
    ("bannister",      "Bannister",              "Ornate brass and white metal banisters handcrafted for staircases and balconies with intricate detailing.",                              "Forged Brass",         "products/bannister",      "bn_",     7, "Bannister"),
    ("handles",        "Handles",                "Solid cast brass and white metal door handles, pull bars and architectural hardware crafted to last a lifetime.",                        "Cast Brass",           "products/handles",        "hn_",     6, "Handles"),
    ("doubledoor",     "Double Door",            "Elegant symmetrical double doors handcrafted in brass and white metal for grand villa and mansion entrances.",                           "Brass & White Metal",  "products/doubledoor",     "dd_",    20, "Double%20Door"),
    ("internaldoors",  "Internal Doors",         "Beautifully crafted internal doors with brass and white metal detailing to elevate every room.",                                         "Brass & White Metal",  "products/internaldoors",  "id_",    14, "Internal%20Doors"),
    ("poojaaccesories","Pooja Door Accessories", "Decorative brass accessories for pooja room doors — bells, kalasha motifs and divine embellishments.",                                   "Brass & White Metal",  "products/poojaaccesories","pa_",    36, "Pooja%20Door%20Accessories"),
    ("maindoors",      "Main Doors New",         "Latest collection of handcrafted brass and white metal main doors — bold, elegant and built to impress.",                               "Brass & White Metal",  "products/maindoors",      "md_",    37, "Main%20Doors%20New"),
    ("nameplates",     "Name Plates",            "Custom cast brass name plates with deep-relief lettering, house insignia and family crests.",                                            "Cast Brass",           "products/nameplates",     "np_",    37, "Name%20Plates"),
    ("gates",          "Gates",                  "Ornate compound and villa gates with decorative brass fittings and finials for prestigious entrances.",                                  "Brass & Iron",         "products/gates",          "gate_",   8, "Gates"),
    ("wallarts",       "Wall Arts",              "Hand-hammered brass and white metal wall art — relief panels, 3D murals and statement pieces for any space.",                            "Brass & White Metal",  "products/wallarts",       "wa_",    47, "Wall%20Arts"),
    ("traderdoor",     "Trader Door",            "Sturdy and elegant trader doors crafted with brass and white metal embellishments.",                                                     "Brass & White Metal",  "products/traderdoor",     "td_",    14, "Trader%20Door"),
    ("newdoubledoor",  "New Double Door",        "New arrivals in double door designs — handcrafted brass and white metal statement entrances for your home.",                             "Brass & White Metal",  "products/newdoubledoor",  "ndd_",   12, "New%20Double%20Door"),
    ("poojaadoors",    "Pooja Doors",            "Sacred Gopuram arches, kalasha tops and brass temple cladding handcrafted for home mandirs and temple sanctums.",                       "Teak + Brass",         "products/poojaadoors",    "pd_",    58, "Pooja%20Doors"),
    ("railings",       "Railings",               "Hand-forged brass and white metal railings for staircases, balconies and terraces with ornate detailing.",                              "Forged Brass",         "products/railings",       "rl_",    39, "Railings"),
    ("vaskaals",       "Vaskaals",               "Traditional solid brass vaskaal pull handles and door hardware crafted by master artisans in Bengaluru.",                               "Solid Cast Brass",     "products/vaskaals",       "vk_",     9, "Vaskaals"),
]

PAGE_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | Antique Designs Bengaluru</title>
  <meta name="description" content="{desc}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <style>
    *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
    html{{scroll-behavior:smooth}}
    body{{background:#f5f0e8;color:#1e1812;font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden}}
    ::-webkit-scrollbar{{width:5px}}
    ::-webkit-scrollbar-thumb{{background:#c4940e;border-radius:3px}}
    /* NAV */
    .top-bar{{background:linear-gradient(90deg,#1a0e04,#2a1608,#1a0e04);padding:10px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;border-bottom:1px solid rgba(212,175,55,0.25)}}
    .top-bar-logo{{display:flex;align-items:center;gap:10px;text-decoration:none}}
    .logo-img{{width:44px;height:44px;border-radius:6px;object-fit:contain;background:#000}}
    .logo-title{{font-family:'Cinzel',serif;font-size:16px;font-weight:800;letter-spacing:2px;background:linear-gradient(135deg,#d4b050,#a07010);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}}
    .logo-sub{{font-size:8px;letter-spacing:2.5px;color:rgba(240,200,140,0.6);text-transform:uppercase;display:block;margin-top:2px}}
    .top-bar-ctas{{display:flex;gap:10px;flex-wrap:wrap}}
    .btn-wa,.btn-call{{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:6px;font-size:12px;font-weight:700;text-decoration:none;transition:filter 0.2s;white-space:nowrap}}
    .btn-wa{{background:#22c55e;color:#fff}}
    .btn-call{{background:linear-gradient(135deg,#c29320,#8a6205);color:#fff}}
    .btn-wa:hover,.btn-call:hover{{filter:brightness(1.12)}}
    /* BREADCRUMB */
    .breadcrumb{{padding:14px 28px;font-size:12px;color:#9a7040;max-width:1400px;margin:0 auto}}
    .breadcrumb a{{color:#a06808;text-decoration:none}}
    .breadcrumb a:hover{{text-decoration:underline}}
    /* HERO HEADER */
    .cat-header{{background:linear-gradient(160deg,#fff8ee,#f5e8c0);border-bottom:1px solid rgba(160,104,8,0.18);padding:32px 28px 28px;text-align:center}}
    .cat-tag{{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#a06808;margin-bottom:8px}}
    .cat-title{{font-family:'Cinzel',serif;font-size:clamp(24px,4vw,42px);font-weight:800;color:#1e1208;margin-bottom:10px}}
    .cat-desc{{font-size:14px;color:#5a3e1e;max-width:640px;margin:0 auto 16px;line-height:1.7}}
    .cat-material{{display:inline-block;font-size:11px;font-weight:700;letter-spacing:1px;color:#a06808;background:rgba(160,104,8,0.08);border:1px solid rgba(160,104,8,0.2);border-radius:50px;padding:5px 14px}}
    /* GALLERY GRID */
    .gallery-outer{{max-width:1400px;margin:0 auto;padding:32px 20px 48px}}
    .gallery-count{{font-size:12px;color:#9a7040;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;text-align:center}}
    .photo-grid{{columns:3;column-gap:12px}}
    @media(max-width:900px){{.photo-grid{{columns:2}}}}
    @media(max-width:500px){{.photo-grid{{columns:1}}}}
    .photo-item{{break-inside:avoid;margin-bottom:12px;border-radius:10px;overflow:hidden;cursor:zoom-in;background:#f0e8d8;position:relative}}
    .photo-item img{{width:100%;display:block;transition:transform 0.35s;border-radius:10px}}
    .photo-item:hover img{{transform:scale(1.03)}}
    .photo-num{{position:absolute;top:8px;left:8px;background:rgba(26,14,4,0.6);color:rgba(255,240,200,0.9);font-size:10px;font-weight:700;letter-spacing:1px;padding:3px 8px;border-radius:50px}}
    /* CTA STRIP */
    .cta-strip{{background:linear-gradient(90deg,#2a1608,#3d2200,#2a1608);padding:40px 28px;text-align:center;border-top:1px solid rgba(212,175,55,0.2)}}
    .cta-strip h3{{font-family:'Cinzel',serif;font-size:clamp(18px,2.5vw,28px);font-weight:800;color:#faf0d0;margin-bottom:10px}}
    .cta-strip p{{font-size:13px;color:rgba(240,210,160,0.7);max-width:480px;margin:0 auto 24px;line-height:1.7}}
    .cta-btns{{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}}
    .cta-btn-wa{{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:6px;background:#22c55e;color:#fff;font-size:13px;font-weight:700;text-decoration:none;transition:filter 0.2s}}
    .cta-btn-gold{{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:6px;background:linear-gradient(135deg,#c29320,#8a6205);color:#fff;font-size:13px;font-weight:700;text-decoration:none;transition:filter 0.2s}}
    .cta-btn-wa:hover,.cta-btn-gold:hover{{filter:brightness(1.12)}}
    /* FOOTER */
    .site-footer{{background:#1a0e04;border-top:1px solid rgba(212,175,55,0.15);padding:20px 28px;text-align:center;font-size:11px;color:rgba(240,200,140,0.45)}}
    .site-footer a{{color:#c29320;text-decoration:none}}
    /* LIGHTBOX */
    #lbox{{display:none;position:fixed;inset:0;z-index:3000;background:rgba(5,3,1,0.96);align-items:center;justify-content:center}}
    #lbox.open{{display:flex}}
    #lbox img{{max-width:95vw;max-height:93vh;object-fit:contain;border-radius:8px}}
    .lbox-close{{position:fixed;top:14px;right:14px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.25);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:3001}}
    .lbox-nav{{position:fixed;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.25);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:3001;transition:background 0.2s}}
    .lbox-nav:hover{{background:rgba(255,255,255,0.25)}}
    .lbox-prev{{left:12px}}.lbox-next{{right:12px}}
    .lbox-counter{{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1px;z-index:3001}}
  </style>
</head>
<body>

<!-- TOP NAV -->
<div class="top-bar">
  <a href="../index.html" class="top-bar-logo">
    <img src="../logo.jpeg" alt="Antique Designs Logo" class="logo-img">
    <div>
      <div class="logo-title">ANTIQUE DESIGNS</div>
      <span class="logo-sub">Bengaluru &middot; Est. 2014</span>
    </div>
  </a>
  <div class="top-bar-ctas">
    <a href="https://wa.me/919620202221?text=Hello%20Antique%20Designs!%20I%20want%20to%20enquire%20about%20{wa_text}" target="_blank" class="btn-wa">&#128172; WhatsApp Us</a>
    <a href="tel:+919620202221" class="btn-call">&#128222; +91 96202 02221</a>
  </div>
</div>

<!-- BREADCRUMB -->
<div class="breadcrumb">
  <a href="../index.html">Home</a> &rsaquo; <a href="../index.html#collections">Collections</a> &rsaquo; {title}
</div>

<!-- CATEGORY HEADER -->
<div class="cat-header">
  <div class="cat-tag">Antique Designs &middot; Bengaluru</div>
  <h1 class="cat-title">{title}</h1>
  <p class="cat-desc">{desc}</p>
  <span class="cat-material">&#10022; {material}</span>
</div>

<!-- GALLERY -->
<div class="gallery-outer">
  <p class="gallery-count">{count} handcrafted pieces</p>
  <div class="photo-grid" id="photoGrid">
{photo_items}
  </div>
</div>

<!-- CTA STRIP -->
<div class="cta-strip">
  <h3>Interested in {title}?</h3>
  <p>Contact our workshop directly for pricing, custom dimensions and site visits. We handcraft every piece to order.</p>
  <div class="cta-btns">
    <a href="https://wa.me/919620202221?text=Hello%20Antique%20Designs!%20I%20am%20interested%20in%20{wa_text}%20—%20please%20share%20more%20details." target="_blank" class="cta-btn-wa">
      &#128172; WhatsApp Enquiry
    </a>
    <a href="tel:+919620202221" class="cta-btn-gold">&#128222; Call Workshop</a>
    <a href="../index.html#contact" class="cta-btn-gold">&#9998; Request Quote</a>
  </div>
</div>

<!-- FOOTER -->
<div class="site-footer">
  &copy; 2025 Antique Designs Bengaluru &mdash; 39/1 Channenahalli, Magadi Main Rd, Karnataka 562130 &nbsp;|&nbsp;
  <a href="../index.html">Back to Home</a>
</div>

<!-- LIGHTBOX -->
<div id="lbox">
  <button class="lbox-close" id="lboxClose">&#10005;</button>
  <button class="lbox-nav lbox-prev" id="lboxPrev">&#8592;</button>
  <img id="lboxImg" src="" alt="">
  <button class="lbox-nav lbox-next" id="lboxNext">&#8594;</button>
  <div class="lbox-counter" id="lboxCounter"></div>
</div>

<script>
  (function(){{
    var imgs = Array.from(document.querySelectorAll('.photo-item img'));
    var lbox = document.getElementById('lbox');
    var lboxImg = document.getElementById('lboxImg');
    var lboxCounter = document.getElementById('lboxCounter');
    var idx = 0;

    function open(i) {{
      idx = i;
      lboxImg.src = imgs[idx].src;
      lboxCounter.textContent = (idx+1) + ' / ' + imgs.length;
      lbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }}
    function close() {{
      lbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function(){{ lboxImg.src = ''; }}, 200);
    }}
    function nav(dir) {{
      idx = (idx + dir + imgs.length) % imgs.length;
      lboxImg.src = imgs[idx].src;
      lboxCounter.textContent = (idx+1) + ' / ' + imgs.length;
    }}

    imgs.forEach(function(img, i) {{
      img.parentElement.addEventListener('click', function(){{ open(i); }});
    }});
    document.getElementById('lboxClose').addEventListener('click', close);
    document.getElementById('lboxPrev').addEventListener('click', function(){{ nav(-1); }});
    document.getElementById('lboxNext').addEventListener('click', function(){{ nav(1); }});
    lbox.addEventListener('click', function(e){{ if(e.target === lbox) close(); }});
    document.addEventListener('keydown', function(e){{
      if (!lbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'ArrowRight') nav(1);
    }});
  }})();
</script>
</body>
</html>
"""

PHOTO_ITEM = '    <div class="photo-item"><span class="photo-num">{num}</span><img src="../../{src}" alt="{title} {num}" loading="{loading}" decoding="async"></div>'

def generate_page(key, title, desc, material, folder, prefix, count, wa_text):
    # Build photo items — first 6 eager, rest lazy
    items = []
    for i in range(1, count + 1):
        src = "%s/%s%d.jpg" % (folder, prefix, i)
        loading = "eager" if i <= 6 else "lazy"
        items.append(PHOTO_ITEM.format(num=i, src=src, title=title, loading=loading))
    photo_items = "\n".join(items)

    html = PAGE_TEMPLATE.format(
        title=title,
        desc=desc,
        material=material,
        count=count,
        wa_text=wa_text,
        photo_items=photo_items,
    )

    # Write to products/<folder>/index.html
    out_dir = BASE / folder
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "index.html"
    out_file.write_text(html, encoding="utf-8")
    print("  Written: %s  (%d images)" % (out_file.relative_to(BASE), count))

def main():
    print("Generating product pages...")
    for cat in CATEGORIES:
        generate_page(*cat)
    print("\nDone. %d pages generated." % len(CATEGORIES))
    print("Each page lives at products/<category>/index.html")

if __name__ == "__main__":
    main()
