import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Car, Users, Star, Clock, CheckCircle2, XCircle,
  Plus, Settings, MapPin, Navigation, ChevronRight,
  Calendar, IndianRupee, User, Shield
} from 'lucide-react';
import { usersAPI, ridesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  SCHEDULED: 'badge-blue',
  ACTIVE: 'badge-green',
  COMPLETED: 'badge-gray',
  CANCELLED: 'bg-red-100 text-red-700 badge',
};
const REQUEST_COLORS = {
  PENDING: 'badge-orange',
  APPROVED: 'badge-green',
  REJECTED: 'bg-red-100 text-red-700 badge',
  CANCELLED: 'badge-gray',
};

function StatCard({ icon, label, value, color = 'text-primary-600' }) {
  return (
    <div className="card p-5">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState({ asDriver: [], asRider: [] });
  const [activeTab, setActiveTab] = useState('driver');
  const [selectedRideRequests, setSelectedRideRequests] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getMyRides()
      .then((res) => setRides(res.data))
      .catch(() => toast.error('Could not load your rides.'))
      .finally(() => setLoading(false));
  }, []);

  const loadRequests = async (rideId) => {
    setSelectedRideRequests(rideId);
    setLoadingRequests(true);
    try {
      const res = await ridesAPI.getRequests(rideId);
      setRequests(res.data);
    } catch {
      toast.error('Could not load requests.');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await ridesAPI.respondRequest(requestId, action);
      setRequests((prev) => prev.map((r) => r._id === requestId ? { ...r, status: action } : r));
      toast.success(action === 'APPROVED' ? '✅ Rider approved!' : 'Request rejected.');
      // Refresh ride list
      const res = await usersAPI.getMyRides();
      setRides(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const totalRides = rides.asDriver.length + rides.asRider.length;
  const pendingRequests = rides.asDriver.reduce((acc, r) => acc + (r.pendingCount || 0), 0);
  const approvedRides = rides.asRider.filter((r) => r.status === 'APPROVED').length;

  const tabs = [
    { key: 'driver', label: 'My Rides (Driver)', count: rides.asDriver.length },
    { key: 'rider', label: 'My Bookings (Rider)', count: rides.asRider.length },
    { key: 'profile', label: 'Profile', count: null },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 mt-1">Manage your rides and bookings</p>
          </div>
          <Link to="/create-ride">
            <motion.button whileHover={{ scale: 1.03 }} className="btn-primary gap-2">
              <Plus size={16} /> Offer a ride
            </motion.button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Car size={20} />} label="Total rides" value={totalRides} />
          <StatCard icon={<Star size={20} />} label="Your rating" value={`${user?.rating?.toFixed(1) || '5.0'}★`} color="text-amber-500" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Approved bookings" value={approvedRides} color="text-emerald-600" />
          <StatCard icon={<Users size={20} />} label="Role" value={user?.role || 'RIDER'} color="text-violet-600" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: My Rides as Driver ── */}
        {activeTab === 'driver' && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              {loading ? (
                [1,2].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)
              ) : rides.asDriver.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-4xl mb-3">🚗</p>
                  <h3 className="font-bold text-slate-800 mb-2">No rides offered yet</h3>
                  <p className="text-sm text-slate-500 mb-5">Share your next journey and let riders join you.</p>
                  <Link to="/create-ride" className="btn-primary inline-flex">Offer your first ride</Link>
                </div>
              ) : (
                rides.asDriver.map((ride) => (
                  <motion.div
                    key={ride._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`card p-5 cursor-pointer border-2 transition-all duration-200 ${
                      selectedRideRequests === ride._id ? 'border-primary-400' : 'border-transparent'
                    }`}
                    onClick={() => loadRequests(ride._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge ${STATUS_COLORS[ride.status] || 'badge-gray'}`}>{ride.status}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(ride.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center mt-1">
                            <div className="w-2 h-2 rounded-full bg-primary-500" />
                            <div className="w-0.5 h-6 bg-slate-200 my-1" />
                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                          </div>
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-800 leading-tight">{ride.pickup_address}</p>
                            <p className="text-sm font-semibold text-slate-800 leading-tight">{ride.drop_address}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-slate-800">₹{ride.price_per_seat}</p>
                        <p className="text-xs text-slate-400">{ride.available_seats}/{ride.total_seats} seats</p>
                        <p className="text-xs text-primary-600 mt-2 font-medium">
                          View requests <ChevronRight size={12} className="inline" />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Requests panel */}
            <div className="lg:col-span-2">
              {selectedRideRequests ? (
                <div className="card p-5 sticky top-24">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users size={16} className="text-primary-600" /> Join Requests
                  </h3>
                  {loadingRequests ? (
                    <div className="space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
                  ) : requests.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No requests yet for this ride.</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((req) => (
                        <div key={req._id} className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-bold text-sm">{req.rider_id?.name?.[0]}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-slate-800">{req.rider_id?.name}</p>
                              <div className="flex items-center gap-1">
                                <Star size={11} className="text-amber-400 fill-amber-400" />
                                <span className="text-xs text-slate-400">{req.rider_id?.rating?.toFixed(1)}</span>
                              </div>
                            </div>
                            <span className={`badge ${REQUEST_COLORS[req.status] || 'badge-gray'} text-xs`}>{req.status}</span>
                          </div>
                          {req.message && (
                            <p className="text-xs text-slate-500 italic mb-3 bg-white rounded-lg p-2">"{req.message}"</p>
                          )}
                          <p className="text-xs text-slate-400 mb-3">{req.seats_requested} seat{req.seats_requested > 1 ? 's' : ''} requested</p>
                          {req.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleRespond(req._id, 'APPROVED')}
                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors">
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button onClick={() => handleRespond(req._id, 'REJECTED')}
                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors">
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="card p-8 text-center text-slate-400">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a ride to manage its join requests</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: My Bookings as Rider ── */}
        {activeTab === 'rider' && (
          <div className="space-y-4">
            {loading ? (
              [1, 2].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
            ) : rides.asRider.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <h3 className="font-bold text-slate-800 mb-2">No bookings yet</h3>
                <p className="text-sm text-slate-500 mb-5">Find a ride and request to join a carpool.</p>
                <Link to="/rides?mode=search" className="btn-primary inline-flex">Find a ride</Link>
              </div>
            ) : (
              rides.asRider.map((req, i) => {
                const ride = req.ride_id;
                if (!ride) return null;
                return (
                  <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <Link to={`/rides/${ride._id}`}>
                      <div className="card p-5 hover:border-primary-200 border-2 border-transparent">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`badge ${REQUEST_COLORS[req.status] || 'badge-gray'}`}>{req.status}</span>
                              <span className="text-xs text-slate-400">
                                {new Date(ride.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center mt-1">
                                <div className="w-2 h-2 rounded-full bg-primary-500" />
                                <div className="w-0.5 h-5 bg-slate-200 my-1" />
                                <div className="w-2 h-2 rounded-full bg-slate-400" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-slate-800">{ride.pickup_address}</p>
                                <p className="text-sm font-semibold text-slate-800">{ride.drop_address}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-2 justify-end mb-1">
                              {ride.driver_id?.avatar ? (
                                <img src={ride.driver_id.avatar} alt="" className="avatar w-7 h-7" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                  {ride.driver_id?.name?.[0]}
                                </div>
                              )}
                              <span className="text-sm font-semibold text-slate-700">{ride.driver_id?.name}</span>
                            </div>
                            <p className="text-xs text-slate-400">
                              <Star size={10} className="text-amber-400 fill-amber-400 inline" /> {ride.driver_id?.rating?.toFixed(1)}
                            </p>
                            <p className="font-bold text-slate-800 mt-2">₹{ride.price_per_seat}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ── Tab: Profile ── */}
        {activeTab === 'profile' && (
          <div className="max-w-lg">
            <div className="card p-8">
              <div className="flex items-center gap-5 mb-8">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="avatar w-20 h-20" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-3xl font-extrabold text-primary-700">{user?.name?.[0]}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                  <p className="text-slate-500">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-blue">{user?.role}</span>
                    {user?.is_verified && <span className="badge badge-green flex items-center gap-1"><CheckCircle2 size={10} /> Verified</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                  <Shield size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Add emergency contacts</p>
                    <p className="text-xs text-amber-600 mt-0.5">Required for SOS feature to work. Go to settings to add contacts.</p>
                  </div>
                </div>
                <button onClick={logout} className="w-full py-3 text-red-600 border-2 border-red-100 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
