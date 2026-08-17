import React from 'react';
import { ShieldCheck, Heart, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3.5">
              <img src="/logo-icon.png" alt="Borrow Logo" className="h-11 w-11 object-contain drop-shadow-md shrink-0" />
              <div>
                <span className="text-xl font-black text-white tracking-tight block leading-none">Borrow</span>
                <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-[0.15em] block mt-1">Instead of Buy</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Hyperlocal peer-to-peer item sharing platform. Reduce consumer waste, save money, and connect with verified neighbors.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/explore?category=Tools" className="hover:text-white transition-colors">Power Tools & Hardware</a></li>
              <li><a href="/explore?category=Electronics" className="hover:text-white transition-colors">Cameras & Audio Gear</a></li>
              <li><a href="/explore?category=Sports" className="hover:text-white transition-colors">Camping & Outdoor Sports</a></li>
              <li><a href="/explore?category=HomeGoods" className="hover:text-white transition-colors">Home & Lawn Care</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Trust & Verification</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>QR Code Handover Scanner</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Dynamic Trust Score System</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-primary-400" />
                <span>Geospatial 2DSphere Search</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Community Impact</h4>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-300 font-semibold mb-1">🌱 Local Sustainability</p>
              <p className="text-[11px] text-slate-400">
                Over 1,200+ items shared in local neighborhoods, avoiding unnecessary purchases & landfill waste.
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Borrow Instead of Buy platform. Built for community trust.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for neighbors everywhere</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
