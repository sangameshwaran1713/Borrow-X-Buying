import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, MapPin, Mail, Star, Lock, Award } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TrustScore from '../components/TrustScore';
import TwoFactorModal from '../components/TwoFactorModal';

export default function Profile({ onOpenAuthModal }) {
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-100 dark:border-slate-800">
          <User className="w-12 h-12 text-primary-500 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">User Profile & Trust Badge</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Sign in to view your borrowability score & reviews</p>
          <button onClick={onOpenAuthModal} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold py-3 rounded-xl text-xs">
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          
          <img
            src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
            alt={user.firstName}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-primary-100 dark:border-primary-950 shadow-md shrink-0"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tier {user.verificationTier || 1} Verified</span>
              </span>
              {(user.badges || ['Verified Neighbor']).map((badge, idx) => (
                <span key={idx} className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  {badge}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mb-4">
              {user.bio || 'Active neighborhood lender & borrower.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 dark:text-slate-300 font-semibold">
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

          <div className="flex flex-col items-center space-y-2 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-center min-w-[130px]">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Member Since</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            <button
              onClick={() => setIs2FAModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl transition border border-indigo-100 dark:border-indigo-900"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{user.twoFactorEnabled ? '2FA Active' : 'Enable 2FA'}</span>
            </button>
          </div>

        </div>

        {/* Dynamic Trust Score Component */}
        <TrustScore trustScore={user.trustScore} />

        {/* Reviews Received Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2 mb-6">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Community Feedback & Reviews</h3>
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
              No reviews recorded yet for completed transactions.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900 dark:text-white">Verified Borrow Transaction</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic mb-2">"{rev.comment || 'Smooth transaction and great item condition.'}"</p>
                  <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
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

      <TwoFactorModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />
    </div>
  );
}
