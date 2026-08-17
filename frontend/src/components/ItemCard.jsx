import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Tag, Heart } from 'lucide-react';
import Badge from './ui/Badge';

export default function ItemCard({ item }) {
  const distanceKm = item.distance ? (item.distance / 1000).toFixed(1) : '0.8';
  const owner = typeof item.ownerId === 'object' ? item.ownerId : { firstName: 'Local', lastName: 'Neighbor', trustScore: { overall: 85 } };
  const ownerTrust = owner?.trustScore?.overall || 85;

  return (
    <Link to={`/item/${item._id}`} className="group block h-full">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-elevation-1 hover:shadow-elevation-4 border border-slate-100 dark:border-slate-800 transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
        
        {/* Photo Container */}
        <div className="relative h-44 sm:h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={item.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Price Tag Pill */}
          <div className="absolute top-3 right-3 bg-navy-900/90 dark:bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center space-x-1 border border-white/10">
            {item.allowFree ? (
              <span className="text-teal-400 font-extrabold tracking-wide">FREE SHARE</span>
            ) : (
              <span>₹{item.rentalPrice?.amount || 0}/{item.rentalPrice?.period || 'day'}</span>
            )}
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            <Tag className="w-3 h-3 text-teal-500" />
            <span>{item.category}</span>
          </div>

          {/* Favorite Heart Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-3 left-3 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex justify-between items-start gap-2 mb-1.5">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-xs font-bold shrink-0 border border-amber-200/50">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{item.rating?.average || 4.9}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Location & Deposit Info */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1 text-teal-600 dark:text-teal-400 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>📍 {distanceKm} km away</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Deposit: <span className="font-bold text-slate-700 dark:text-slate-300">₹{item.deposit || 0}</span>
              </div>
            </div>

            {/* Owner Details & Trust Ring */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center space-x-2">
                <img
                  src={owner?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                  alt={owner?.firstName}
                  className="w-7 h-7 rounded-full object-cover border border-white dark:border-slate-700"
                />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {owner?.firstName} {owner?.lastName?.[0]}.
                </span>
              </div>

              <Badge variant="teal" size="sm" icon={ShieldCheck}>
                {ownerTrust}% Trust
              </Badge>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
