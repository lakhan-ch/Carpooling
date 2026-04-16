import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Clock, Users, IndianRupee, Shield, MessageSquare,
  CheckCircle2, Lock, MapPin, Navigation, Car, Phone,
  ChevronLeft, AlertCircle
} from 'lucide-react';
import { ridesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import ChatPanel from '../components/ChatPanel';
import MatchScore from '../components/MatchScore';
import toast from 'react-hot-toast';

function PreferenceTag({ icon, label, active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
      active ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
    }`}>
      {icon} {label}
    </span>
  );
}

export default function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    ridesAPI.getById(id)
      .then((res) => setRide(res.data))
      .catch(() => toast.error('Could not load ride details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequestJoin = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setRequesting(true);
    try {
      await ridesAPI.requestJoin(id, { seatsRequested, message });
      setHasRequested(true);
      toast.success('Join request sent! Waiting for driver to confirm.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send request.';
      if (msg.includes('already have a request')) {
        setHasRequested(true);
        toast('You already sent a request for this ride.');
      } else {
        toast.error(msg);
      }
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 py-10">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="skeleton h-72 w-full rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="skeleton h-48 rounded-2xl" />
            </div>
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🚫</p>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ride not found</h2>
          <button onClick={() => navigate(-1)} className="btn-primary mt-4">Go back</button>
        </div>
      </div>
    );
  }

  const driver = ride.driver_id || {};
  const vehicle = ride.vehicle_id || {};
  const prefs = ride.preferences || {};
  const departure = new Date(ride.departure_time);
  const isDriver = user?.id === driver._id;
  const isLocked = ride.privacy_locked && !isDriver;

  // Derive coords: [lat, lng] format for MapView
  const pickupCoords = ride.pickup_location?.coordinates
    ? [ride.pickup_location.coordinates[1], ride.pickup_location.coordinates[0]]
    : null;
  const dropCoords = ride.drop_location?.coordinates
    ? [ride.drop_location.coordinates[1], ride.drop_location.coordinates[0]]
    : null;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-6 text-sm font-medium transition-colors">
          <ChevronLeft size={18} /> Back to results
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="md:col-span-2 space-y-6">
            {/* Map */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <MapView
                pickup={pickupCoords}
                drop={dropCoords}
                pickupLabel={ride.pickup_address}
                dropLabel={ride.drop_address}
                height="h-72"
              />
            </motion.div>

            {/* Route info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <div className="flex items-stretch gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary-500 mt-1" />
                  <div className="w-0.5 flex-1 bg-slate-200 my-2" />
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 font-medium">
                        {departure.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}
                        {departure.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{ride.pickup_address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">Drop-off</p>
                    <p className="font-semibold text-slate-800">{ride.drop_address}</p>
                  </div>
                </div>
              </div>

              {ride.matchScore !== undefined && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <MatchScore score={ride.matchScore} />
                </div>
              )}
            </motion.div>

            {/* Driver card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Shield size={16} className="text-primary-600" /> Driver
              </h3>
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  {isLocked ? (
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                      <Lock size={20} className="text-slate-400" />
                    </div>
                  ) : driver.avatar ? (
                    <img src={driver.avatar} alt={driver.name} className="avatar w-16 h-16" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-bold text-2xl">{driver.name?.[0]}</span>
                    </div>
                  )}
                  {driver.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-lg ${isLocked ? 'blur-sm select-none' : ''}`}>
                    {isLocked ? 'Driver Name' : driver.name}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm text-slate-500">{driver.rating?.toFixed(1) || '5.0'} · {driver.total_rides || 0} rides</span>
                  </div>
                  {!isLocked && driver.bio && (
                    <p className="text-sm text-slate-500 leading-relaxed">{driver.bio}</p>
                  )}
                  {isLocked && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 mt-2">
                      <Lock size={11} /> Full profile visible after your request is approved
                    </div>
                  )}
                </div>
              </div>
              {/* Vehicle */}
              {vehicle.make && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
                  <Car size={15} className="text-slate-400" />
                  <span>{vehicle.make} {vehicle.model} · {vehicle.color}</span>
                  {vehicle.ac && <span className="badge badge-blue">AC</span>}
                </div>
              )}
            </motion.div>

            {/* Preferences */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <h3 className="font-bold text-slate-800 mb-4">Ride preferences</h3>
              <div className="flex flex-wrap gap-2">
                <PreferenceTag icon="🚭" label="No smoking" active={!prefs.smoking_allowed} />
                <PreferenceTag icon="🐾" label="Pets OK" active={prefs.pets_allowed} />
                <PreferenceTag icon="🧳" label="Luggage" active={prefs.luggage_allowed} />
                <PreferenceTag icon="🎵" label={prefs.music_pref || 'Any music'} active />
                {prefs.female_only && <PreferenceTag icon="♀" label="Women only" active />}
              </div>
            </motion.div>
          </div>

          {/* ── Right column — Booking card ── */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card p-6 sticky top-24">
              {/* Price */}
              <div className="text-center mb-5 pb-5 border-b border-slate-100">
                <div className="flex items-center justify-center gap-1 text-4xl font-extrabold text-slate-900">
                  <IndianRupee size={28} />
                  {ride.price_per_seat}
                </div>
                <p className="text-slate-400 text-sm mt-1">per seat</p>
              </div>

              {/* Info mini-grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: <Users size={14} />, label: 'Seats left', val: ride.available_seats },
                  { icon: <Clock size={14} />, label: 'Departs', val: departure.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
                  { icon: <Car size={14} />, label: 'Status', val: ride.status },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">{icon} {label}</div>
                    <p className="font-semibold text-slate-800 text-sm capitalize">{val}</p>
                  </div>
                ))}
              </div>

              {/* Seats selector */}
              {!isDriver && !hasRequested && ride.status === 'SCHEDULED' && (
                <div className="mb-4">
                  <label className="label">Seats needed</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSeatsRequested(s => Math.max(1, s - 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 font-bold hover:border-primary-400 transition-colors">−</button>
                    <span className="font-bold text-lg w-4 text-center">{seatsRequested}</span>
                    <button onClick={() => setSeatsRequested(s => Math.min(ride.available_seats, s + 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 font-bold hover:border-primary-400 transition-colors">+</button>
                  </div>
                  <div className="mt-3">
                    <label className="label">Message to driver (optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Hi, I'll be waiting at the main gate..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="input-field resize-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Action button */}
              {isDriver ? (
                <div className="text-center py-3 bg-primary-50 rounded-xl text-primary-700 font-semibold text-sm">
                  This is your ride
                </div>
              ) : hasRequested ? (
                <div className="text-center py-3 bg-emerald-50 rounded-xl text-emerald-700 font-semibold text-sm border border-emerald-100">
                  <CheckCircle2 size={16} className="inline mr-1" />
                  Request sent — waiting for driver
                </div>
              ) : ride.status !== 'SCHEDULED' ? (
                <div className="text-center py-3 bg-slate-50 rounded-xl text-slate-500 font-semibold text-sm">
                  <AlertCircle size={16} className="inline mr-1" />
                  Ride {ride.status.toLowerCase()}
                </div>
              ) : (
                <button onClick={handleRequestJoin} disabled={requesting} className="btn-primary w-full py-3 text-sm">
                  {requesting ? 'Sending…' : `Request ${seatsRequested} seat${seatsRequested > 1 ? 's' : ''}`}
                </button>
              )}

              {/* Chat button */}
              {isAuthenticated && !isDriver && (
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="btn-secondary w-full py-2.5 text-sm mt-3"
                >
                  <MessageSquare size={15} />
                  {chatOpen ? 'Close chat' : 'Message driver'}
                </button>
              )}

              {/* Safety note */}
              <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
                <Shield size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>Phone numbers are never shared. All communication stays in-app.</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating chat panel */}
      <ChatPanel
        rideId={id}
        driverId={driver._id}
        driverName={driver.name}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
