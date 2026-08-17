import React, { useState, useEffect } from 'react';
import { Repeat, QrCode, CheckCircle2, XCircle, Clock, Star, MessageSquare, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';
import ChatDrawer from '../components/ChatDrawer';

export default function Requests({ onOpenAuthModal }) {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('borrowing'); // 'borrowing' or 'lending'
  const [borrowerRequests, setBorrowerRequests] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [activeChatRequest, setActiveChatRequest] = useState(null);

  // QR Modal State
  const [selectedQRRequest, setSelectedQRRequest] = useState(null);

  // Review Modal State
  const [reviewModalRequest, setReviewModalRequest] = useState(null);
  const [ratings, setRatings] = useState({
    communication: 5,
    itemAccuracy: 5,
    reliability: 5,
    timelinessOrCondition: 5
  });
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const [resBorrower, resOwner] = await Promise.all([
        api.get('/borrow/my-requests'),
        api.get('/borrow/owner-requests')
      ]);
      setBorrowerRequests(resBorrower.data || []);
      setOwnerRequests(resOwner.data || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.put(`/borrow/${requestId}/accept`);
      fetchAllRequests();
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.put(`/borrow/${requestId}/reject`);
      fetchAllRequests();
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalRequest) return;

    try {
      setSubmittingReview(true);
      
      const isBorrower = activeTab === 'borrowing';
      const revieweeId = isBorrower
        ? (typeof reviewModalRequest.ownerId === 'object' ? reviewModalRequest.ownerId._id : reviewModalRequest.ownerId)
        : (typeof reviewModalRequest.borrowerId === 'object' ? reviewModalRequest.borrowerId._id : reviewModalRequest.borrowerId);

      await api.post('/reviews', {
        revieweeId,
        borrowRequestId: reviewModalRequest._id,
        itemId: typeof reviewModalRequest.itemId === 'object' ? reviewModalRequest.itemId._id : reviewModalRequest.itemId,
        ratings,
        comment,
        reviewType: isBorrower ? 'BORROWER_TO_OWNER' : 'OWNER_TO_BORROWER'
      });

      alert('Review submitted! Trust score updated successfully 🎉');
      setReviewModalRequest(null);
      fetchAllRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-100 dark:border-slate-800">
          <Repeat className="w-12 h-12 text-primary-500 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Borrow Requests Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Sign in to track borrow statuses & QR code handovers</p>
          <button onClick={onOpenAuthModal} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold py-3 rounded-xl text-xs">
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const currentList = activeTab === 'borrowing' ? borrowerRequests : ownerRequests;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">Pending Response</span>;
      case 'ACCEPTED':
        return <span className="bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full text-xs font-bold border border-sky-200 dark:border-sky-800">Approved (Show QR Pass)</span>;
      case 'BORROWED':
        return <span className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">Currently Borrowed</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">Completed & Returned</span>;
      case 'REJECTED':
        return <span className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold border border-red-200 dark:border-red-800">Declined</span>;
      default:
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Requests & Handovers</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track active borrowings, QR code physical handovers, and in-app chat</p>
          </div>

          {/* Tabs Switcher */}
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('borrowing')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'borrowing' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Items I'm Borrowing ({borrowerRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('lending')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'lending' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Items I'm Lending ({ownerRequests.length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fetching requests...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No requests found in "{activeTab === 'borrowing' ? "Items I'm Borrowing" : "Items I'm Lending"}"
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeTab === 'borrowing'
                ? 'Explore nearby items and click "Send Borrow Request" to get started.'
                : 'List items in your neighborhood to receive incoming borrow requests.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((req) => {
              const item = typeof req.itemId === 'object' ? req.itemId : { name: 'Item', images: [] };
              const otherUser = activeTab === 'borrowing'
                ? (typeof req.ownerId === 'object' ? req.ownerId : { firstName: 'Owner' })
                : (typeof req.borrowerId === 'object' ? req.borrowerId : { firstName: 'Borrower' });

              return (
                <div key={req._id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{item.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {activeTab === 'borrowing' ? 'Owner:' : 'Borrower:'}{' '}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{otherUser.firstName} {otherUser.lastName}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Dates: {new Date(req.startDate).toLocaleDateString()} ➔ {new Date(req.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>{getStatusBadge(req.status)}</div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
                      <div>
                        <span className="text-slate-400 block">Rental Fee:</span>
                        <span className="font-bold text-slate-900 dark:text-white">${req.pricing?.rentalCost || 0}</span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                        <span className="text-slate-400 block">Deposit Hold:</span>
                        <span className="font-bold text-slate-900 dark:text-white">${req.pricing?.deposit || 50}</span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                        <span className="text-slate-400 block">Hold Status:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{req.depositStatus || 'HOLD_CREATED'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">

                      {/* Chat Trigger Button */}
                      <button
                        onClick={() => setActiveChatRequest(req._id)}
                        className="bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 border border-indigo-100 dark:border-indigo-900"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                      </button>
                      
                      {/* Borrower Actions */}
                      {activeTab === 'borrowing' && (req.status === 'ACCEPTED' || req.status === 'BORROWED') && (
                        <button
                          onClick={() => setSelectedQRRequest(req)}
                          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-primary-600/20"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Show QR Pass</span>
                        </button>
                      )}

                      {/* Owner Actions */}
                      {activeTab === 'lending' && req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAccept(req._id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1 shadow-md"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {/* Review Trigger Button when transaction completed */}
                      {req.status === 'COMPLETED' && (
                        <button
                          onClick={() => setReviewModalRequest(req)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-md"
                        >
                          <Star className="w-4 h-4 fill-white" />
                          <span>Leave Review & Update Trust</span>
                        </button>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* IN-APP CHAT DRAWER */}
        <ChatDrawer
          isOpen={!!activeChatRequest}
          onClose={() => setActiveChatRequest(null)}
          requestId={activeChatRequest}
          currentUserId={user?._id || user?.id}
        />

        {/* QR MODAL */}
        {selectedQRRequest && (
          <QRModal
            request={selectedQRRequest}
            onClose={() => setSelectedQRRequest(null)}
            onRefresh={fetchAllRequests}
          />
        )}

        {/* REVIEW SUBMISSION MODAL */}
        {reviewModalRequest && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 dark:border-slate-800">
              
              <button
                onClick={() => setReviewModalRequest(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950 rounded-2xl flex items-center justify-center mx-auto mb-2 text-amber-500">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Review & Trust Score Rating</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Rate your neighbor to dynamically recalculate their overall community trust score!
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Communication Rate (1-5 stars)</label>
                  <input
                    type="range" min="1" max="5"
                    value={ratings.communication}
                    onChange={(e) => setRatings({ ...ratings, communication: parseInt(e.target.value) })}
                    className="w-full accent-primary-600"
                  />
                  <span className="font-bold text-slate-900 dark:text-white text-right block">{ratings.communication} Stars</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Accuracy & Condition (1-5 stars)</label>
                  <input
                    type="range" min="1" max="5"
                    value={ratings.itemAccuracy}
                    onChange={(e) => setRatings({ ...ratings, itemAccuracy: parseInt(e.target.value) })}
                    className="w-full accent-primary-600"
                  />
                  <span className="font-bold text-slate-900 dark:text-white text-right block">{ratings.itemAccuracy} Stars</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reliability & Deposit Return (1-5 stars)</label>
                  <input
                    type="range" min="1" max="5"
                    value={ratings.reliability}
                    onChange={(e) => setRatings({ ...ratings, reliability: parseInt(e.target.value) })}
                    className="w-full accent-primary-600"
                  />
                  <span className="font-bold text-slate-900 dark:text-white text-right block">{ratings.reliability} Stars</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Timeliness & Pickup Speed (1-5 stars)</label>
                  <input
                    type="range" min="1" max="5"
                    value={ratings.timelinessOrCondition}
                    onChange={(e) => setRatings({ ...ratings, timelinessOrCondition: parseInt(e.target.value) })}
                    className="w-full accent-primary-600"
                  />
                  <span className="font-bold text-slate-900 dark:text-white text-right block">{ratings.timelinessOrCondition} Stars</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Feedback Comment</label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Super smooth handover, great condition drill! Will borrow again."
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-95"
                >
                  {submittingReview ? 'Updating Trust Metrics...' : 'Submit Review'}
                </button>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
