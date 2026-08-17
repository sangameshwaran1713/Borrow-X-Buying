import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Repeat, MapPin, Sparkles, ArrowRight, Zap, CheckCircle2, HeartHandshake, Filter } from 'lucide-react';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import Button from '../components/ui/Button';

export default function Home({ onOpenAuthModal }) {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const { data } = await api.get('/items/nearby', {
        params: { distance: 50000 }
      });
      setFeaturedItems(data.slice(0, 4));
    } catch (err) {
      console.error('Error loading featured items:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/explore?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* HERO SECTION - Asymmetric 55/45 Layout */}
      <section className="relative bg-gradient-to-br from-[#001F4D] via-[#0A1F3F] to-[#0F172A] text-white overflow-hidden py-16 sm:py-24">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-navy-500/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content (55% / 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Tagline Badge */}
              <div className="inline-flex items-center space-x-2 bg-navy-900/90 border border-teal-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-teal-300 shadow-elevation-2 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Hyperlocal Peer-to-Peer Sharing Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                Borrow Tools, Electronics & Outdoor Gear <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-teal-200 to-teal-400">
                  From Neighbors You Trust
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                Why buy expensive single-use items? Save up to 90%, reduce clutter, and build trust in your neighborhood with bank-grade liveness verification, QR-verified handovers, and dynamic trust scores.
              </p>

              {/* Search Bar Widget (Floating 56px) */}
              <form onSubmit={handleSearchSubmit} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl shadow-elevation-4 border border-white/20 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
                
                <div className="flex-1 flex items-center space-x-3 px-3 w-full">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="What do you need? (e.g. Lawn Mower, DSLR Camera, Drill)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none placeholder-slate-400 py-2.5"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl border-none focus:ring-2 focus:ring-teal-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="">All Categories</option>
                  <option value="Tools">Tools</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Sports">Sports</option>
                  <option value="HomeGoods">Home Goods</option>
                </select>

                <Button type="submit" variant="secondary" size="md" className="w-full sm:w-auto shrink-0">
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

              </form>

              {/* Key Metrics Row */}
              <div className="pt-4 grid grid-cols-3 gap-4 max-w-lg border-t border-slate-800/80">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">98%</div>
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest mt-0.5">Trust Rating</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">&lt; 1.5 km</div>
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest mt-0.5">Avg. Distance</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">₹0 Deposit</div>
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest mt-0.5">Free Share Option</div>
                </div>
              </div>

            </div>

            {/* Right Visual Card (45% / 5 cols) */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-elevation-4 border border-slate-700/60 bg-slate-900 group">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                  alt="Community Sharing"
                  className="w-full h-[420px] object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-8 flex flex-col justify-end">
                  <div className="bg-teal-500/20 backdrop-blur-md border border-teal-400/40 text-teal-300 px-3 py-1 rounded-full text-xs font-black inline-flex items-center space-x-1.5 w-max mb-3">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Bank-Grade eKYC Verified</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Verified Local Item Sharing</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Every borrower and lender is identity-verified with facial liveness scanning and GPS neighborhood tagging.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES GRID SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Explore Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Browse items available in your immediate locality</p>
          </div>
          <Link to="/explore" className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            { name: 'Tools & Hardware', category: 'Tools', count: '140+ listed', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80' },
            { name: 'Electronics & Audio', category: 'Electronics', count: '95+ listed', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80' },
            { name: 'Sports & Camping', category: 'Sports', count: '80+ listed', image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=400&q=80' },
            { name: 'Home & Lawn Care', category: 'HomeGoods', count: '110+ listed', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' }
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={`/explore?category=${cat.category}`}
              className="group relative h-44 rounded-3xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-4 transition-all duration-300 transform hover:-translate-y-1"
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent p-4 flex flex-col justify-end">
                <h3 className="font-extrabold text-white text-base group-hover:text-teal-300 transition-colors">{cat.name}</h3>
                <span className="text-[11px] text-teal-300 font-bold">{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED ITEMS NEARBY */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center space-x-2 text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">
                <MapPin className="w-4 h-4" />
                <span>Hyperlocal Nearby Feed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Available to Borrow Now</h2>
            </div>
            <Link to="/explore" className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1">
              <span>Explore All Items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">How Hyperlocal Borrowing Works</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">Built on trust score verification & QR code physical handovers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-elevation-1 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-navy-50 dark:bg-navy-900/60 rounded-2xl flex items-center justify-center text-[#001F4D] dark:text-teal-300 mb-6 font-black text-xl border border-navy-200 dark:border-navy-700">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2">Discover Nearby Items</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Search tools and gear within 5km of your doorstep. Filter by price, category, or free neighbor shares.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-elevation-1 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/60 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-300 mb-6 font-black text-xl border border-teal-200 dark:border-teal-800">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2">QR Verified Handover</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upon request approval, generate a digital pass. Scan the owner's QR code during pickup to lock the deposit safely.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-elevation-1 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-300 mb-6 font-black text-xl border border-emerald-200 dark:border-emerald-800">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2">Return & Trust Level Up</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Return the item, confirm return in-app, release deposit, and earn community trust points to boost your borrow score!
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
