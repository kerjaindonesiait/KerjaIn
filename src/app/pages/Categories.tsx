import { useState } from "react";
import { Link } from "react-router";
import { ChevronRight, TrendingUp, MapPin, Search } from "lucide-react";

const POPULAR_SERVICES = [
  { name: "Removals",           jobs: "8,782", emoji: "🚛", from: "#dbeafe", to: "#bfdbfe" },
  { name: "Furniture Removals", jobs: "6,249", emoji: "🛋️", from: "#ede9fe", to: "#ddd6fe" },
  { name: "Rubbish Removal",    jobs: "5,879", emoji: "🗑️", from: "#fef3c7", to: "#fde68a" },
  { name: "Cleaning",           jobs: "4,941", emoji: "🧹", from: "#d1fae5", to: "#a7f3d0" },
  { name: "Handyman",           jobs: "2,521", emoji: "🔧", from: "#fee2e2", to: "#fecaca" },
];

const TRENDING_SERVICES = [
  { name: "Mould Removal",    growth: "186%", emoji: "🏠", from: "#fce7f3", to: "#fbcfe8" },
  { name: "Mystery Shopping", growth: "102%", emoji: "🛍️", from: "#fef9c3", to: "#fef08a" },
  { name: "Internet Help",    growth: "100%", emoji: "📡", from: "#e0f2fe", to: "#bae6fd" },
  { name: "Retaining Walls",  growth: "90%",  emoji: "🧱", from: "#f0fdf4", to: "#bbf7d0" },
  { name: "Ceiling Cleaning", growth: "76%",  emoji: "✨", from: "#f5f3ff", to: "#ede9fe" },
];

const LOCATIONS = [
  { name: "New York",    emoji: "🗽", from: "#dbeafe", to: "#93c5fd" },
  { name: "Los Angeles", emoji: "🌴", from: "#fef3c7", to: "#fcd34d" },
  { name: "Chicago",     emoji: "🌆", from: "#f0fdf4", to: "#86efac" },
  { name: "Houston",     emoji: "⭐", from: "#fce7f3", to: "#f9a8d4" },
  { name: "Miami",       emoji: "🏖️", from: "#e0f2fe", to: "#7dd3fc" },
];

const ALL_CATEGORIES = [
  "Accounting","Admin","Alterations","Appliances","Architects","Assembly","Audio Visual",
  "Auto Electrician","Bakers","Balloon Delivery","Barbers","Bathroom Renovation","Beauticians",
  "Bicycle Service","Bricklayer","Building & Construction","Business","Cake Delivery",
  "Car Body Work","Car Detailing","Car Inspection","Car Repair","Car Service","Car Wash",
  "Carpentry","Carpet Cleaning","Cat Care","Catering","Chef","Childcare & Safety","Cladding",
  "Cleaning","Clearance Services","Coaching","Coffee Delivery","Commercial Cleaning",
  "Computers & IT","Concreting","Cooking","Counselling & Therapy","Courier Services",
  "Dance Lessons","Decking","Delivery","Design","Dessert Delivery","Dog Care","Draftsman",
  "Driving","Electricians","Electronic Repair","Engraving","Entertainment","Events",
  "Fencing","Fitness","Flooring","Florist","Food Delivery","Furniture Assembly",
  "Furniture Repair","Gardening","Gate Installation","Glaziers","Grocery Delivery",
  "Hair Removal","Hairdressers","Handyman","Health & Wellness","Heating & Cooling",
  "Home Automation","House Cleaning","Interior Designer","Kitchen Renovation","Landscaping",
  "Laundry","Lawn Care","Legal Services","Lessons","Locksmith","Makeup Artist",
  "Marketing","Mechanic","Painting","Pest Control","Pet Care","Photographers",
  "Plumbing","Pool Maintenance","Removals","Roofing","Rubbish Removal","Tailors",
  "Tiling","Translation","Tree Surgeons","Tutoring","Wall Hanging","Window Cleaning","Writing",
];

