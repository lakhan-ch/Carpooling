import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { ridesAPI } from '../api';
import SearchForm from '../components/SearchForm';
import RideCard from '../components/RideCard';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'match', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'time', label: 'Departure Time' },
];

function RideSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-32" /><div className="skeleton h-3 w-20" />
        </div>
        <div className="skeleton h-6 w-16 rounded-lg" />
      </div>
      <div className="skeleton h-16 w-full rounded-xl" />
      <div className="skeleton h-2 w-full rounded-full" />
      <div className="flex gap-4">
        <div className="skeleton h-3 w-20" /><div className="skeleton h-3 w-24" />
      </div>
    </div>
  );
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('match');
  const [filters, setFilters] = useState({ maxPrice: '', smoking: false, pets: false, ac: false });
  const [showFilters, setShowFilters] = useState(false);
  const [cached, setCached] = useState(false);

  const pickup = searchParams.get('pickup') || '';
  const drop = searchParams.get('drop') || '';
  const date = searchParams.get('date') || '';
  const seats = searchParams.get('seats') || '1';

  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use mock coordinates for demo — in production, geocode the address
        const params = {
          pickupLat: 12.9716,
          pickupLng: 77.5946,
          dropLat: 13.0827,
          dropLng: 80.2707,
          date,
          seats,
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        };
        const res = await ridesAPI.search(params);
        setRides(res.data.rides || []);
        setCached(res.data.cached || false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch rides. Please try again.');
        toast.error('Could not load rides.');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [searchParams, filters.maxPrice]);

  // Client-side sort
  const sortedRides = [...rides].sort((a, b) => {
    if (sort === 'price_asc') return (a.price_per_seat || 0) - (b.price_per_seat || 0);
    if (sort === 'price_desc') return (b.price_per_seat || 0) - (a.price_per_seat || 0);
    if (sort === 'time') return new Date(a.departure_time) - new Date(b.departure_time);
    return (b.matchScore || 0) - (a.matchScore || 0); // default: best match
  });

  // Client-side preference filters
  const filteredRides = sortedRides.filter((r) => {
    if (filters.smoking && !r.preferences?.smoking_allowed) return false;
    if (filters.pets && !r.preferences?.pets_allowed) return false;
    if (filters.ac && !r.vehicle_id?.ac) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Search bar refine */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchForm
            initialValues={{ pickup, drop, date, seats }}
            size="sm"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar filters (desktop) ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 sticky top-36">
              <h3 className="font-bold text-slate-900 mb-4">Filters</h3>
              <div className="space-y-5">
                <div>
                  <label className="label">Max price (₹/seat)</label>
                  <input
                    type="number"
                    placeholder="Any price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-3">
                  <p className="label">Preferences</p>
                  {[
                    { key: 'smoking', label: '🚬 Smoking allowed' },
                    { key: 'pets', label: '🐾 Pets OK' },
                    { key: 'ac', label: '❄️ AC vehicle' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters[key]}
                        onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })}
                        className="w-4 h-4 accent-primary-600 rounded"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-800">{label}</span>
                    </label>
                  ))}
                </div>
                {(filters.maxPrice || filters.smoking || filters.pets || filters.ac) && (
                  <button
                    onClick={() => setFilters({ maxPrice: '', smoking: false, pets: false, ac: false })}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main results ── */}
          <main className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {pickup} → {drop || 'Anywhere'}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {loading ? 'Searching…' : `${filteredRides.length} ride${filteredRides.length !== 1 ? 's' : ''} found`}
                  {cached && <span className="ml-2 badge badge-gray">⚡ Cached</span>}
                </p>
              </div>
              {/* Sort */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="input-field pr-8 py-2 text-sm appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <RideSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="card p-12 text-center">
                <p className="text-4xl mb-4">😞</p>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h3>
                <p className="text-sm text-slate-500 mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Try again</button>
              </div>
            ) : filteredRides.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-5xl mb-4">🚗</p>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No rides found</h3>
                <p className="text-sm text-slate-500 mb-6">
                  No rides match your search right now. Try a different date or be the first to offer one!
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setFilters({ maxPrice: '', smoking: false, pets: false, ac: false })} className="btn-secondary">Clear filters</button>
                  <a href="/create-ride" className="btn-primary">Offer a ride</a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRides.map((ride, i) => (
                  <RideCard key={ride._id} ride={ride} index={i} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
