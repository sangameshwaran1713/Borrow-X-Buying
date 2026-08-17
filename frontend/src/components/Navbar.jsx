import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Layers, Repeat, ShieldCheck, User as UserIcon, LogOut, Sparkles, MapPin, Navigation, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import api from '../utils/api';

export default function Navbar({ onOpenAuthModal }) {
  const { user, logout, demoLogin, fetchCurrentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <nav className="glass-header sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 shadow-elevation-1 transition-all duration-200">
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

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/explore"
              className={`px-4 py-2 text-sm font-bold transition-all flex items-center space-x-2 relative ${
                isActive('/explore')
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Explore Items</span>
              {isActive('/explore') && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-teal-500 rounded-full animate-in fade-in" />
              )}
            </Link>

            <Link
              to="/requests"
              className={`px-4 py-2 text-sm font-bold transition-all flex items-center space-x-2 relative ${
                isActive('/requests')
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>Requests & Handovers</span>
              {isActive('/requests') && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-teal-500 rounded-full animate-in fade-in" />
              )}
            </Link>

            <Link
              to="/my-items"
              className={`px-4 py-2 text-sm font-bold transition-all flex items-center space-x-2 relative ${
                isActive('/my-items')
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>My Listings</span>
              {isActive('/my-items') && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-teal-500 rounded-full animate-in fade-in" />
              )}
            </Link>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2.5">
            
            {/* Live GPS Location Sync Pill */}
            {user && (
              <button
                onClick={syncNavbarLocation}
                disabled={syncingLoc}
                className="hidden sm:flex items-center space-x-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 text-xs font-bold transition-all shadow-xs"
                title="Click to detect & update live GPS location"
              >
                <Navigation className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ${syncingLoc ? 'animate-spin' : ''}`} />
                <span className="max-w-[140px] truncate">
                  {syncingLoc ? 'Locating...' : (user.location?.address || '📍 Detect Location')}
                </span>
              </button>
            )}

            <ThemeToggle />

            <Link
              to="/add-item"
              className="hidden sm:flex items-center space-x-2 bg-[#001F4D] hover:bg-[#001533] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-navy-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-teal-400" />
              <span>List an Item</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <NotificationBell user={user} />

                {/* Profile Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-1 rounded-full border-2 border-teal-400/50 hover:border-teal-500 transition-colors shadow-xs"
                  >
                    <img
                      src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-elevation-4 border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <div className="mt-2 flex items-center space-x-1.5">
                          <span className="text-[10px] bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold border border-teal-200 dark:border-teal-800">
                            Trust Score: {user.trustScore?.overall || 85}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          syncNavbarLocation();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-left transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>📍 Update Live Location</span>
                      </button>

                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>My Profile & Security</span>
                      </Link>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 text-left transition-colors"
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
                  className="hidden lg:flex items-center space-x-1 text-xs font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl transition-all"
                  title="Quick Log in as Alex Morgan (Demo)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Demo Login</span>
                </button>
                <button
                  onClick={onOpenAuthModal}
                  className="bg-[#001F4D] hover:bg-[#001533] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-navy-500/20 hover:shadow-lg transition-all"
                >
                  Sign In / Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/explore') ? 'bg-teal-50 dark:bg-teal-950 text-teal-600' : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Explore Items</span>
          </Link>

          <Link
            to="/requests"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/requests') ? 'bg-teal-50 dark:bg-teal-950 text-teal-600' : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>Requests & Handovers</span>
          </Link>

          <Link
            to="/my-items"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/my-items') ? 'bg-teal-50 dark:bg-teal-950 text-teal-600' : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Listings</span>
          </Link>

          <Link
            to="/add-item"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-2 bg-[#001F4D] text-white px-4 py-2.5 rounded-xl text-sm font-bold w-full mt-2"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span>List an Item</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
