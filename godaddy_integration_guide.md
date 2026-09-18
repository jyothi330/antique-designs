# Complete GoDaddy Integration & Publishing Guide
## Project: Antique Designs (`www.antiquedesigns.in`)

Here are the step-by-step instructions depending on what type of GoDaddy hosting/product you have:

---

### Method 1: If You Have GoDaddy cPanel Web Hosting (Most Common)

If your GoDaddy plan is **cPanel Web Hosting** (Linux/Windows Hosting):

1. **Log in to GoDaddy:**
   - Go to [godaddy.com](https://www.godaddy.com) and click **Sign In**.
   - Go to **My Products** → scroll to **Web Hosting** → click **Manage** next to your hosting account.
   - Click **cPanel Admin**.

2. **Open File Manager:**
   - In cPanel, find and open **File Manager** (under *Files*).
   - In the left sidebar, double-click to open the folder named **`public_html`**.
   - *(Optional)* If there is an existing default file named `default.html` or old placeholder files, you can delete or rename them.

3. **Upload the Website File:**
   - Click the **Upload** button at the top toolbar.
   - Select your [`index.html`](index.html:1) file from your computer:
     `c:\Users\JyothiShreeSR\AppData\Local\Programs\Python\index.html`
   - Once upload reaches 100% (green bar), click **Go back to public_html**.

4. **Verify Live Site:**
   - Open your browser and visit `https://www.antiquedesigns.in` (or your domain name).
   - Your new luxury offline artisan website is live immediately!

---

### Method 2: If You Have GoDaddy Website Builder

If you are using **GoDaddy Website Builder** (the drag-and-drop tool) instead of cPanel:

#### Option A: Embed as Custom Code / HTML Section
1. Log in to GoDaddy → **My Products** → click **Manage** next to Website Builder.
2. Click **Edit Site**.
3. Scroll to the page section where you want the full custom design and click **Add Section (+)**.
4. Search for or select **HTML / Custom Code**.
5. Copy the code inside [`index.html`](index.html:1) and paste it into the HTML code box.
6. Click **Done** and then click **Publish**.

#### Option B: Point GoDaddy Domain to Free Fast Hosting (Vercel / Netlify / Cloudflare) — Recommended for Instant Setup & Free SSL
If you want ultra-fast loading speed and automatic free SSL without paying hosting fees:
1. Go to [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com).
2. Drag and drop your [`index.html`](index.html:1) file.
3. In GoDaddy: Go to **Domain Portfolio** → click your domain (`antiquedesigns.in`) → **Manage DNS**.
4. Add the CNAME or A Record provided by Vercel/Netlify.

---

### Method 3: If You Want to Redirect Your GoDaddy Domain to Your Figma Site (`antiquedesign.figma.site`)

If you want visitors typing `www.antiquedesigns.in` on GoDaddy to automatically load your Figma site:

1. Log in to GoDaddy → **My Products** → **Domains**.
2. Click on your domain name (`antiquedesigns.in`).
3. Click on the **DNS** tab → scroll down to the **Forwarding** section.
4. Next to **Domain**, click **Add Forwarding**:
   - **Forward to:** `https://antiquedesign.figma.site`
   - **Redirect type:** `301 (Permanent)`
   - **Forward with masking:** `Yes` (so visitors continue to see `antiquedesigns.in` in the URL address bar).
5. Click **Save**.

---

### Quick Checklist:
- [x] All 9 authentic offline categories configured (Pooja, Main, Double, 3/4 Concept, Railings, Name Plates, Partitions, Gates, Wall Arts).
- [x] Instagram `@antiquedesigns_bengaluru` direct linking enabled.
- [x] Google Maps location pin for Channenahalli, Magadi Main Rd workshop embedded.
- [x] WhatsApp direct concierge connected to `+91 89713 05188`.
