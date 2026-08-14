import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Calendar, DollarSign, CheckCircle2, MessageSquare, ArrowLeft, Eye, Clock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TrustScore from '../components/TrustScore';

export default function ItemDetails({ onOpenAuthModal }) {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/items/${id}`);
      setItem(data);
    } catch (err) {
      console.error('Failed to load item details:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const days = calculateDays();
  const rentalCost = (item?.rentalPrice?.amount || 0) * days;
  const depositCost = item?.deposit || 0;
  const totalCost = item?.allowFree ? 0 : rentalCost + depositCost;

  const handleBorrowRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuthModal();
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/borrow', {
        itemId: item._id,
        startDate,
        endDate,
        message
      });
      setRequestSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send borrow request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-xl font-bold text-slate-800">Item Not Found</h2>
        <button onClick={() => navigate('/explore')} className="mt-4 text-xs font-bold text-primary-600 hover:underline">
          Return to Explore
        </button>
      </div>
    );
  }

  const owner = typeof item.ownerId === 'object' ? item.ownerId : { firstName: 'Local', lastName: 'Neighbor', trustScore: { overall: 85 } };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Column (2 Cols): Images & Item Info & Owner Trust */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gallery */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-96 rounded-2xl overflow-hidden bg-slate-100 relative">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5 text-primary-400" />
                  <span>{item.views || 12} Views</span>
                </div>
              </div>
            </div>

            {/* Main Info Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold bg-primary-50 text-primary-600 px-3 py-1 rounded-full border border-primary-100">
                    {item.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                    {item.name}
                  </h1>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-slate-900">
                    {item.allowFree ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      <span>₹{item.rentalPrice?.amount}/{item.rentalPrice?.period}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold">Deposit: ₹{item.deposit}</div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed my-6 font-normal">
                {item.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Condition</span>
                  <span className="text-sm font-bold text-slate-800">{item.condition}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Location</span>
                  <span className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-500" />
                    <span>{item.location?.address || 'Neighborhood Block'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Rating</span>
                  <span className="text-sm font-bold text-slate-800 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating?.average || 4.9} ({item.rating?.count || 12} reviews)</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Owner Profile & Trust Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Item Owner Profile</h3>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={owner.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                  alt={owner.firstName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary-500 shadow-md"
                />
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {owner.firstName} {owner.lastName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{owner.bio || 'Verified neighbor & community share partner.'}</p>
                </div>
              </div>

              {/* Dynamic Trust Breakdown Widget */}
              <TrustScore trustScore={owner.trustScore} />
            </div>

          </div>

          {/* Right Column (1 Col): Borrow Calculator & Request Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 sticky top-24">
              
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">Borrow Booking Calculator</h3>
              <p className="text-xs text-slate-500 mb-6">Select your dates to request this item</p>

              {requestSuccess ? (
                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center border border-emerald-200 animate-in zoom-in-95">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-extrabold text-base mb-1">Request Sent!</h4>
                  <p className="text-xs text-emerald-600 leading-relaxed mb-4">
                    The owner has been notified. You can track handover progress in your Requests dashboard.
                  </p>
                  <button
                    onClick={() => navigate('/requests')}
                    className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                  >
                    Go to My Requests
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBorrowRequest} className="space-y-4">
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Note to Owner (Optional)</label>
                    <textarea
                      rows="2"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Explain what project you need this item for..."
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                    ></textarea>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Rental Cost ({days} day{days > 1 ? 's' : ''})</span>
                      <span className="font-semibold">₹{rentalCost}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Refundable Security Deposit</span>
                      <span className="font-semibold">₹{depositCost}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-primary-600">₹{totalCost}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-95 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-primary-600/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Request...' : 'Send Borrow Request'}</span>
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
