import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, MapPin, Mail, Phone, Star, Lock, Navigation, Camera, X, Check, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TrustScore from '../components/TrustScore';
import TwoFactorModal from '../components/TwoFactorModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

export default function Profile({ onOpenAuthModal }) {
  const { user, fetchCurrentUser } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);

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

  const handleUpdateLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setUpdatingLocation(true);
    setLocationStatus('Detecting live GPS...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let placeName = `GPS Verified (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const geoData = await res.json();
            const neighborhood = geoData.address?.suburb || geoData.address?.neighbourhood || geoData.address?.residential || geoData.address?.city || geoData.address?.town;
            if (neighborhood) {
              placeName = `${neighborhood} (GPS Verified: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            }
          }
        } catch (e) {
          // Fallback
        }

        try {
          await api.put('/auth/location', {
            address: placeName,
            coordinates: { latitude, longitude, isLiveGPS: true }
          });

          if (fetchCurrentUser) {
            await fetchCurrentUser();
          }

          setLocationStatus('📍 Live location updated!');
          setTimeout(() => setLocationStatus(''), 4000);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to update profile location.');
        } finally {
          setUpdatingLocation(false);
        }
      },
      (err) => {
        console.error('GPS Error:', err);
        alert('Failed to detect live GPS location. Please ensure location permission is allowed.');
        setUpdatingLocation(false);
        setLocationStatus('');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveAvatar = async (imageUrlToSave) => {
    const targetUrl = imageUrlToSave || newAvatarUrl;
    if (!targetUrl) return;

    setSavingAvatar(true);
    try {
      try {
        await api.put('/auth/profile', { profileImage: targetUrl });
      } catch (err) {
        if (err.response?.status === 404) {
          await api.put('/auth/me', { profileImage: targetUrl });
        } else {
          throw err;
        }
      }

      if (fetchCurrentUser) {
        await fetchCurrentUser();
      }
      setIsAvatarModalOpen(false);
      setNewAvatarUrl('');
    } catch (err) {
      console.error('Avatar Update Error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update profile photo.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSavingAvatar(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        handleSaveAvatar(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center space-y-4">
          <User className="w-12 h-12 text-teal-500 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">User Profile & Trust Badge</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to view your borrowability score & community feedback</p>
          <Button onClick={onOpenAuthModal} variant="primary" className="w-full">
            Sign In / Register
          </Button>
        </Card>
      </div>
    );
  }

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Header */}
        <Card hoverEffect={false} className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          
          <div className="relative group shrink-0">
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}+${user.lastName}`}
              alt={user.firstName}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-teal-100 dark:border-teal-950 shadow-elevation-2"
            />
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Change Profile Photo"
            >
              <Camera className="w-6 h-6 text-teal-400" />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <Badge variant="teal" icon={ShieldCheck}>
                Tier {user.verificationTier || 1} Verified
              </Badge>
              {(user.badges || ['Verified Neighbor']).map((badge, idx) => (
                <Badge key={idx} variant="primary">
                  {badge}
                </Badge>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              {user.bio || 'Active neighborhood lender & borrower.'}
            </p>

            {/* Quick Info Grid */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-200">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  <span>{user.location?.address || 'Neighborhood Block'}</span>
                </span>
                <button
                  onClick={handleUpdateLiveLocation}
                  disabled={updatingLocation}
                  className="inline-flex items-center space-x-1 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-100 px-2.5 py-1 rounded-xl border border-teal-200 dark:border-teal-800 text-[11px] font-bold transition-all shadow-xs"
                >
                  <Navigation className={`w-3 h-3 ${updatingLocation ? 'animate-spin' : ''}`} />
                  <span>{updatingLocation ? 'Locating...' : '📍 Sync Live GPS'}</span>
                </button>
              </div>

              <span className="flex items-center space-x-1">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user.email}</span>
              </span>

              <span className="flex items-center space-x-1">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>{user.phone || 'Phone Not Added'}</span>
              </span>
            </div>

            {locationStatus && (
              <div className="mt-2 text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-3 py-1 rounded-lg border border-teal-200 dark:border-teal-800 inline-block">
                {locationStatus}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center space-y-3 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 text-center min-w-[140px]">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">Member Since</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            <Button
              onClick={() => setIs2FAModalOpen(true)}
              variant="ghost"
              size="sm"
              icon={Lock}
              className="w-full text-xs"
            >
              {user.twoFactorEnabled ? '2FA Active' : 'Enable 2FA'}
            </Button>
          </div>

        </Card>

        {/* Dynamic Trust Score Component */}
        <TrustScore trustScore={user.trustScore} />

        {/* Reviews Received Section */}
        <Card hoverEffect={false}>
          <div className="flex items-center space-x-2 mb-6">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Community Feedback & Reviews</h3>
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              No reviews recorded yet for completed transactions.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 dark:text-white">Verified Borrow Transaction</span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">"{rev.comment || 'Smooth transaction and great item condition.'}"</p>
                  <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                    <span>Comm: {rev.ratings?.communication}/5 ⭐</span>
                    <span>Item: {rev.ratings?.itemAccuracy}/5 ⭐</span>
                    <span>Trust: {rev.ratings?.reliability}/5 ⭐</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>

      <TwoFactorModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />

      {/* Avatar Change Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-elevation-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <Camera className="w-5 h-5 text-teal-500" />
                <span>Update Profile Picture</span>
              </h3>
              <button onClick={() => setIsAvatarModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Upload Photo from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-slate-400">Or Select Avatar</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {avatarPresets.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => handleSaveAvatar(imgUrl)}
                    className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all hover:scale-105"
                  >
                    <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Or Paste Custom Image URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={newAvatarUrl}
                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                  <Button
                    onClick={() => handleSaveAvatar(newAvatarUrl)}
                    disabled={savingAvatar || !newAvatarUrl.trim()}
                    variant="primary"
                    size="sm"
                  >
                    {savingAvatar ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsAvatarModalOpen(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
