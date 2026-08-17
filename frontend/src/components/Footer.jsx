import React from 'react';
import { ShieldCheck, Heart, MapPin, Sparkles, Send, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#001F4D] text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1 - Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3.5">
              <img src="/logo-icon.png" alt="Borrow Logo" className="h-11 w-11 object-contain drop-shadow-md shrink-0" />
              <div>
                <span className="text-xl font-black text-white tracking-tight block leading-none">Borrow</span>
                <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-[0.15em] block mt-1">Instead of Buy</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              Hyperlocal peer-to-peer item sharing platform. Reduce consumer waste, save money, and connect with verified neighbors.
            </p>
            
            {/* Newsletter Input */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-white mb-2">Subscribe for Neighborhood Updates</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center space-x-1.5">
                <input
                  type="email"
                  placeholder="Enter email..."
                  className="bg-navy-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 w-full"
                />
                <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-xl transition-all shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Column 2 - Categories */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">CATEGORIES</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="/explore?category=Tools" className="hover:text-teal-300 transition-colors">Power Tools & Hardware</a></li>
              <li><a href="/explore?category=Electronics" className="hover:text-teal-300 transition-colors">Cameras & Audio Gear</a></li>
              <li><a href="/explore?category=Sports" className="hover:text-teal-300 transition-colors">Camping & Outdoor Sports</a></li>
              <li><a href="/explore?category=HomeGoods" className="hover:text-teal-300 transition-colors">Home & Lawn Care</a></li>
            </ul>
          </div>

          {/* Column 3 - Trust & Verification */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">TRUST & VERIFICATION</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>QR Code Handover Scanner</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Dynamic Trust Score System</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Geospatial 2DSphere Search</span>
              </li>
            </ul>
          </div>

          {/* Column 4 - Community Impact */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">COMMUNITY IMPACT</h4>
            <div className="bg-navy-900/80 p-4 rounded-2xl border border-slate-700/60 shadow-elevation-2">
              <p className="text-xs text-white font-extrabold mb-1">🌱 Local Sustainability</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Over 1,200+ items shared in local neighborhoods, avoiding unnecessary purchases & landfill waste.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Borrow Instead of Buy platform. Built for community trust.</p>
          
          <div className="flex items-center space-x-4 text-slate-400">
            <a href="#" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
          </div>

          <p className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for neighbors everywhere</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
