import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, MessageSquare, Check, CheckCheck } from 'lucide-react';
import api from '../utils/api';

export default function ChatDrawer({ isOpen, onClose, requestId, currentUserId, socket }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !requestId) return;

    // Fetch message history
    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/chat/${requestId}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();

    // Join Socket.IO chat room
    if (socket) {
      socket.emit('join_chat_room', { requestId, userId: currentUserId });

      socket.on('receive_message', (newMsg) => {
        if (newMsg.requestId === requestId) {
          setMessages((prev) => [...prev, newMsg]);
        }
      });

      socket.on('user_typing', ({ userId, isTyping: typingState }) => {
        if (userId !== currentUserId) {
          setIsTyping(typingState);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('user_typing');
      }
    };
  }, [isOpen, requestId, currentUserId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const messageText = inputMsg;
    setInputMsg('');

    if (socket) {
      socket.emit('send_message', {
        requestId,
        senderId: currentUserId,
        message: messageText
      });
    } else {
      try {
        const res = await api.post(`/chat/${requestId}`, { message: messageText });
        setMessages((prev) => [...prev, res.data]);
      } catch (err) {
        console.error('Failed to send message via REST:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-gray-200 dark:border-slate-800 animate-slide-left">
        {/* Header */}
        <div className="p-4 bg-indigo-600 dark:bg-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">In-App Chat</h3>
              <p className="text-xs text-indigo-200">Request #{requestId?.slice(-6)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950">
          {loading ? (
            <div className="text-center py-10 text-gray-500 text-sm">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No messages yet. Say hello to arrange pickup details!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = (msg.sender?._id || msg.sender) === currentUserId;
              return (
                <div
                  key={msg._id || index}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 shadow-sm border border-gray-100 dark:border-slate-700 rounded-bl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-[10px] text-gray-400">
                    <span>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now'}
                    </span>
                    {isMine && (
                      msg.readAt ? <CheckCheck className="w-3 h-3 text-indigo-500" /> : <Check className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-gray-400 italic">
              <span className="animate-pulse">Other user is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 border-0 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-slate-100 placeholder-gray-400"
          />
          <button
            type="submit"
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition flex items-center justify-center disabled:opacity-50"
            disabled={!inputMsg.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