const CATEGORY_DETAILS = [
  {
    name: "Accounting", slug: "accounting",
    emoji: "📊", from: "#dbeafe", to: "#bfdbfe",
    description: "Managing personal and business finances with expert advice on tax, planning and reporting.",
    subcategories: ["Budgeting Help","Financial Advisor","Financial Modelling","Financial Planning","Financial Reporting","MYOB Training","Mortgage Advisor","Pension Advisor","Tax Advisor","XERO Training"],
  },
  {
    name: "Admin", slug: "admin",
    emoji: "🗂️", from: "#f0fdf4", to: "#bbf7d0",
    description: "Reliable admin assistance at short notice for offices and individuals — from data entry to virtual assistance.",
    subcategories: ["Data Entry","Document Filing","HR Services","Office Work","Personal Assistant","Research Assistant","Typist","Virtual Assistant","eBay Selling Assistance"],
  },
  {
    name: "Assembly", slug: "assembly",
    emoji: "🪑", from: "#fef3c7", to: "#fde68a",
    description: "Flatpack furniture assembled by pros — faster, safer, and correct results every time.",
    subcategories: ["BBQ Assembly","Exercise Bike Assembly","Home Gym Assembly","IKEA Assembly","Kids Bike Assembly","Playground Assembly","Pool Table Assembly","Treadmill Assembly","Trampoline Assembly","Toy Assembly"],
  },
  {
    name: "Cleaning", slug: "cleaning",
    emoji: "🧹", from: "#d1fae5", to: "#a7f3d0",
    description: "Trusted experts tackling tough stains and transforming dirty spaces — residential, commercial, and specialty.",
    subcategories: ["Airbnb Cleaning","Apartment Cleaning","Carpet Cleaning","Couch Cleaning","End of Lease Cleaning","House Cleaning","Mould Removal","Office Cleaning","Oven Cleaning","Steam Cleaning","Upholstery Cleaning","Window Cleaning"],
  },
  {
    name: "Computers & IT", slug: "computers-it",
    emoji: "💻", from: "#e0f2fe", to: "#bae6fd",
    description: "Friendly, knowledgeable computer technicians for home or work problems — repairs, setup, training and more.",
    subcategories: ["App Development","Computer Repairs","Data Recovery","Email Setup","Home Network Setup","IT Support","Laptop Repair","Malware Removal","Software Help","Virus Removal","Wifi Help","Windows Installation"],
  },
  {
    name: "Delivery", slug: "delivery",
    emoji: "📦", from: "#fce7f3", to: "#fbcfe8",
    description: "Parcels, documents, furniture, food — pick-up and delivery on your schedule, large or small.",
    subcategories: ["Bunnings Delivery","Furniture Delivery","IKEA Delivery","Kmart Delivery","Parcel Delivery","TV Delivery","Ute Removals","Wardrobe Delivery","eBay Delivery"],
  },
  {
    name: "Design", slug: "design",
    emoji: "🎨", from: "#ede9fe", to: "#ddd6fe",
    description: "Freelance designers for branding, graphic, print, digital, animation — from logo to full brand identity.",
    subcategories: ["3D Modelling","Branding Designer","Brochure Design","Business Card Design","Flyer Design","Graphic Designers","Logo Design","Packaging Design","Poster Design","UI Design","UX Design"],
  },
  {
    name: "Electricians", slug: "electricians",
    emoji: "⚡", from: "#fef9c3", to: "#fef08a",
    description: "Registered electricians for connections, repairs, and installations — residential and commercial.",
    subcategories: ["Aircon Installation","Aircon Repair","Christmas Light Installation","Downlights Installation","Electrical Installation","Electrical Rewiring","Light Installation","Power Point Installation","Smoke Alarm Installation","Solar Panel Installation"],
  },
  {
    name: "Gardening", slug: "gardening",
    emoji: "🌿", from: "#f0fdf4", to: "#bbf7d0",
    description: "Skilled gardeners for mowing, mulching, weeding, pruning and full landscape transformations.",
    subcategories: ["Garden Design","Garden Maintenance","Hedge Trimming","Lawn Mowing","Leaf Blowing","Mulching","Pruning","Tree Lopping","Turf Laying","Weed Control"],
  },
  {
    name: "Handyman", slug: "handyman",
    emoji: "🔧", from: "#fee2e2", to: "#fecaca",
    description: "All-around help with home maintenance — from mounting TVs to patching walls, shelving and more.",
    subcategories: ["Blind Installation","Curtain Rod Installation","Door Repair","Flat Pack Assembly","Gutter Cleaning","Plasterboard Repair","Shelf Installation","TV Wall Mounting","Tile Repair","Window Repair"],
  },
  {
    name: "Painting", slug: "painting",
    emoji: "🖌️", from: "#fdf4ff", to: "#f5d0fe",
    description: "Interior and exterior wall painting — from feature walls to full house repaints by experienced painters.",
    subcategories: ["Ceiling Painting","Commercial Painting","Deck Painting","Exterior Painting","Feature Wall Painting","Interior Painting","Roof Painting","Spray Painting","Waterproofing"],
  },
  {
    name: "Removals", slug: "removals",
    emoji: "🚛", from: "#dbeafe", to: "#bfdbfe",
    description: "Packing, wrapping, loading and moving — professional removalists for local and interstate moves.",
    subcategories: ["Backloading","Furniture Removals","Interstate Removals","Local Removals","Office Removals","Piano Movers","Pool Table Movers","Storage Services","Ute Hire & Delivery"],
  },
];

