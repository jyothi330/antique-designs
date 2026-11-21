// ── DESIGN CARDS DATA (named, described, per category) ──
var galleries={
  maindoors:[
    {src:'products/maindoors/md_1.jpg',name:'Lotus Medallion Single Door',style:'Traditional · Antique Gold',desc:'Deep-relief lotus medallion centred on a single 3×7ft brass shutter. Hand-embossed Hamsa border. Ideal for traditional South Indian homes.'},
    {src:'products/maindoors/md_2.jpg',name:'Gopuram Arch Door',style:'Temple Style · Antique Bronze',desc:'Stepped Gopuram arch frame with Kalasha finial crown. Full-panel deity relief. Recommended ceiling height ≥ 9ft.'},
    {src:'products/maindoors/md_3.jpg',name:'Arabesque Jali Panel',style:'Mughal Inspired · Satin Brass',desc:'Geometric arabesque jali overlay on a solid brass panel. Allows filtered light through the foyer. Stunning against marble flooring.'},
    {src:'products/maindoors/md_4.jpg',name:'Peacock & Floral Scroll',style:'Ornate · Antique Gold',desc:'Hand-chased peacock in full display surrounded by floral scrollwork. A signature South Indian residential style.'},
    {src:'products/maindoors/md_5.jpg',name:'Minimal Geometric Grid',style:'Contemporary · Oxidised Bronze',desc:'Clean square-grid emboss with a single central motif. Suits modern flat architecture and minimalist interiors.'},
    {src:'products/maindoors/md_6.jpg',name:'Tree of Life Door',style:'Nature Motif · Antique Gold',desc:'Kalpavriksha (Tree of Life) in full relief — birds, fruits and blossoms across the entire panel height.'},
    {src:'products/maindoors/md_7.jpg',name:'Prabhavali Frame Door',style:'Sacred · Antique Bronze',desc:'Radiating divine halo surround (Prabhavali) with flame and lotus motifs. Creates a temple-gateway presence at your entrance.'},
    {src:'products/maindoors/md_8.jpg',name:'Kolam Border Door',style:'South Indian Folk · Satin Brass',desc:'Geometric Kolam (rangoli) pattern border surrounding a plain brass field. Elegant restraint — modern homes with a cultural identity.'},
    {src:'products/maindoors/md_9.jpg',name:'Hamsa Bird Panel',style:'Auspicious · Antique Gold',desc:'Pairs of Hamsa (sacred geese) in mirrored composition. Considered auspicious in Vastu; popular for east-facing main entrances.'},
    {src:'products/maindoors/md_10.jpg',name:'Deep Relief Floral Door',style:'Heritage · Antique Bronze',desc:'All-over deep-relief floral embossing with layered petal and leaf motifs. 15–18 working days of hand artistry per panel.'}
  ],
  doubledoor:[
    {src:'products/doubledoor/dd_1.jpg',name:'Grand Lotus Double Door',style:'Traditional · Antique Gold',desc:'Full brass-clad double door with a split lotus medallion spanning both leaves. 6×8ft. 180kg. The centrepiece of premium villas.'},
    {src:'products/doubledoor/dd_2.jpg',name:'Gopuram Double Arch',style:'Temple Style · Antique Bronze',desc:'Twin Gopuram arch crowns with Kalasha finials on each leaf. Deity panel split at centre join — reunites when doors close together.'},
    {src:'products/doubledoor/dd_3.jpg',name:'Peacock Pair Double Door',style:'Ornate · Antique Gold',desc:'Mirror-image peacocks in full display — one on each leaf. Hand-embossed tail feathers with individual feather detailing.'},
    {src:'products/doubledoor/dd_4.jpg',name:'Arabesque Double Entry',style:'Mughal · Satin Brass',desc:'Arabesque jali panels on both leaves with an ornate border frame. Allows filtered light into the lobby when doors are closed.'},
    {src:'products/doubledoor/dd_5.jpg',name:'Elephant March Double',style:'Festive · Antique Gold',desc:'Elephant march frieze across both leaves — the procession continues unbroken when doors are shut. A singular visual spectacle.'},
    {src:'products/doubledoor/dd_6.jpg',name:'Ganesha & Lakshmi Pair',style:'Devotional · Antique Bronze',desc:'Ganesha on the left leaf, Lakshmi on the right — the most beloved devotional double door pairing in Hindu home tradition.'},
    {src:'products/doubledoor/dd_7.jpg',name:'Tree of Life Double',style:'Nature · Antique Gold',desc:'A single Kalpavriksha (Tree of Life) spans both leaves — the trunk at centre, canopy spreading across the full door width.'},
    {src:'products/doubledoor/dd_8.jpg',name:'Dravidian Column Double',style:'Architectural · Antique Bronze',desc:'Dravidian column pilasters on both leaves with a continuous central frieze. Evokes the carved doorways of 18th-century Tamil Nadu temples.'}
  ],
  newdoubledoor:[
    {src:'products/newdoubledoor/ndd_1.jpg',name:'New Grand Entry Double',style:'Premium · Antique Gold',desc:'Latest addition to our double door collection — new motif vocabulary with updated proportions for contemporary luxury villas.'},
    {src:'products/newdoubledoor/ndd_2.jpg',name:'Floral Lattice Double',style:'Ornate · Antique Bronze',desc:'Fine floral lattice on both leaves — each lattice node is hand-cast individually, then set into the brass panel.'},
    {src:'products/newdoubledoor/ndd_3.jpg',name:'Arch Crown Double',style:'Classical · Satin Brass',desc:'Arched crown top with a plain brass field — clean and architectural, the motif is concentrated in the crown detailing.'},
    {src:'products/newdoubledoor/ndd_4.jpg',name:'Heritage Column Double',style:'Colonial · Antique Gold',desc:'Classical column pilasters flank each leaf with a central panel for family name or motif. Colonial bungalow revival style.'},
    {src:'products/newdoubledoor/ndd_5.jpg',name:'Peacock Tail Spread',style:'Ornate · Antique Bronze',desc:'A single peacock tail spread across both door leaves — feathers detailed down to the individual eye markings.'},
    {src:'products/newdoubledoor/ndd_6.jpg',name:'Lotus Pond Double',style:'Naturalist · Antique Gold',desc:'Lotus pond scene — stems, pads, blooms and dragonflies in full-panel composition. A rare naturalist motif in our collection.'},
    {src:'products/newdoubledoor/ndd_7.jpg',name:'Jali Screen Double',style:'Perforated · Satin Brass',desc:'Full-panel perforated jali on both leaves — the intricate screen allows light and air while maintaining privacy.'},
    {src:'products/newdoubledoor/ndd_8.jpg',name:'Temple Chariot Double',style:'Narrative · Antique Bronze',desc:'Chariot scene — Arjuna and Krishna depicted across both leaves of the double door. A powerful narrative composition.'},
    {src:'products/newdoubledoor/ndd_9.jpg',name:'Bold Medallion Double',style:'Statement · Antique Gold',desc:'Oversized central medallion spanning both leaves — bold and striking at any distance, ideal for villa gatehouses.'},
    {src:'products/newdoubledoor/ndd_10.jpg',name:'Reeded Column Double',style:'Architectural · Oxidised Bronze',desc:'Reeded vertical columns across each leaf with a horizontal frieze at eye level. Strong architectural presence.'},
    {src:'products/newdoubledoor/ndd_11.jpg',name:'Fluted Frame Double',style:'Classical · Satin Brass',desc:'Fluted border frame with a recessed central panel ready for custom motif insertion — a flexible foundation design.'},
    {src:'products/newdoubledoor/ndd_12.jpg',name:'Contemporary Split Motif',style:'Modern · Oxidised Bronze',desc:'Abstract split-geometry motif — left leaf and right leaf each carry half a composition that resolves when doors close.'}
  ],
  railings:[
    {src:'products/railings/rl_1.jpg',name:'Classic Turned Baluster',style:'Traditional · Antique Gold',desc:'Lathe-turned solid brass balusters with a round-profile handrail. The timeless South Indian residential staircase standard.'},
    {src:'products/railings/rl_2.jpg',name:'Twisted Rope Railing',style:'Dynamic · Antique Bronze',desc:'Rope-twist brass balusters — the helical twist catches light differently at every angle and casts dramatic shadow patterns.'},
    {src:'products/railings/rl_3.jpg',name:'Floral Jali Panel Railing',style:'Ornate · Antique Gold',desc:'Flat brass panels with hand-cut floral jali — each panel is a frame of intricate foliage. Stunning in double-height foyers.'},
    {src:'products/railings/rl_4.jpg',name:'Geometric Diamond Railing',style:'Contemporary · Oxidised Bronze',desc:'Diamond-grid flat panel balusters in oxidised bronze — a modern aesthetic in a traditional material.'},
    {src:'products/railings/rl_5.jpg',name:'Scrollwork Balustrade',style:'Heritage · Antique Gold',desc:'Hand-forged brass scroll inserts between vertical bars — each scroll is unique, forged by hand at our atelier.'},
    {src:'products/railings/rl_6.jpg',name:'Oval Handrail System',style:'Ergonomic · Satin Brass',desc:'Oval-profile brass handrail with plain turned balusters. The oval profile is significantly more comfortable to grip than round.'},
    {src:'products/railings/rl_7.jpg',name:'Lotus Pad Panel Railing',style:'Naturalist · Antique Bronze',desc:'Flat panels with cut-out lotus pad motifs — semi-perforated, allowing light through while maintaining a decorative profile.'},
    {src:'products/railings/rl_8.jpg',name:'Dravidian Arch Railing',style:'Temple Style · Antique Gold',desc:'Miniature Dravidian arch motif repeated as panel inserts — brings temple architectural vocabulary into the domestic staircase.'},
    {src:'products/railings/rl_9.jpg',name:'Minimal Round Baluster',style:'Modern · Satin Brass',desc:'Clean round brass balusters with a flat-cap top — the most minimal brass railing option for contemporary architecture.'},
    {src:'products/railings/rl_10.jpg',name:'Peacock Feather Panel',style:'Ornate · Antique Gold',desc:'Panels carrying individual peacock feather relief — the feather eye-spot is highlighted with an applied patina ring.'},
    {src:'products/railings/rl_11.jpg',name:'Fluted Column Baluster',style:'Classical · Antique Bronze',desc:'Vertically fluted column-style balusters — a classical architectural motif scaled down to baluster proportions.'},
    {src:'products/railings/rl_12.jpg',name:'Vine Scroll Railing',style:'Colonial · Satin Brass',desc:'Flowing vine and leaf scroll panels — a colonial Indo-European hybrid style that works in heritage bungalows.'},
    {src:'products/railings/rl_13.jpg',name:'Hamsa Bird Baluster',style:'Auspicious · Antique Gold',desc:'Cast brass Hamsa (sacred goose) repeating as the baluster unit — a unique South Indian devotional railing design.'},
    {src:'products/railings/rl_14.jpg',name:'Wide Flat Panel Railing',style:'Bold · Oxidised Bronze',desc:'Wide flat brass panels with minimal surface texture — a bold architectural statement for modern split-level homes.'}
  ],
  poojaadoors:[
    {src:'products/poojaadoors/pd_1.jpg',name:'Gopuram Arch Pooja Door',style:'Temple Style · Antique Gold',desc:'Stepped Gopuram arch frame with Kalasha finial crown. The most traditional South Indian pooja room door form.'},
    {src:'products/poojaadoors/pd_2.jpg',name:'Prabhavali Frame Door',style:'Sacred · Antique Bronze',desc:'Radiating divine halo (Prabhavali) surrounds the door — recreates the sacred gateway of a temple inner sanctum.'},
    {src:'products/poojaadoors/pd_3.jpg',name:'Peacock Jali Screen',style:'Perforated · Satin Brass',desc:'Full-panel peacock jali in white metal. Allows incense, light and the sound of bells to flow through. Evening lamp creates spectacular floor shadows.'},
    {src:'products/poojaadoors/pd_4.jpg',name:'Lotus Medallion Door',style:'Auspicious · Antique Gold',desc:'Oversized Padma lotus medallion centred on the shutter with a Hamsa border. The lotus is the most universally auspicious motif in Hindu tradition.'},
    {src:'products/poojaadoors/pd_5.jpg',name:'Ganesha Blessing Door',style:'Devotional · Antique Bronze',desc:'Full-height Ganesha in seated Abhaya mudra — the remover of obstacles guards the threshold of the sacred space.'},
    {src:'products/poojaadoors/pd_6.jpg',name:'Lakshmi Padma Door',style:'Devotional · Antique Gold',desc:'Goddess Lakshmi on a full-bloom lotus with flanking elephants — the most popular deity commission for pooja room doors.'},
    {src:'products/poojaadoors/pd_7.jpg',name:'Brass-on-Teak Inlay',style:'Mixed Media · Natural Brass',desc:'Geometric brass inlay strips set into solid teak shutter. Bridges traditional craft with a more understated aesthetic.'},
    {src:'products/poojaadoors/pd_8.jpg',name:'Hamsa & Kalasha Door',style:'Auspicious · Antique Bronze',desc:'Pairs of Hamsa surrounding a central Kalasha — both are Vastu-auspicious symbols for the pooja space.'},
    {src:'products/poojaadoors/pd_9.jpg',name:'Om Chakra Door',style:'Spiritual · Antique Gold',desc:'Large Om symbol at centre with a radiating Chakra wheel border. A powerful, non-denominational sacred door design.'},
    {src:'products/poojaadoors/pd_10.jpg',name:'Shiva Nataraja Door',style:'Devotional · Antique Bronze',desc:'Nataraja (dancing Shiva) in full cosmic dance pose — Shaivite tradition. The cosmic dance of creation and destruction at your threshold.'},
    {src:'products/poojaadoors/pd_11.jpg',name:'Saraswati Door',style:'Devotional · Antique Gold',desc:'Goddess Saraswati with veena and lotus — a popular commission for home music rooms that double as pooja spaces.'}
  ],
  handles:[
    {src:'products/handles/hn_1.jpg',name:'Classic D-Pull Handle',style:'Residential · Antique Gold',desc:'Solid cast brass D-pull in 12" length. The most popular everyday handle in our collection — clean, grippy, built to last 50+ years.'},
    {src:'products/handles/hn_2.jpg',name:'Flared D-Pull Handle',style:'Statement · Antique Bronze',desc:'D-pull with flared end caps — the flare provides a more secure grip and a more decorative profile than plain round ends.'}
  ],
  wallarts:[
    {src:'products/wallarts/wa_1.jpg',name:'Kalpavriksha Triptych',style:'Tree of Life · Antique Gold',desc:'Three-panel Tree of Life spanning 6–8 feet. Birds, fruits and blossoms in deep relief. Transforms a living room feature wall.'},
    {src:'products/wallarts/wa_2.jpg',name:'Mahabharata Chariot',style:'Narrative · Antique Bronze',desc:'Arjuna and Krishna on the Kurukshetra chariot — our most requested narrative wall art. Each panel takes 10–12 working days.'},
    {src:'products/wallarts/wa_3.jpg',name:'Peacock Family Panel',style:'Naturalist · Antique Gold',desc:'Peacock in full display with peahen and chicks. Beautiful in dining rooms — pairs with warm ambient lighting.'},
    {src:'products/wallarts/wa_4.jpg',name:'Geometric Yantra Panel',style:'Abstract · Oxidised Bronze',desc:'Concentric Sri Yantra geometry — sacred diagram in brass relief. Perfect for meditation rooms and home offices.'},
    {src:'products/wallarts/wa_5.jpg',name:'Lotus Pond Relief',style:'Naturalist · Antique Gold',desc:'Still lotus pond in layered relief — stems, pads, blooms and fish rendered at three distinct depth levels.'},
    {src:'products/wallarts/wa_6.jpg',name:'Dancing Apsara Panel',style:'Classical · Antique Bronze',desc:'Celestial dancer (Apsara) in Bharatanatyam pose — sourced from temple relief sculpture, adapted for wall art scale.'},
    {src:'products/wallarts/wa_7.jpg',name:'Elephant Frieze Panel',style:'Festive · Antique Gold',desc:'Horizontal elephant frieze — marching elephants with decorated howdahs. Excellent in corridors and above entrance archways.'},
    {src:'products/wallarts/wa_8.jpg',name:'Madhubani-Inspired Panel',style:'Folk Art · Satin Brass',desc:'Madhubani folk art motifs — fish, birds, trees and faces — translated into brass surface relief. A rare folk-to-metal translation.'},
    {src:'products/wallarts/wa_9.jpg',name:'Abstract Hammered Disc',style:'Modern · Bright Polish',desc:'Large circular hammered brass disc — pure tactile surface art. No motif, just the beauty of hand-hammered metal texture.'},
    {src:'products/wallarts/wa_10.jpg',name:'Seven Horses Panel',style:'Auspicious · Antique Gold',desc:'The seven running horses (Sapta Ashva) — a Vastu-auspicious motif traditionally placed on east-facing walls.'}
  ],
  gates:[
    {src:'products/gates/gate_1.jpg',name:'Villa Arch Gate',style:'Grand · Antique Gold',desc:'Full-width villa gate with brass arch top, Kalasha finials and ornate scrollwork inserts. MS structural frame with brass decorative elements.'},
    {src:'products/gates/gate_2.jpg',name:'Scrollwork Pedestrian Gate',style:'Residential · Antique Bronze',desc:'Single-leaf pedestrian gate with hand-forged brass scroll inserts between vertical bars. Perfect for side entrances and garden access.'},
    {src:'products/gates/gate_3.jpg',name:'Floral Panel Gate',style:'Ornate · Antique Gold',desc:'Flat brass floral panel inserts within an MS frame. Each panel carries a different flower — rose, lotus and jasmine.'},
    {src:'products/gates/gate_4.jpg',name:'Geometric Lattice Gate',style:'Contemporary · Oxidised Bronze',desc:'Fine geometric lattice within a clean frame — a modern aesthetic. Pairs well with contemporary glass-and-concrete villa architecture.'},
    {src:'products/gates/gate_5.jpg',name:'Temple Gopuram Gate',style:'Temple Style · Antique Bronze',desc:'Gopuram-style arch gate with tiered top and Kalasha crown. Used for temple premises, ashrams and devotional home entrances.'},
    {src:'products/gates/gate_6.jpg',name:'Double Leaf Villa Gate',style:'Grand Entrance · Antique Gold',desc:'Wide double-leaf vehicular gate with matching pedestrian wicket. Brass finials, central house-name panel and top arch medallion.'},
    {src:'products/gates/gate_7.jpg',name:'Minimalist Bar Gate',style:'Modern · Satin Brass',desc:'Plain vertical bar gate with brass tube framing and satin-finish bar caps — minimal and contemporary. Automation compatible.'},
    {src:'products/gates/gate_8.jpg',name:'Full Brass Pedestrian Gate',style:'Luxury · Antique Bronze',desc:'Full solid brass single-leaf pedestrian gate — no MS frame, pure brass construction. Heavy, stunning and built for a lifetime.'}
  ],
  nameplates:[
    {src:'products/nameplates/np_1.jpg',name:'Deep-Relief Name Plate',style:'Classic · Antique Gold',desc:'Family name in deep-relief cast letters standing 3mm proud of the background. Readable from 15 feet. The standard we are known for.'},
    {src:'products/nameplates/np_2.jpg',name:'Bilingual Name Plate',style:'Bilingual · Antique Bronze',desc:'English name above, Kannada/Tamil/Telugu script below — same deep-relief casting standard. Popular in Bengaluru homes.'},
    {src:'products/nameplates/np_3.jpg',name:'Deity Motif Name Plate',style:'Auspicious · Antique Gold',desc:'Family name with a small deity head (Ganesha, Lakshmi or custom) cast above the lettering as a protective symbol.'},
    {src:'products/nameplates/np_4.jpg',name:'House Number + Name Combo',style:'Practical · Antique Bronze',desc:'Large house number in the upper field, family name below. Both in deep-relief. Standard apartment and villa residential format.'},
    {src:'products/nameplates/np_5.jpg',name:'Lotus Border Plate',style:'Decorative · Antique Gold',desc:'Family name centred within a lotus petal border frame — the border itself is as decorative as the lettering.'},
    {src:'products/nameplates/np_6.jpg',name:'Arch-Top Name Plate',style:'Heritage · Antique Bronze',desc:'Arched top with a small Kalasha at the apex — a heritage bungalow style. Name in serif lettering below the arch.'},
    {src:'products/nameplates/np_7.jpg',name:'Minimal Flat Plate',style:'Modern · Satin Brass',desc:'Flat brass plate, flush lettering in a clean sans-serif — for contemporary homes that want brass without traditional motifs.'}
  ],
  accessories:[
    {src:'products/accessories/acc_1.jpg',name:'Deepa Stand — 24"',style:'Pooja · Antique Gold',desc:'24-inch single-flame brass Deepa stand on a weighted base. Cast in solid brass with lotus petal column detailing.'},
    {src:'products/accessories/acc_2.jpg',name:'Pancha Deepa Stand',style:'Ceremonial · Antique Bronze',desc:'Five-flame Deepa stand — for five-flame aarti rituals. The arms are cast as lotus stems. A daily worship centrepiece.'},
    {src:'products/accessories/acc_3.jpg',name:'Kalasha / Kumbha',style:'Ritual · Antique Gold',desc:'Sacred Kalasha vessel with pronounced belly-to-neck taper, lotus engravings and solid brass coconut top. For all major rituals.'},
    {src:'products/accessories/acc_4.jpg',name:'Aarti Thali with Lamp',style:'Daily Use · Antique Gold',desc:'Circular aarti plate with embossed lotus border and a central oil lamp depression. 10" diameter, everyday devotional use.'},
    {src:'products/accessories/acc_5.jpg',name:'Temple Bell — 6"',style:'Devotional · Bell Bronze',desc:'6-inch hanging temple bell cast in bell-bronze alloy for maximum resonance. Wall bracket with Hamsa motif included.'},
    {src:'products/accessories/acc_6.jpg',name:'Agarbatti Stand — 11 Stick',style:'Pooja · Antique Gold',desc:'Linear incense holder for 11 sticks with a deep-bowl ash catcher. Cast brass, stable base, lotus column design.'},
    {src:'products/accessories/acc_7.jpg',name:'Deity Stand — Double Tier',style:'Pooja · Antique Bronze',desc:'Double-tier brass Peetham (deity stand) with lotus base and stepped platform. Accommodates two idols or a main idol with accessories.'}
  ],
  internaldoors:[
    {src:'products/internaldoors/id_1.jpg',name:'Study Door with Jali',style:'Home Office · Antique Gold',desc:'Solid brass jali panel inset in a teak shutter. Allows natural light while maintaining acoustic separation. Ideal for study rooms.'},
    {src:'products/internaldoors/id_2.jpg',name:'Master Bedroom Door',style:'Intimate · Antique Bronze',desc:'Hamsa motif at eye level on a satin-finish brass panel — scaled for an internal 2.5×7ft shutter. Privacy meets artistry.'},
    {src:'products/internaldoors/id_3.jpg',name:'Dining Room Arch Door',style:'Formal · Antique Gold',desc:'Double-leaf internal dining room door with arched transom — creates a formal dining experience from the first step through.'},
    {src:'products/internaldoors/id_4.jpg',name:'Corridor Panel Door',style:'Passage · Satin Brass',desc:'Single strong central motif — a lotus medallion — on a plain brass field. Elegant restraint for narrow corridor doors.'},
    {src:'products/internaldoors/id_5.jpg',name:'Bedroom Peacock Door',style:'Ornate Interior · Antique Bronze',desc:'Peacock in three-quarter display — scaled for bedroom door proportions. Softer embossing depth for interior use.'},
    {src:'products/internaldoors/id_6.jpg',name:'Pooja Ante-Chamber Door',style:'Sacred · Antique Gold',desc:'Perforated brass screen for the ante-chamber before the pooja room — a dramatic threshold visible from the living area.'}
  ],
  bannister:[
    {src:'products/bannister/bn_1.jpg',name:'Scroll-End Round Bannister',style:'Traditional · Antique Gold',desc:'Round-profile brass handrail terminating in a hand-forged scroll at the base newel. A strongly South Indian traditional detail.'},
    {src:'products/bannister/bn_2.jpg',name:'Oval Profile Bannister',style:'Ergonomic · Satin Brass',desc:'Oval cross-section handrail — the flat top surface is significantly more comfortable for a sustained grip, especially for elderly users.'},
    {src:'products/bannister/bn_3.jpg',name:'Reeded Round Bannister',style:'Classical · Antique Bronze',desc:'Round rail with vertical reeding (fluting) running along its entire length — a classical architectural detail at banister scale.'}
  ],
  traderdoor:[
    {src:'products/traderdoor/td_1.jpg',name:'Jewellery Showroom Door',style:'Commercial Luxury · Antique Gold',desc:'Full brass-clad showroom entry door — the door itself becomes a display of the craft sold inside. Multiple lock points.'},
    {src:'products/traderdoor/td_2.jpg',name:'Heritage Restaurant Door',style:'Hospitality · Antique Bronze',desc:'Brass-panel door with vintage typography nameplate — positions the restaurant\'s heritage credentials before the guest enters.'},
    {src:'products/traderdoor/td_3.jpg',name:'Temple Entrance Door',style:'Religious · Antique Gold',desc:'Heavy reinforced temple entrance with full-panel deity relief — built for thousands of daily uses. 16-gauge MS frame.'},
    {src:'products/traderdoor/td_4.jpg',name:'Corporate Office Door',style:'Professional · Oxidised Bronze',desc:'Company monogram in oxidised bronze on a plain field — restrained prestige for a corporate lobby or boardroom entrance.'},
    {src:'products/traderdoor/td_5.jpg',name:'Textile Showroom Door',style:'Traditional Retail · Antique Gold',desc:'Jali-panel brass door with vision-panel insert — staff can see visitors approaching while the door remains locked.'},
    {src:'products/traderdoor/td_6.jpg',name:'Bank Branch Entry',style:'Secure · Antique Bronze',desc:'Heavy brass-panel door with concealed multi-point locking — combines visual grandeur with Grade 3 security rating.'}
  ],
  vaskaals:[
    {src:'products/vaskaals/vk_1.jpg',name:'Plain Cylindrical Vaskaal',style:'Classic · Antique Gold',desc:'The original vaskaal form — plain cylindrical shaft, flared ends, cast in a single brass pour. 14" length. The definitive South Indian door handle.'},
    {src:'products/vaskaals/vk_2.jpg',name:'Faceted Octagonal Vaskaal',style:'Premium · Antique Bronze',desc:'Eight flat faces along the shaft length. Each face catches light differently — creates a jewellery-like quality in the hand.'},
    {src:'products/vaskaals/vk_3.jpg',name:'Twisted Rope Vaskaal',style:'Dynamic · Antique Gold',desc:'Rope-twist shaft — twisted during casting. Creates a strong visual rhythm and a tactile grip superior to a plain cylinder.'},
    {src:'products/vaskaals/vk_4.jpg',name:'Carved Flare Vaskaal',style:'Ornate · Antique Bronze',desc:'The flared ends carry shallow-relief lotus petals and Kolam-inspired geometric carving — the most decorative vaskaal in our range.'},
    {src:'products/vaskaals/vk_5.jpg',name:'Long Vaskaal — 18"',style:'Commercial Scale · Antique Gold',desc:'18-inch (455mm) vaskaal for large commercial and temple doors. Palm-grip scale — designed for high-frequency daily use.'},
    {src:'products/vaskaals/vk_6.jpg',name:'Short Vaskaal — 10"',style:'Residential · Antique Bronze',desc:'10-inch (250mm) vaskaal — the compact residential variant, proportioned for standard 3ft wide main doors.'}
  ]
};

