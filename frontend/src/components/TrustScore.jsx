import React from 'react';
import { ShieldCheck, Zap, Clock, CheckCircle, Award } from 'lucide-react';

export default function TrustScore({ trustScore = {} }) {
  const overall = trustScore.overall || 85;
  const trust = trustScore.trust || 88;
  const availability = trustScore.availability || 90;
  const condition = trustScore.condition || 82;
  const response = trustScore.response || 85;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-elevation-4 border border-slate-800 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-extrabold tracking-tight">Trust & Borrowability Metrics</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">Verified algorithm based on neighbor feedback & transaction history</p>
        </div>

        {/* Badge */}
        <div className="flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Neighborhood Lender</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
        
        {/* Big Overall Gauge */}
        <div className="md:col-span-2 text-center p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex flex-col items-center justify-center shadow-inner">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-400 transition-all duration-1000 ease-out"
                strokeDasharray={`${overall}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black tracking-tight text-white">{overall}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">OVERALL SCORE</span>
            </div>
          </div>
          <p className="text-xs text-teal-400 mt-3 font-bold">Top 5% Trust Index in Locality</p>
        </div>

        {/* Detailed Metrics Bars */}
        <div className="md:col-span-3 space-y-4">
          
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="flex items-center space-x-2 text-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Reliability & Deposit Trust</span>
              </span>
              <span className="text-emerald-400 font-extrabold">{trust}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${trust}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="flex items-center space-x-2 text-slate-200">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Timeliness & Availability</span>
              </span>
              <span className="text-blue-400 font-extrabold">{availability}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${availability}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="flex items-center space-x-2 text-slate-200">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Item Condition Accuracy</span>
              </span>
              <span className="text-purple-400 font-extrabold">{condition}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${condition}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="flex items-center space-x-2 text-slate-200">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Communication & Speed</span>
              </span>
              <span className="text-amber-400 font-extrabold">{response}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${response}%` }}></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
