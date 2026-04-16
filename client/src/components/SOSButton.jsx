import { useState, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sosAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * SOSButton — floating emergency button.
 * Visible whenever user is authenticated.
 * Captures current geolocation and sends alert to emergency contacts.
 */
export default function SOSButton() {
  const { isAuthenticated } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const timerRef = useRef(null);

  if (!isAuthenticated) return null;

  const handleSOSTrigger = () => {
    setShowConfirm(true);
    // Auto-send after 5s if not cancelled
    timerRef.current = setTimeout(() => sendSOS(), 5000);
  };

  const cancelSOS = () => {
    clearTimeout(timerRef.current);
    setShowConfirm(false);
  };

  const sendSOS = async () => {
    clearTimeout(timerRef.current);
    setSending(true);
    try {
      const coords = await getCurrentPosition();
      await sosAPI.trigger({ lat: coords.lat, lng: coords.lng, message: 'Emergency!' });
      setSent(true);
      toast.success('SOS alert sent to your emergency contacts!');
      setTimeout(() => { setSent(false); setShowConfirm(false); }, 4000);
    } catch (err) {
      // Even without GPS, send alert
      try {
        await sosAPI.trigger({ lat: 0, lng: 0, message: 'Emergency! (Location unavailable)' });
        setSent(true);
        toast.success('SOS alert sent!');
        setTimeout(() => { setSent(false); setShowConfirm(false); }, 4000);
      } catch {
        toast.error('Could not send SOS. Please call emergency services directly.');
        setShowConfirm(false);
      }
    } finally {
      setSending(false);
    }
  };

  const getCurrentPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        reject,
        { timeout: 5000 }
      );
    });

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        onClick={handleSOSTrigger}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center font-bold text-xs tracking-wide"
        title="Emergency SOS"
        aria-label="SOS Emergency Button"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-red-500 sos-ring opacity-60" />
        <span className="relative z-10 text-xs font-black">SOS</span>
      </motion.button>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={36} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">SOS Emergency</h2>
              <p className="text-slate-500 mb-1 text-sm">
                Your location and emergency alert will be sent to your contacts.
              </p>
              {!sent && !sending && (
                <p className="text-red-500 font-semibold text-sm mb-6">Sending automatically in 5 seconds...</p>
              )}
              {sending && <p className="text-primary-600 font-semibold text-sm mb-6">Sending alert…</p>}
              {sent && <p className="text-emerald-600 font-bold text-sm mb-6">✓ Alert sent!</p>}
              <div className="flex gap-3">
                <button
                  onClick={cancelSOS}
                  disabled={sending || sent}
                  className="flex-1 btn-secondary py-3 disabled:opacity-50"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={sendSOS}
                  disabled={sending || sent}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-60"
                >
                  {sending ? 'Sending…' : 'Send Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
