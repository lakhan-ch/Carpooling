import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Navigation, Clock, Users, IndianRupee, Car, CheckCircle2 } from 'lucide-react';
import { ridesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = ['Route', 'Schedule', 'Preferences', 'Review'];

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
            i < current ? 'step-done' : i === current ? 'step-active' : 'step-inactive'
          }`}>
            {i < current ? <CheckCircle2 size={16} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-12 h-0.5 transition-all duration-300 ${i < current ? 'bg-primary-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreateRide() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    pickupAddress: '', dropAddress: '',
    pickupCoords: [77.5946, 12.9716], dropCoords: [80.2707, 13.0827],
    pickupCity: '', dropCity: '',
    departureTime: '', availableSeats: 2,
    pricePerSeat: 200,
    preferences: {
      smoking_allowed: false, pets_allowed: false,
      female_only: false, music_pref: 'Any', luggage_allowed: true,
    },
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updatePref = (key, val) => setForm((prev) => ({
    ...prev, preferences: { ...prev.preferences, [key]: val },
  }));

  const canNext = () => {
    if (step === 0) return form.pickupAddress && form.dropAddress;
    if (step === 1) return form.departureTime && form.availableSeats >= 1;
    return true;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const res = await ridesAPI.create({
        pickupAddress: form.pickupAddress,
        dropAddress: form.dropAddress,
        pickupCoords: form.pickupCoords,
        dropCoords: form.dropCoords,
        pickupCity: form.pickupCity || form.pickupAddress.split(',')[0],
        dropCity: form.dropCity || form.dropAddress.split(',')[0],
        departureTime: form.departureTime,
        availableSeats: form.availableSeats,
        pricePerSeat: form.pricePerSeat,
        preferences: form.preferences,
      });
      toast.success('Ride created successfully! 🎉');
      navigate(`/rides/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ride. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Offer a Ride</h1>
          <p className="text-slate-500 mt-2">Share your journey and split costs</p>
        </div>

        <div className="card p-8">
          <StepIndicator current={step} total={STEPS.length} />

          <AnimatePresence mode="wait">
            {/* STEP 0: Route */}
            {step === 0 && (
              <motion.div key="step0" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    <MapPin size={16} />
                  </span>
                  Where are you going?
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Pickup address</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
                      <input
                        type="text" placeholder="e.g. Koramangala, Bangalore"
                        value={form.pickupAddress}
                        onChange={(e) => update('pickupAddress', e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Drop-off address</label>
                    <div className="relative">
                      <Navigation size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" />
                      <input
                        type="text" placeholder="e.g. Anna Nagar, Chennai"
                        value={form.dropAddress}
                        onChange={(e) => update('dropAddress', e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1: Schedule */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    <Clock size={16} />
                  </span>
                  When and how many?
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Departure date & time</label>
                    <input
                      type="datetime-local"
                      value={form.departureTime}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => update('departureTime', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Available seats</label>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => update('availableSeats', Math.max(1, form.availableSeats - 1))}
                        className="w-10 h-10 rounded-xl border-2 border-slate-200 font-bold text-lg hover:border-primary-400 transition-colors">−</button>
                      <span className="text-2xl font-bold text-slate-800 w-8 text-center">{form.availableSeats}</span>
                      <button type="button" onClick={() => update('availableSeats', Math.min(7, form.availableSeats + 1))}
                        className="w-10 h-10 rounded-xl border-2 border-slate-200 font-bold text-lg hover:border-primary-400 transition-colors">+</button>
                      <span className="text-sm text-slate-500 ml-2">seats (excluding driver)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Preferences */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    <Car size={16} />
                  </span>
                  Ride preferences
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Price per seat (₹)</label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number" min={0}
                        value={form.pricePerSeat}
                        onChange={(e) => update('pricePerSeat', +e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Estimated total: ₹{form.pricePerSeat * form.availableSeats}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'smoking_allowed', label: '🚬 Smoking OK', desc: 'Allow smoking' },
                      { key: 'pets_allowed', label: '🐾 Pets OK', desc: 'Pets welcome' },
                      { key: 'female_only', label: '♀ Women only', desc: 'Female riders only' },
                      { key: 'luggage_allowed', label: '🧳 Luggage OK', desc: 'Luggage allowed' },
                    ].map(({ key, label }) => (
                      <label key={key} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        form.preferences[key] ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form.preferences[key]}
                          onChange={(e) => updatePref(key, e.target.checked)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="label">Music preference</label>
                    <select value={form.preferences.music_pref} onChange={(e) => updatePref('music_pref', e.target.value)} className="input-field">
                      {['Any', 'Bollywood', 'Pop', 'Classical', 'Podcast', 'Silence'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={16} />
                  </span>
                  Review your ride
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'From', value: form.pickupAddress, icon: <MapPin size={14} className="text-primary-500" /> },
                    { label: 'To', value: form.dropAddress, icon: <Navigation size={14} className="text-red-400" /> },
                    { label: 'Departure', value: form.departureTime ? new Date(form.departureTime).toLocaleString('en-IN') : '—', icon: <Clock size={14} className="text-slate-400" /> },
                    { label: 'Seats', value: `${form.availableSeats} seats`, icon: <Users size={14} className="text-slate-400" /> },
                    { label: 'Price', value: `₹${form.pricePerSeat} per seat`, icon: <IndianRupee size={14} className="text-slate-400" /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      {icon}
                      <span className="text-xs text-slate-400 w-20">{label}</span>
                      <span className="text-sm font-medium text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
                  <p className="text-xs text-primary-700">
                    💡 By creating this ride, you agree to accept or decline riders within 24 hours.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="btn-secondary py-2.5 px-5 disabled:opacity-40">
              <ChevronLeft size={16} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary py-2.5 px-6 disabled:opacity-50">
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
                {submitting ? 'Creating…' : 'Create Ride 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
