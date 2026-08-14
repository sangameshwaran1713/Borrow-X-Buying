import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Plus, Trash2, Eye, MapPin, Tag, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function MyItems({ onOpenAuthModal }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/items/my-items');
      setItems(data || []);
    } catch (err) {
      console.error('Failed to fetch user items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-100">
          <Layers className="w-12 h-12 text-primary-500 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">My Item Listings</h2>
          <p className="text-xs text-slate-500 mb-6">Sign in to manage your listed items and track views</p>
          <button onClick={onOpenAuthModal} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-xs">
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Active Listings</h1>
            <p className="text-xs text-slate-500 mt-1">Manage items you are lending to local neighbors</p>
          </div>

          <Link
            to="/add-item"
            className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>List New Item</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading your listings...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No active listings yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">Start sharing tools, cameras, or sports gear to earn trust score badges.</p>
            <Link to="/add-item" className="bg-primary-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md">
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
                
                <div className="relative h-44 bg-slate-100">
                  <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'} alt={item.name} className="w-full h-full object-cover" />
                  
                  <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-3 py-1 rounded-full text-white uppercase shadow-md ${
                    item.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-base mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                  
                  <div className="flex justify-between items-center text-xs text-slate-600 font-semibold border-t border-slate-100 pt-3">
                    <span>₹{item.rentalPrice?.amount}/{item.rentalPrice?.period}</span>
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{item.views || 0} views</span>
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <Link to={`/item/${item._id}`} className="text-xs font-bold text-primary-600 hover:underline">
                    View Page
                  </Link>
                  <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Listing">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
