import React from 'react';
import { ShieldCheck, Zap, Clock, CheckCircle, Award } from 'lucide-react';

export default function TrustScore({ trustScore = {} }) {
  const overall = trustScore.overall || 85;
  const trust = trustScore.trust || 88;
  const availability = trustScore.availability || 90;
  const condition = trustScore.condition || 82;
  const response = trustScore.response || 85;

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-emerald-500 to-teal-600 text-emerald-600';
    if (score >= 75) return 'from-primary-500 to-sky-600 text-primary-600';
    return 'from-amber-500 to-orange-600 text-amber-600';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 relative overflow-hidden">
      
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-700/60 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold tracking-tight">Trust & Borrowability Metrics</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">Verified algorithm based on neighbor feedback & transaction history</p>
        </div>

        {/* Badge */}
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Neighborhood Lender</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        
        {/* Big Overall Gauge */}
        <div className="md:col-span-2 text-center p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-1000 ease-out"
                strokeDasharray={`${overall}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold tracking-tight text-white">{overall}%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Overall Score</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-3 font-medium">Top 5% Trust Index in Locality</p>
        </div>

        {/* Detailed Metrics Bars */}
        <div className="md:col-span-3 space-y-4">
          
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reliability & Deposit Trust</span>
              </span>
              <span className="text-emerald-400 font-bold">{trust}%</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" style={{ width: `${trust}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Timeliness & Availability</span>
              </span>
              <span className="text-sky-400 font-bold">{availability}%</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-2">
              <div className="bg-gradient-to-r from-sky-500 to-blue-400 h-2 rounded-full transition-all duration-500" style={{ width: `${availability}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Item Condition Accuracy</span>
              </span>
              <span className="text-purple-400 font-bold">{condition}%</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-2 rounded-full transition-all duration-500" style={{ width: `${condition}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Communication & Speed</span>
              </span>
              <span className="text-amber-400 font-bold">{response}%</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all duration-500" style={{ width: `${response}%` }}></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
