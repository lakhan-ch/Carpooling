import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Users, CheckCircle2, Car } from 'lucide-react';
import MatchScore from './MatchScore';

export default function RideCard({ ride, index = 0 }) {
  const { _id, driver_id, vehicle_id, departure_time, available_seats,
    price_per_seat, pickup_address, drop_address, preferences, matchScore } = ride;
  const driver = driver_id || {};
  const departure = new Date(departure_time);
  const timeStr = departure.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = departure.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: index * 0.07 }}>
      <Link to={`/rides/${_id}`}>
        <div className="rounded-4xl border border-black/10 bg-white p-6 cursor-pointer group hover:border-black/25 hover:-translate-y-0.5 transition-all duration-300"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>

          {/* Top row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            {/* Driver info */}
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                {driver.avatar ? (
                  <img src={driver.avatar} alt={driver.name} className="w-12 h-12 rounded-2xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg"
                    style={{ background: 'var(--lime)', color: 'var(--ink)' }}>
                    {driver.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {driver.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 size={12} className="text-emerald-500 fill-emerald-500" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-800 text-sm" style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}>{driver.name || 'Driver'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs" style={{ color: 'var(--ink-60)' }}>{driver.rating?.toFixed(1) || '5.0'} · {driver.total_rides || 0} rides</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="font-black text-2xl" style={{ letterSpacing: '-0.04em', color: 'var(--ink)' }}>
                ₹{price_per_seat}
              </p>
              <p className="text-xs" style={{ color: 'var(--ink-30)', marginTop: '2px' }}>per seat</p>
            </div>
          </div>

          {/* Route line */}
          <div className="flex items-stretch gap-3 mb-5">
            <div className="flex flex-col items-center py-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--ink)' }} />
              <div className="w-0.5 flex-1 my-1.5" style={{ background: 'rgba(10,10,10,0.12)', minHeight: '24px' }} />
              <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: 'var(--ink)', background: 'transparent' }} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs font-600 mb-0.5" style={{ color: 'var(--ink-30)', letterSpacing: '0.04em' }}>{dateStr} · {timeStr}</p>
                <p className="font-700 text-sm leading-tight" style={{ color: 'var(--ink)' }}>{pickup_address}</p>
              </div>
              <div>
                <p className="font-700 text-sm leading-tight" style={{ color: 'var(--ink)' }}>{drop_address}</p>
              </div>
            </div>
          </div>

          {/* Match score */}
          {matchScore !== undefined && (
            <div className="mb-4">
              <MatchScore score={matchScore} />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-black/6">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs font-600" style={{ color: 'var(--ink-60)' }}>
                <Users size={12} /> {available_seats} left
              </span>
              {vehicle_id?.make && (
                <span className="text-xs" style={{ color: 'var(--ink-30)' }}>
                  {vehicle_id.make} {vehicle_id.model}{vehicle_id.ac ? ' · AC' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {preferences?.smoking_allowed === false && <span className="tag tag-grey">🚭</span>}
              {preferences?.pets_allowed && <span className="tag tag-grey">🐾</span>}
              <span className="text-xs font-700 group-hover:underline" style={{ color: 'var(--ink)' }}>View →</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
