import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image, MapPin, DollarSign, Tag, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AddItem({ onOpenAuthModal }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Tools',
    condition: 'Good',
    rentalPrice: { amount: 15, period: 'day' },
    deposit: 30,
    allowFree: false,
    address: '124 Maple Avenue, Downtown',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: child === 'amount' ? parseFloat(value) || 0 : value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuthModal();
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        rentalPrice: formData.rentalPrice,
        deposit: parseFloat(formData.deposit) || 0,
        allowFree: formData.allowFree,
        address: formData.address,
        coordinates: { longitude: 79.8711, latitude: 12.1697 },
        images: formData.imageUrl ? [formData.imageUrl] : ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80']
      };

      await api.post('/items', payload);
      alert('Listing created successfully!');
      navigate('/my-items');
    } catch (err) {
      console.error('Failed to list item:', err);
      alert(err.response?.data?.message || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          
          <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-6">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">List an Item to Lend</h1>
              <p className="text-xs text-slate-500">Help neighbors while earning trust score points and side rental income</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Item Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Bosch Professional Cordless Hammer Drill"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Features *</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe condition, included accessories, and usage tips for your borrower..."
                className="w-full p-4 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="Tools">Tools & Hardware</option>
                  <option value="Electronics">Electronics & Audio</option>
                  <option value="Sports">Sports & Outdoor</option>
                  <option value="HomeGoods">Home & Lawn Care</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="New">Like New / Excellent</option>
                  <option value="Good">Good Working Condition</option>
                  <option value="Fair">Fair / Functional</option>
                </select>
              </div>
            </div>

            {/* Pricing Matrix */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rental & Security Deposit</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rental Price (₹) *</label>
                  <input
                    type="number"
                    name="rentalPrice.amount"
                    value={formData.rentalPrice.amount}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rental Period</label>
                  <select
                    name="rentalPrice.period"
                    value={formData.rentalPrice.period}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="day">Per Day</option>
                    <option value="week">Per Week</option>
                    <option value="month">Per Month</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Refundable Security Deposit (₹)</label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="allowFree"
                  name="allowFree"
                  checked={formData.allowFree}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="allowFree" className="text-xs font-bold text-emerald-700 cursor-pointer">
                  Allow Free Community Share (Zero Rental Fee)
                </label>
              </div>
            </div>

            {/* Image URL & Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Location Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-primary-600/25 hover:opacity-95 transition-all"
            >
              {loading ? 'Publishing Listing...' : 'Publish Item Listing'}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
