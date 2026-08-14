import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Tag } from 'lucide-react';

export default function ItemCard({ item }) {
  const distanceKm = item.distance ? (item.distance / 1000).toFixed(1) : '0.8';
  const owner = typeof item.ownerId === 'object' ? item.ownerId : { firstName: 'Local', lastName: 'Neighbor', trustScore: { overall: 85 } };
  const ownerTrust = owner?.trustScore?.overall || 85;

  return (
    <Link to={`/item/${item._id}`} className="group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
        
        {/* Photo Container */}
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          <img
            src={item.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Price Pill */}
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center space-x-1">
            {item.allowFree ? (
              <span className="text-emerald-400 font-extrabold">FREE SHARE</span>
            ) : (
              <span>₹{item.rentalPrice?.amount || 0}/{item.rentalPrice?.period || 'day'}</span>
            )}
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center space-x-1 shadow-sm">
            <Tag className="w-3 h-3 text-primary-500" />
            <span>{item.category}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-primary-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-xs font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{item.rating?.average || 4.9}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
              {item.description}
            </p>
          </div>

          {/* Location & Deposit Info */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <div className="flex items-center space-x-1 text-primary-600 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>{distanceKm} km away</span>
              </div>
              <div className="text-slate-400">
                Deposit: <span className="font-semibold text-slate-600">₹{item.deposit || 0}</span>
              </div>
            </div>

            {/* Owner Details */}
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
              <div className="flex items-center space-x-2">
                <img
                  src={owner?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                  alt={owner?.firstName}
                  className="w-6 h-6 rounded-full object-cover border border-white"
                />
                <span className="text-xs font-semibold text-slate-800">
                  {owner?.firstName} {owner?.lastName?.[0]}.
                </span>
              </div>

              <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200/50">
                <ShieldCheck className="w-3 h-3" />
                <span>{ownerTrust}% Trust</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
