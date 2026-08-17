import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Layers, Repeat, ShieldCheck, User as UserIcon, LogOut, Sparkles, MapPin, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import api from '../utils/api';

export default function Navbar({ onOpenAuthModal }) {
  const { user, logout, demoLogin, fetchCurrentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [syncingLoc, setSyncingLoc] = useState(false);

  const isActive = (path) => location.pathname === path;

  const syncNavbarLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setSyncingLoc(true);

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
              placeName = `${neighborhood} (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
            }
          }
        } catch (e) {
          // Fallback to coords
        }

        try {
          await api.put('/auth/location', {
            address: placeName,
            coordinates: { latitude, longitude, isLiveGPS: true }
          });
          if (fetchCurrentUser) {
            await fetchCurrentUser();
          }
        } catch (err) {
          console.error('Failed to sync location:', err);
        } finally {
          setSyncingLoc(false);
        }
      },
      (err) => {
        console.error('GPS error:', err);
        alert('Failed to detect GPS location. Please allow browser location permissions.');
        setSyncingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <img
              src="/logo-icon.png"
              alt="Borrow Badge"
              className="h-11 w-11 sm:h-12 sm:w-12 object-contain drop-shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#001F4D] via-[#0055A5] to-[#0D9488] dark:from-white dark:via-primary-300 dark:to-teal-300 leading-none">
                Borrow
              </span>
              <span className="text-[10px] sm:text-[11px] block text-[#0D9488] dark:text-teal-400 font-extrabold uppercase tracking-[0.15em] mt-1">
                Instead of Buy
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/explore"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/explore')
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Explore Items</span>
            </Link>

            <Link
              to="/requests"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/requests')
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>Requests & Handovers</span>
            </Link>

            <Link
              to="/my-items"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/my-items')
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>My Listings</span>
            </Link>
          </div>

          {/* Action Buttons & Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Live GPS Location Sync Pill */}
            {user && (
              <button
                onClick={syncNavbarLocation}
                disabled={syncingLoc}
                className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all"
                title="Click to detect & update live GPS location"
              >
                <Navigation className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${syncingLoc ? 'animate-spin' : ''}`} />
                <span className="max-w-[140px] truncate">
                  {syncingLoc ? 'Locating...' : (user.location?.address || '📍 Detect Location')}
                </span>
              </button>
            )}

            <ThemeToggle />

            <Link
              to="/add-item"
              className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List an Item</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <NotificationBell user={user} />

                {/* Profile Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-1 rounded-full border-2 border-primary-100 dark:border-primary-900 hover:border-primary-500 transition-colors"
                  >
                    <img
                      src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <div className="mt-1.5 flex items-center space-x-1.5">
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            Trust Score: {user.trustScore?.overall || 85}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          syncNavbarLocation();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-left"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>📍 Update Live Location</span>
                      </button>

                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>My Profile & Security</span>
                      </Link>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => demoLogin('alex@example.com')}
                  className="hidden lg:flex items-center space-x-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl transition-all"
                  title="Quick Log in as Alex Morgan (Demo)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Demo Login</span>
                </button>
                <button
                  onClick={onOpenAuthModal}
                  className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                >
                  Sign In / Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
