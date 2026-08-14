import React, { useState } from 'react';
import { QrCode, CheckCircle, X, ShieldCheck, Camera, Sparkles } from 'lucide-react';
import api from '../utils/api';

export default function QRModal({ request, qrCodeImage, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleConfirmHandover = async () => {
    try {
      setLoading(true);
      await api.put(`/borrow/${request._id}/handover`);
      setScanned(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Handover confirmation failed:', err);
      alert('Failed to confirm handover');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = async () => {
    try {
      setLoading(true);
      await api.put(`/borrow/${request._id}/return`);
      setScanned(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Return confirmation failed:', err);
      alert('Failed to confirm return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
            <QrCode className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">Digital Handover Pass</h3>
          <p className="text-xs text-slate-500 mt-1">
            Show this QR code to the item owner during pickup or return for instant verification.
          </p>

          {/* QR Code Container */}
          <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner relative">
            {qrCodeImage ? (
              <img src={qrCodeImage} alt="Handover QR Code" className="w-52 h-52 mx-auto rounded-lg" />
            ) : (
              <div className="w-52 h-52 bg-slate-200 flex flex-col items-center justify-center rounded-lg text-slate-500 font-mono text-xs p-4">
                <QrCode className="w-16 h-16 mb-2 text-slate-400 animate-pulse" />
                <span>{request.qrCode || 'BORROW-PASS-8841'}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 mb-6 flex items-center justify-between border border-slate-100">
            <span className="font-semibold text-slate-900">Pass Token ID:</span>
            <span className="font-mono text-primary-600">{request.qrCode || 'BORROW-PASS-8841'}</span>
          </div>

          {scanned ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border border-emerald-200 animate-in zoom-in-95">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Handover Verified & Completed!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {request.status === 'ACCEPTED' && (
                <button
                  onClick={handleConfirmHandover}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{loading ? 'Verifying QR...' : 'Simulate Owner Scanning & Pickup'}</span>
                </button>
              )}

              {request.status === 'BORROWED' && (
                <button
                  onClick={handleConfirmReturn}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-primary-600/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Confirming Return...' : 'Simulate Owner Confirming Return'}</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
