import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, MapPin, Phone, Mail, Award, Star, Clock, Layers, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TrustScore from '../components/TrustScore';

export default function Profile({ onOpenAuthModal }) {
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserReviews();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/reviews/${user._id || user.id}`);
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to load profile reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-100">
          <User className="w-12 h-12 text-primary-500 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">User Profile & Trust Badge</h2>
          <p className="text-xs text-slate-500 mb-6">Sign in to view your borrowability score & reviews</p>
          <button onClick={onOpenAuthModal} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-xs">
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          
          <img
            src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
            alt={user.firstName}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-primary-100 shadow-md shrink-0"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {user.firstName} {user.lastName}
              </h1>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full text-xs font-bold border border-emerald-200 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Resident</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-xl leading-relaxed mb-4">
              {user.bio || 'Active neighborhood lender & borrower.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 font-semibold">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>{user.location?.address || 'City Center, Main St'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user.email}</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shrink-0 min-w-[140px]">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Member Since</span>
            <span className="text-sm font-extrabold text-slate-800">
              {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>

        </div>

        {/* Dynamic Trust Score Component */}
        <TrustScore trustScore={user.trustScore} />

        {/* Reviews Received Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-6">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h3 className="text-lg font-bold text-slate-900">Community Feedback & Reviews</h3>
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
              No reviews recorded yet for completed transactions.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900">Verified Borrow Transaction</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic mb-2">"{rev.comment || 'Smooth transaction and great item condition.'}"</p>
                  <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500">
                    <span>Comm: {rev.ratings?.communication}/5 ⭐</span>
                    <span>Item: {rev.ratings?.itemAccuracy}/5 ⭐</span>
                    <span>Trust: {rev.ratings?.reliability}/5 ⭐</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
