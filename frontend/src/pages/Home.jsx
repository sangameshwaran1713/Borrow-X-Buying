import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Repeat, MapPin, Sparkles, ArrowRight, Zap, CheckCircle2, HeartHandshake } from 'lucide-react';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';

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
    <div className="min-h-screen bg-slate-50">
      
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden py-20 lg:py-28">
        
        {/* Glowing Ambient Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary-600/30 to-secondary-600/30 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Pill Header */}
            <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-semibold text-primary-300 mb-6 shadow-xl backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hyperlocal Peer-to-Peer Sharing Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
              Borrow Tools, Electronics & Outdoor Gear <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-sky-300 to-secondary-400">
                From Neighbors You Trust
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10 font-normal">
              Why buy expensive single-use items? Save up to 90%, reduce clutter, and build trust in your neighborhood with QR-verified handovers and dynamic trust scores.
            </p>

            {/* Search Bar Widget */}
            <form onSubmit={handleSearchSubmit} className="bg-white/95 backdrop-blur-xl p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto">
              
              <div className="flex-1 flex items-center space-x-3 px-3 w-full">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="What do you need? (e.g. Lawn Mower, DSLR Camera, Drill)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-slate-900 text-sm font-medium focus:outline-none placeholder-slate-400 py-2"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-100 text-slate-700 text-xs font-semibold py-3 px-4 rounded-xl border-none focus:ring-2 focus:ring-primary-500 cursor-pointer w-full sm:w-auto"
              >
                <option value="">All Categories</option>
                <option value="Tools">Tools</option>
                <option value="Electronics">Electronics</option>
                <option value="Sports">Sports</option>
                <option value="HomeGoods">Home Goods</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-95 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-primary-600/30 flex items-center justify-center space-x-2 shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Quick Stats Pill */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-8 max-w-xl mx-auto text-center">
              <div>
                <div className="text-2xl font-extrabold text-white">98%</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Trust Rating</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">&lt; 1.5 km</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Avg. Distance</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">₹0 Deposit</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Free Share Option</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES GRID SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Browse items available in your immediate locality</p>
          </div>
          <Link to="/explore" className="text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1">
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
              className="group relative h-44 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent p-4 flex flex-col justify-end">
                <h3 className="font-bold text-white text-base group-hover:text-primary-300 transition-colors">{cat.name}</h3>
                <span className="text-[11px] text-slate-300 font-medium">{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED ITEMS NEARBY */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
                <MapPin className="w-4 h-4" />
                <span>Hyperlocal Nearby Feed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Available to Borrow Now</h2>
            </div>
            <Link to="/explore" className="text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1">
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

      {/* HOW IT WORKS / TRUST SYSTEM HIGHLIGHT */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Hyperlocal Borrowing Works</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">Built on trust score verification & QR code physical handovers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6 font-extrabold text-xl">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Discover Nearby Items</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Search tools and gear within 5km of your doorstep. Filter by price, category, or free neighbor shares.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-secondary-50 rounded-2xl flex items-center justify-center text-secondary-600 mb-6 font-extrabold text-xl">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">QR Verified Handover</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upon request approval, generate a digital pass. Scan the owner's QR code during pickup to lock the deposit safely.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 font-extrabold text-xl">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Return & Trust Level Up</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Return the item, confirm return in-app, release deposit, and earn community trust points to boost your borrow score!
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
