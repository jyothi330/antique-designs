import React, { useState } from 'react';
import { 
  Hammer, ShieldCheck, Sparkles, Phone, Mail, MapPin, 
  Instagram, MessageCircle, ArrowRight, ExternalLink, Send, 
  Clock, CheckCircle, ChevronRight, Menu, X, Gem, Award
} from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'Main Doors',
    location: '',
    notes: ''
  });

  // Exact 7 Product Lines from Antique Designs Catalog
  const collections = [
    {
      id: 1,
      catKey: 'main',
      title: 'Main Doors',
      badge: 'Main Doors',
      image: 'https://antiquedesign.figma.site/_components/v2/7989ddfed5f219934d9782619bee0468a28ed494/Main_Door_01-2.a37f71e7.PNG',
      description: 'Full-clad solid brass and white metal entrance doors featuring hand-hammered repoussé, decorative pyramid studs, and heavy brass lion/elephant knockers.',
      tag: 'Heavy Gauge Pure Brass Clad',
      inquiry: 'Main Doors'
    },
    {
      id: 2,
      catKey: 'pooja',
      title: 'Pooja Doors',
      badge: 'Pooja Doors',
      image: 'https://antiquedesign.figma.site/_components/v2/7989ddfed5f219934d9782619bee0468a28ed494/Untitled-11.jpg-1.22ed52b2.jpeg',
      description: 'Sacred Gopuram arches, kalasha motifs, brass temple bell cutouts, and pure white metal or brass sheet cladding designed for Vastu and spiritual serenity.',
      tag: 'Bespoke Solid Teak + Brass',
      inquiry: 'Pooja Doors'
    },
    {
      id: 3,
      catKey: 'partitions',
      title: 'Partition Grills',
      badge: 'Partition Grills',
      image: 'https://antiquedesign.figma.site/_components/v2/7989ddfed5f219934d9782619bee0468a28ed494/op_2JPG.826d0320.PNG',
      description: 'Geometric Islamic latticework, traditional mandala fretwork, and laser-machined pure brass partitions framed for dining, living, and mandir zones.',
      tag: 'Architectural Space Dividers',
      inquiry: 'Partition Grills'
    },
    {
      id: 4,
      catKey: 'railings',
      title: 'Railings',
      badge: 'Railings',
      image: 'https://antiquedesign.figma.site/_components/v2/7989ddfed5f219934d9782619bee0468a28ed494/op_11JPG.0a4670de.PNG',
      description: 'Hand-turned solid brass spindles, cast acanthus balusters, curved helical handrails, and ornate floral scrollwork for duplex staircases and balconies.',
      tag: 'Solid Forged & Cast Brass',
      inquiry: 'Railings'
    },
    {
      id: 5,
      catKey: 'nameplates',
      title: 'Name Plates',
      badge: 'Name Plates',
      image: 'https://antiquedesign.figma.site/_components/v2/7989ddfed5f219934d9782619bee0468a28ed494/op_1JPG.97998508.PNG',
      description: 'Deep-relief sand-cast letters, house insignia, family crests, and engraved brass plaques mounted on seasoned Burma Teak or natural marble.',
      tag: 'Custom Typography & Crests',
      inquiry: 'Name Plates'
    },
    {
      id: 6,
      catKey: 'threequarter',
      title: '3/4 Consept Door',
      badge: '3/4 Consept Door',
      image: 'https://antiquedesign.figma.site/_components/v2/7989ddfed5f219934d9782619bee0468a28ed494/Main_Door_03-2.d262b601.PNG',
      description: 'Modern asymmetric main doors pairing a large operable primary leaf with a decorative fixed/latchable 1/4 side metal panel for majestic presence.',
      tag: 'Modern Luxury Architectural',
      inquiry: '3/4 Consept Door'
    },
    {
      id: 7,
      catKey: 'handles',
      title: 'Handles',
      badge: 'Handles',
      image: 'https://antiquedesign.figma.site/_components/v2/7989ddfed5f219934d9782619bee0468a28ed494/MD_Vascal_3.5c3b2dc6.PNG',
      description: 'Heavy-duty solid cast brass pull handles, lion head knockers, ornate antique locks, tower bolts, and custom architectural door hardware.',
      tag: 'Solid Cast Brass Hardware',
      inquiry: 'Handles'
    }
  ];

  const filtered = selectedCategory === 'all' 
    ? collections 
    : collections.filter(c => c.catKey === selectedCategory);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const message = `*NEW ESTIMATE INQUIRY - ANTIQUE DESIGNS*\n\n` +
      `👤 *Client Name:* ${formData.name}\n` +
      `📞 *Phone/WhatsApp:* ${formData.phone}\n` +
      `🚪 *Interested Product:* ${formData.category}\n` +
      `📍 *Location:* ${formData.location || 'Not specified'}\n` +
      `📐 *Dimensions & Details:* ${formData.notes || 'Standard customization requested'}\n\n` +
      `_Sent from antiquedesign.in quote form_`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918971305188?text=${encodedMsg}`;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setFormSubmitted(false);
      setFormData({ name: '', phone: '', category: 'Main Doors', location: '', notes: '' });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#24201B] font-sans selection:bg-[#C59B27] selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#F4ECE1] via-[#EBE1D3] to-[#F4ECE1] border-b border-[#E3D7C5] py-2.5 px-4 text-xs text-center text-[#24201B] flex flex-wrap items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-3.5 h-3.5 text-[#C59B27]" /> Workshop: Channenahalli, Magadi Main Rd, Bengaluru</span>
        <span className="hidden md:inline text-[#E3D7C5]">•</span>
        <span className="flex items-center gap-1.5 font-medium"><Phone className="w-3.5 h-3.5 text-[#C59B27]" /> Direct Call: <a href="tel:+918971305188" className="font-bold text-[#8F6506] hover:underline">+91 89713 05188</a> / <a href="tel:+919620202221" className="font-bold text-[#8F6506] hover:underline">+91 96202 02221</a></span>
        <span className="hidden md:inline text-[#E3D7C5]">•</span>
        <a href="https://www.instagram.com/antiquedesigns_bengaluru" target="_blank" rel="noreferrer" className="flex items-center gap-1 font-semibold text-[#8F6506] hover:text-black transition-colors">
          <Instagram className="w-3.5 h-3.5 text-pink-600" /> @antiquedesigns_bengaluru
        </a>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E3D7C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-[#C59B27]/50 bg-[#FAF7F2] flex items-center justify-center text-[#C59B27] shadow-sm p-2">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-[#C59B27]">
                  <path d="M50 5 L60 35 L92 35 L66 54 L76 85 L50 67 L24 85 L34 54 L8 35 L40 35 Z" fill="none" stroke="#B8860B" strokeWidth="4"/>
                  <circle cx="50" cy="50" r="14" fill="#C59B27"/>
                </svg>
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#8F6506] block leading-tight">ANTIQUE DESIGNS</span>
                <span className="text-[10px] tracking-[0.22em] text-[#6E6559] uppercase block font-medium">Handcrafted Brass & White Metal Art • Bengaluru</span>
              </div>
            </a>

            <div className="hidden lg:flex items-center gap-8 text-sm font-semibold">
              <a href="#about" className="text-[#6E6559] hover:text-[#8F6506] transition-colors">Our Heritage</a>
              <a href="#collections" className="text-[#6E6559] hover:text-[#8F6506] transition-colors">Products (7)</a>
              <a href="#craftsmanship" className="text-[#6E6559] hover:text-[#8F6506] transition-colors">The Craft & Process</a>
              <a href="#instagram" className="text-[#6E6559] hover:text-[#8F6506] transition-colors">Instagram Feed</a>
              <a href="#contact" className="text-[#6E6559] hover:text-[#8F6506] transition-colors">Contact Workshop</a>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <a href="https://wa.me/918971305188?text=Hello%20Antique%20Designs,%20I%20am%20interested%20in%20custom%20brass%20metalwork." target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/40 text-[#128C7E] hover:bg-[#25D366] hover:text-white font-bold text-xs tracking-wide transition-all shadow-sm">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href="#contact" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C59B27] to-[#8F6506] text-white font-bold text-xs tracking-wide hover:shadow-md transition-all">
                Request Quote
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-[#8F6506]">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E3D7C5] bg-[#FAF7F2] px-4 pt-4 pb-6 space-y-3">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#24201B] hover:text-[#8F6506] font-medium">Our Heritage</a>
            <a href="#collections" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#24201B] hover:text-[#8F6506] font-medium">Products (7)</a>
            <a href="#craftsmanship" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#24201B] hover:text-[#8F6506] font-medium">The Craft</a>
            <a href="#instagram" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#24201B] hover:text-[#8F6506] font-medium">Instagram Feed</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#24201B] hover:text-[#8F6506] font-medium">Contact Workshop</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 text-center px-4 overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F4ECE1]/60 to-[#FAF7F2]">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E3D7C5] bg-white text-[#8F6506] text-xs font-semibold tracking-widest uppercase mb-6 shadow-sm">
            <Hammer className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Handcrafted Brass & White Metal Foundry • Bengaluru (Est. 2014)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-serif font-bold text-[#24201B] mb-6 leading-tight">
            Handmade Brass & White Metal <br />
            <span className="text-[#8F6506] italic font-normal">Architectural Heirlooms</span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#6E6559] mb-10 leading-relaxed font-normal">
            Welcome to Antique Designs — an authentic offline artisanal manufacturing atelier based on Magadi Main Road, Bengaluru. 
            Our master craftsmen physically hand-emboss, forge, and sculpt pure heavy-gauge brass and white metal for grand residences, villas, and temples.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <a href="#collections" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#C59B27] to-[#8F6506] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2">
              <span>View All 7 Products</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="https://wa.me/918971305188" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#E3D7C5] bg-white text-[#24201B] font-semibold text-sm hover:border-[#C59B27] transition-all shadow-sm flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Workshop</span>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-white border border-[#E3D7C5] shadow-sm">
              <div className="text-2xl font-serif font-bold text-[#8F6506]">11+ Years</div>
              <div className="text-xs text-[#6E6559] mt-1 font-medium">Bengaluru Atelier (Est. 2014)</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E3D7C5] shadow-sm">
              <div className="text-2xl font-serif font-bold text-[#8F6506]">100% Solid</div>
              <div className="text-xs text-[#6E6559] mt-1 font-medium">Pure Heavy Brass Sheet</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E3D7C5] shadow-sm">
              <div className="text-2xl font-serif font-bold text-[#8F6506]">Bespoke</div>
              <div className="text-xs text-[#6E6559] mt-1 font-medium">Custom Built to Site Specs</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E3D7C5] shadow-sm">
              <div className="text-2xl font-serif font-bold text-[#8F6506]">Bengaluru</div>
              <div className="text-xs text-[#6E6559] mt-1 font-medium">Offline Physical Foundry</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white border-y border-[#E3D7C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-widest text-[#8F6506] font-bold">Authentic Metal Foundry & Atelier</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#24201B] leading-tight">
                Traditional Indian Metal Artistry, <br />
                <span className="text-[#8F6506] italic font-normal">Engineered for Royal Architecture</span>
              </h2>
              <p className="text-[#6E6559] text-sm sm:text-base leading-relaxed">
                At <strong className="text-[#24201B]">Antique Designs</strong>, every creation is authentic. Established over 11 years ago on Magadi Main Road in Bengaluru, our atelier specializes in traditional sheet metal embossing (<em className="text-[#8F6506] font-semibold">Repoussé & Chasing</em>), sand casting, laser lattice cutwork, and custom chemical patination.
              </p>
              <p className="text-[#6E6559] text-sm sm:text-base leading-relaxed">
                Every main entrance door, pooja mandir entrance, staircase balustrade, and brass handle is physically shaped by hands with decades of generational craft experience. We collaborate directly with homeowners, luxury interior architects, and temple trusts across South India.
              </p>
            </div>

            <div className="lg:col-span-5 p-8 rounded-3xl bg-gradient-to-b from-[#FAF7F2] to-[#F4ECE1] border border-[#E3D7C5] shadow-sm">
              <h3 className="font-serif text-xl font-bold text-[#24201B] mb-4">Workshop Coordinates</h3>
              <div className="space-y-3 text-sm text-[#6E6559]">
                <p>📍 <strong>Address:</strong> 39/1, Channenahalli, Kadabagere Post, Magadi Main Rd, Karnataka 562130</p>
                <p>⏰ <strong>Working Hours:</strong> Mon – Sat: 9:30 AM – 7:30 PM</p>
                <p>📞 <strong>Phone:</strong> +91 89713 05188 / +91 96202 02221</p>
              </div>
              <a href="https://maps.app.goo.gl/DYgX5WBEqMSR9Msz8?g_st=awb" target="_blank" rel="noreferrer" className="mt-6 block text-center py-3.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#8F6506] text-white font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-sm">
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#8F6506] text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1 mb-2">
            <Gem className="w-4 h-4 text-[#C59B27]" /> Master Collections
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#24201B] mb-4">Our 7 Handcrafted Product Lines</h2>
          <p className="text-[#6E6559] text-sm">Select a category below to browse our offline manufacturing portfolio.</p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {[
              { key: 'all', label: 'All Products' },
              { key: 'main', label: 'Main Doors' },
              { key: 'pooja', label: 'Pooja Doors' },
              { key: 'partitions', label: 'Partition Grills' },
              { key: 'railings', label: 'Railings' },
              { key: 'nameplates', label: 'Name Plates' },
              { key: 'threequarter', label: '3/4 Consept Door' },
              { key: 'handles', label: 'Handles' }
            ].map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat.key 
                    ? 'bg-[#C59B27] text-white border-[#C59B27] shadow-sm' 
                    : 'bg-white text-[#6E6559] border-[#E3D7C5] hover:border-[#C59B27] hover:text-[#8F6506]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(item => (
            <div key={item.id} className="rounded-3xl bg-white border border-[#E3D7C5] hover:border-[#C59B27]/80 transition-all overflow-hidden group shadow-sm hover:shadow-md">
              <div className="h-64 bg-[#FCFAF7] flex items-center justify-center p-4 relative overflow-hidden border-b border-[#ECE4D8]">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 text-[#8F6506] text-[10px] uppercase font-bold border border-[#E3D7C5] shadow-sm">
                  {item.badge}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-[#24201B] group-hover:text-[#8F6506] transition-colors">{item.title}</h3>
                <p className="text-xs text-[#6E6559] mt-2 leading-relaxed">{item.description}</p>
                <div className="mt-5 pt-4 border-t border-[#ECE4D8] flex items-center justify-between text-xs">
                  <span className="text-[#8F6506] font-semibold">{item.tag}</span>
                  <a 
                    href={`https://wa.me/918971305188?text=I%20am%20interested%20in%20${encodeURIComponent(item.inquiry)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#24201B] hover:text-[#8F6506] flex items-center gap-1 font-bold"
                  >
                    Inquire <ArrowRight className="w-3.5 h-3.5 text-[#C59B27]" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section id="instagram" className="py-20 bg-white border-t border-[#E3D7C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8F6506] font-bold flex items-center gap-1 mb-2">
                <Instagram className="w-4 h-4 text-pink-600" /> Follow Our Daily Workshop Making
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#24201B]">Instagram: @antiquedesigns_bengaluru</h2>
              <p className="text-sm text-[#6E6559] mt-2">Watch real workshop videos, live artisan hammering, and on-site door installations.</p>
            </div>
            <a 
              href="https://www.instagram.com/antiquedesigns_bengaluru" 
              target="_blank" 
              rel="noreferrer" 
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow on Instagram</span>
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {collections.slice(0, 6).map(item => (
              <a 
                key={item.id} 
                href="https://www.instagram.com/antiquedesigns_bengaluru" 
                target="_blank" 
                rel="noreferrer" 
                className="group relative rounded-2xl overflow-hidden aspect-square bg-white border border-[#E3D7C5] shadow-sm"
              >
                <img src={item.image} alt="Instagram Post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Instagram className="w-8 h-8" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[#8F6506] text-xs uppercase tracking-widest font-bold">Direct Workshop Contact</span>
            <h2 className="text-3xl font-serif font-bold text-[#24201B]">Commission Your Custom Brass Art</h2>
            <p className="text-sm text-[#6E6559]">Have architectural CAD drawings, a photo from our Instagram, or need site measurements? Reach out directly.</p>

            <div className="space-y-4 pt-2">
              <a href="tel:+918971305188" className="flex items-center gap-4 p-4 rounded-2xl bg-[#FCFAF7] border border-[#E3D7C5] hover:border-[#C59B27] transition-all shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#F4ECE1] text-[#8F6506] flex items-center justify-center shrink-0 border border-[#E3D7C5]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#8C8274] uppercase tracking-wider block font-medium">Call Workshop Direct</span>
                  <span className="text-[#24201B] font-bold text-base">+91 89713 05188 / 96202 02221</span>
                </div>
              </a>

              <a href="https://wa.me/918971305188" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-[#FCFAF7] border border-[#E3D7C5] hover:border-[#25D366] transition-all shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center shrink-0 border border-[#25D366]/30">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#8C8274] uppercase tracking-wider block font-medium">Instant WhatsApp Support</span>
                  <span className="text-[#24201B] font-bold text-base">Chat with Design Head</span>
                </div>
              </a>

              <a href="mailto:hello@antique-designs.com" className="flex items-center gap-4 p-4 rounded-2xl bg-[#FCFAF7] border border-[#E3D7C5] hover:border-[#C59B27] transition-all shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#F4ECE1] text-[#8F6506] flex items-center justify-center shrink-0 border border-[#E3D7C5]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#8C8274] uppercase tracking-wider block font-medium">Send Plans & Drawings</span>
                  <span className="text-[#24201B] font-bold text-base">hello@antique-designs.com</span>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#FCFAF7] border border-[#E3D7C5] shadow-sm">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#24201B] mb-2">Request Bespoke Price Estimate</h3>
              <p className="text-xs text-[#6E6559] mb-6">Fill in your requirements and our master craftsman will revert with technical specs and pricing on WhatsApp.</p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#24201B] font-bold mb-1.5">Your Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Ramesh Kumar" 
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#E3D7C5] text-[#24201B] text-sm focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] focus:outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#24201B] font-bold mb-1.5">Phone / WhatsApp Number *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 98765 43210" 
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#E3D7C5] text-[#24201B] text-sm focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] focus:outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#24201B] font-bold mb-1.5">Product Category *</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#E3D7C5] text-[#24201B] text-sm focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] focus:outline-none transition-all"
                    >
                      <option value="Main Doors">Main Doors</option>
                      <option value="Pooja Doors">Pooja Doors</option>
                      <option value="Partition Grills">Partition Grills</option>
                      <option value="Railings">Railings</option>
                      <option value="Name Plates">Name Plates</option>
                      <option value="3/4 Consept Door">3/4 Consept Door</option>
                      <option value="Handles">Handles</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#24201B] font-bold mb-1.5">Site Location / City</label>
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Bengaluru, Mysuru" 
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#E3D7C5] text-[#24201B] text-sm focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] focus:outline-none transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#24201B] font-bold mb-1.5">Dimensions & Requirements</label>
                  <textarea 
                    rows={3} 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Approximate dimensions (e.g. 7ft x 4ft), preferred metal alloy (Pure Brass / White Metal / Antique Patina)..." 
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E3D7C5] text-[#24201B] text-sm focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] focus:outline-none transition-all"
                  ></textarea>
                </div>

                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-[#25D366] via-[#20ba5a] to-[#128C7E] text-white font-extrabold text-sm uppercase tracking-wider hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-md">
                  <MessageCircle className="w-5 h-5 fill-white text-white" />
                  <span className="tracking-wide">Send Request on WhatsApp (+91 89713 05188)</span>
                </button>
              </form>

              {formSubmitted && (
                <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-300 text-green-800 text-xs text-center font-medium">
                  ✓ Redirecting to WhatsApp with your customized inquiry message...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F4ECE1] border-t border-[#E3D7C5] py-12 text-[#6E6559] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="font-serif text-lg font-bold text-[#8F6506] block">ANTIQUE DESIGNS</span>
              <span className="text-[11px] text-[#8C8274]">Traditional Brass & White Metal Architectural Atelier • Established 2014</span>
            </div>
            <div className="flex items-center gap-6 font-medium">
              <a href="https://www.instagram.com/antiquedesigns_bengaluru" target="_blank" rel="noreferrer" className="hover:text-[#8F6506] transition-colors flex items-center gap-1">
                <Instagram className="w-4 h-4 text-pink-600" /> Instagram
              </a>
              <a href="https://maps.app.goo.gl/DYgX5WBEqMSR9Msz8?g_st=awb" target="_blank" rel="noreferrer" className="hover:text-[#8F6506] transition-colors flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#C59B27]" /> Google Maps
              </a>
              <a href="tel:+918971305188" className="hover:text-[#8F6506] transition-colors flex items-center gap-1">
                <Phone className="w-4 h-4 text-[#C59B27]" /> +91 89713 05188
              </a>
            </div>
            <p className="text-[#8C8274]">© 2026 Antique Designs. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/918971305188" target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] text-white font-bold text-xs shadow-xl hover:scale-105 transition-all">
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="hidden sm:inline">WhatsApp Us</span>
      </a>
    </div>
  );
}
