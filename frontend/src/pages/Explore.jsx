import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Grid, SlidersHorizontal, Sparkles, RefreshCw, Tag, Check } from 'lucide-react';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [distance, setDistance] = useState(50000);
  const [allowFreeOnly, setAllowFreeOnly] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [category, allowFreeOnly]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/items/nearby', {
        params: {
          longitude: 79.8711,
          latitude: 12.1697,
          distance,
          category,
          search,
          allowFree: allowFreeOnly
        }
      });
      setItems(data || []);
    } catch (err) {
      console.error('Failed to fetch explore items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const categories = [
    { label: 'All Items', value: '' },
    { label: 'Tools & Hardware', value: 'Tools' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Sports & Camping', value: 'Sports' },
    { label: 'Home & Gardening', value: 'HomeGoods' },
    { label: 'Other', value: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Nearby Items</h1>
            <p className="text-xs text-slate-500 mt-1">Discover items available for borrowing in your locality</p>
          </div>

          {/* Grid vs Map Toggle */}
          <div className="bg-slate-200 p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-primary-600" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-8">
          
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search items by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </form>

          {/* Quick Filter Pills & Distance Slider */}
          <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-4">
            
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    category === c.value
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Distance Slider & Free Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAllowFreeOnly(!allowFreeOnly)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                  allowFreeOnly
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Free Share Only</span>
              </button>

              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Max Radius:</span>
                <span className="font-bold text-slate-900">{(distance / 1000).toFixed(0)} km</span>
              </div>
            </div>

          </div>

        </div>

        {/* Content Display */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Fetching nearby listings...</p>
          </div>
        ) : viewMode === 'grid' ? (
          items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No items found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search term or radius slider.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )
        ) : (
          /* MAP VIEW MODE */
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl relative min-h-[500px] border border-slate-800 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            
            <div className="relative z-10 flex justify-between items-center bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 mb-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Hyperlocal Geospatial Pins</h3>
                  <p className="text-[11px] text-slate-400">{items.length} active listings anchored near Downtown Center</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-mono font-bold">
                2DSphere Active
              </span>
            </div>

            {/* Map Grid Pin Visualizer */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-auto">
              {items.map((item, idx) => (
                <div
                  key={item._id}
                  className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl backdrop-blur-md hover:border-primary-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                    <span className="text-xs font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>📍 {(item.distance ? item.distance / 1000 : 0.8).toFixed(1)} km away</span>
                    <span className="font-bold text-white">₹{item.rentalPrice?.amount}/day</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
              📌 All pins are calculated in real-time based on spherical Haversine coordinates.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