// map post id → gallery key + panel title
var postGalleryMap={
  1:{key:'maindoors',title:'Brass Main Door Designs',sub:'10 designs — click any to enlarge'},
  2:{key:'railings',title:'Brass Railing Designs',sub:'14 featured styles'},
  3:{key:'poojaadoors',title:'Pooja Room Door Designs',sub:'11 featured designs'},
  4:{key:'handles',title:'Door Handles & Hardware',sub:'All handle styles'},
  5:{key:'wallarts',title:'Brass Wall Art Designs',sub:'10 featured designs'},
  6:{key:'gates',title:'Villa Gate Designs',sub:'All gate styles'},
  7:{key:'nameplates',title:'Brass Name Plate Designs',sub:'7 featured styles'},
  8:{key:'accessories',title:'Brass Accessories',sub:'7 featured pieces'},
  9:{key:'doubledoor',title:'Custom Double Door Designs',sub:'All 8 designs'},
  10:{key:'internaldoors',title:'Internal Door Designs',sub:'All 6 designs'},
  11:{key:'bannister',title:'Brass Bannister Styles',sub:'All 3 styles'},
  12:{key:'newdoubledoor',title:'Grand Double Door Designs',sub:'All 12 designs'},
  13:{key:'traderdoor',title:'Commercial Door Designs',sub:'All 6 designs'},
  14:{key:'accessories',title:'Pooja Accessory Range',sub:'7 featured pieces'},
  15:{key:'vaskaals',title:'Vaskaal Collection',sub:'All 6 styles'}
};