function GradientCard({ from, to, children, className = "" }: { from: string; to: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {children}
    </div>
  );
}

function ServiceCard({ name, stat, emoji, from, to, label }: { name: string; stat: string; emoji: string; from: string; to: string; label: string }) {
  return (
    <Link to="/tasks" className="group flex-shrink-0 w-[200px] rounded-2xl overflow-hidden bg-white border border-[#c8dfd8] hover:shadow-lg transition-all hover:border-transparent">
      <GradientCard from={from} to={to} className="h-[110px] flex items-center justify-center group-hover:brightness-95 transition-all">
        <span className="text-[48px]">{emoji}</span>
      </GradientCard>
      <div className="p-4">
        <p className="font-bold text-[14px] text-[#0f2035] leading-snug mb-0.5">{name}</p>
        <p className="text-[12px] text-[#3d6b5e]">{stat} {label}</p>
      </div>
    </Link>
  );
}

function CategoryCard({ cat }: { cat: typeof CATEGORY_DETAILS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? cat.subcategories : cat.subcategories.slice(0, 6);

  return (
    <div id={cat.slug} className="bg-white rounded-2xl border border-[#c8dfd8] overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <GradientCard from={cat.from} to={cat.to} className="sm:w-[180px] shrink-0 h-[120px] sm:h-auto flex items-center justify-center">
          <span className="text-[56px]">{cat.emoji}</span>
        </GradientCard>
        <div className="flex-1 p-5">
          <h3 className="font-black text-[17px] text-[#1a2d4a] mb-1.5">
            <Link to="/tasks" className="hover:text-[#2E5090] transition-colors">{cat.name}</Link>
          </h3>
          <p className="text-[13px] text-[#3d6b5e] mb-4 leading-relaxed">{cat.description}</p>
          {cat.subcategories.length > 0 && (
            <div>
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mb-3">
                {visible.map((sub) => (
                  <li key={sub}>
                    <Link to="/tasks" className="text-[13px] text-[#1a3d5c] hover:text-[#2E5090] transition-colors">{sub}</Link>
                  </li>
                ))}
              </ul>
              {cat.subcategories.length > 6 && (
                <button onClick={() => setExpanded(!expanded)} className="text-[12px] font-bold text-[#2E5090] hover:underline flex items-center gap-1">
                  {expanded ? "Show less" : `+${cat.subcategories.length - 6} more`}
                  <ChevronRight size={13} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const [search, setSearch] = useState("");

  const filteredAlpha = ALL_CATEGORIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  const grouped = filteredAlpha.reduce<Record<string, string[]>>((acc, cat) => {
    const letter = cat[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(cat);
    return acc;
  }, {});
  const filteredDetails = CATEGORY_DETAILS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>

      {/* ── HERO ── */}
      <section className="bg-[#1a2d4a] relative overflow-hidden min-h-[240px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-60px] right-[-40px] w-[400px] h-[400px] rounded-full bg-[#2E5090]/20 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[20%] w-[300px] h-[300px] rounded-full bg-[#F59E42]/10 blur-3xl" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 pt-10 pb-12">
          <div className="flex items-center gap-1.5 text-white/50 text-[13px] mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="text-white">Services</span>
          </div>
          <h1 className="font-black text-[44px] sm:text-[52px] leading-tight text-white mb-3">
            Discover what you can<br className="hidden sm:block" /> get done near you
          </h1>
          <p className="text-white/70 text-[16px] mb-8 max-w-lg">
            From home cleaning to graphic design — connect with trusted local Taskers for anything.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/tasks" className="bg-[#2E5090] text-white font-bold text-[14px] px-7 py-3 rounded-full hover:bg-[#1e3d7a] transition-colors">
              Post a task
            </Link>
            <Link to="/tasks" className="bg-white/10 border border-white/30 text-white font-bold text-[14px] px-7 py-3 rounded-full hover:bg-white/20 transition-colors">
              Browse tasks
            </Link>
          </div>
        </div>
      </section>

      {/* ── POPULAR SERVICES ── */}
      <section className="py-12 max-w-[1400px] mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-black text-[26px] text-[#1a2d4a]">Popular services near you</h2>
            <p className="text-[#3d6b5e] text-[13px] mt-1">Highest task volume in the last 30 days</p>
          </div>
          <Link to="/tasks" className="hidden sm:flex items-center gap-1 text-[#2E5090] font-bold text-[13px] hover:underline whitespace-nowrap">
            See more <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {POPULAR_SERVICES.map((s) => (
            <ServiceCard key={s.name} name={s.name} stat={s.jobs} emoji={s.emoji} from={s.from} to={s.to} label="jobs posted" />
          ))}
        </div>
      </section>

      {/* ── TRENDING SERVICES ── */}
      <section className="py-12 bg-[#F5F1E8]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={20} className="text-[#2E5090]" />
                <h2 className="font-black text-[26px] text-[#1a2d4a]">Trending services</h2>
              </div>
              <p className="text-[#3d6b5e] text-[13px]">Biggest growth vs. prior 30-day period</p>
            </div>
            <Link to="/tasks" className="hidden sm:flex items-center gap-1 text-[#2E5090] font-bold text-[13px] hover:underline whitespace-nowrap">
              See more <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {TRENDING_SERVICES.map((s) => (
              <Link key={s.name} to="/tasks" className="group flex-shrink-0 w-[200px] rounded-2xl overflow-hidden bg-white border border-[#c8dfd8] hover:shadow-lg transition-all hover:border-transparent">
                <GradientCard from={s.from} to={s.to} className="h-[110px] relative flex items-center justify-center group-hover:brightness-95 transition-all">
                  <span className="text-[48px]">{s.emoji}</span>
                  <div className="absolute top-2.5 right-2.5 bg-[#20bf6f] text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <TrendingUp size={9} /> {s.growth}
                  </div>
                </GradientCard>
                <div className="p-4">
                  <p className="font-bold text-[14px] text-[#0f2035]">{s.name}</p>
                  <p className="text-[12px] text-[#20bf6f] font-semibold mt-0.5">↑ {s.growth} growth</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR LOCATIONS ── */}
      <section className="py-12 max-w-[1400px] mx-auto px-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={20} className="text-[#2E5090]" />
          <h2 className="font-black text-[26px] text-[#1a2d4a]">Popular locations</h2>
        </div>
        <p className="text-[#3d6b5e] text-[13px] mb-6">Browse KerjaIn services in cities near you</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {LOCATIONS.map((loc) => (
            <Link key={loc.name} to="/tasks" className="group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer">
              <GradientCard from={loc.from} to={loc.to} className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:brightness-95 transition-all">
                <span className="text-[44px]">{loc.emoji}</span>
                <p className="font-black text-[15px] text-[#0f2035]">{loc.name}</p>
              </GradientCard>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BROWSE ALL CATEGORIES ── */}
      <section className="py-14 bg-[#F5F1E8]">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-black text-[30px] text-[#1a2d4a] mb-2">Browse all categories</h2>
          <p className="text-[#3d6b5e] text-[14px] mb-8">Find the right service for any task, big or small</p>

          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-[#b8d4c8] max-w-md mb-10 focus-within:border-[#2E5090] transition-colors shadow-sm">
            <Search size={16} className="text-[#7a9a8f] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="bg-transparent text-[14px] text-[#1a3d5c] placeholder-[#7a9a8f] outline-none w-full"
            />
          </div>

          {/* Alphabetical index */}
          {!search && (
            <div className="bg-white rounded-2xl border border-[#c8dfd8] p-6 mb-10">
              {Object.entries(grouped).sort().map(([letter, cats]) => (
                <div key={letter} className="flex gap-x-2 gap-y-0 items-baseline flex-wrap mb-3 last:mb-0">
                  <span className="font-black text-[13px] text-[#2E5090] w-5 shrink-0">{letter}</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {cats.map((cat) => (
                      <a key={cat} href={`#${cat.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                        className="text-[13px] text-[#1a3d5c] hover:text-[#2E5090] transition-colors">
                        {cat}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {(search ? filteredDetails : CATEGORY_DETAILS).map((cat) => (
              <CategoryCard key={cat.slug} cat={cat} />
            ))}
          </div>

          {!search && (
            <div className="mt-8 text-center">
              <p className="text-[#3d6b5e] text-[13px] mb-4">Can't find what you're looking for?</p>
              <Link to="/tasks" className="inline-flex items-center gap-2 bg-[#2E5090] text-white font-bold text-[14px] px-7 py-3 rounded-full hover:bg-[#1e3d7a] transition-colors">
                Post a custom task <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
