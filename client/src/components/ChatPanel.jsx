import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Lock, X } from 'lucide-react';
import { chatAPI } from '../api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * ChatPanel — real-time in-app chat for a ride.
 * Uses Socket.IO for live updates; falls back to REST for history.
 */
export default function ChatPanel({ rideId, driverId, driverName, isOpen, onClose }) {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const bottomRef = useRef(null);

  // Load message history
  useEffect(() => {
    if (!isOpen || !rideId) return;
    setLoading(true);
    chatAPI.getMessages(rideId)
      .then((res) => setMessages(res.data))
      .catch((err) => {
        if (err.response?.status === 403) setLocked(true);
        else toast.error('Could not load messages.');
      })
      .finally(() => setLoading(false));
  }, [rideId, isOpen]);

  // Join Socket.IO room and listen for messages
  useEffect(() => {
    if (!isOpen || !rideId || !socket) return;
    socket.joinRideRoom(rideId);
    const unsub = socket.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return unsub;
  }, [rideId, isOpen, socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const content = input.trim();
    setInput('');

    // Optimistic UI
    const optimistic = {
      _id: Date.now(),
      content,
      sender_id: { _id: user.id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    // Emit via Socket.IO
    socket?.sendMessage({
      rideId,
      senderId: user.id,
      receiverId: driverId,
      content,
      senderName: user.name,
      senderAvatar: user.avatar,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-card-hover border border-slate-200 z-40 flex flex-col overflow-hidden"
        style={{ maxHeight: '420px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span className="font-semibold text-sm">Chat with {driverName || 'Driver'}</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50" style={{ minHeight: '200px' }}>
          {locked ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
              <Lock size={24} />
              <p className="text-xs text-center">Chat is available after your request is approved.</p>
            </div>
          ) : loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                  <div className="skeleton h-8 w-40 rounded-xl" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-400 text-center pt-4">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id?._id === user?.id || msg.sender_id?._id === user?._id;
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                    }`}>
                    {msg.content}
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!locked && (
          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-slate-100 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </form>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
