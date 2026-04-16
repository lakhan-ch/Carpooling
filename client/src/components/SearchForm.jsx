import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Calendar, Users, Search } from 'lucide-react';

/**
 * SearchForm — uses .field-with-icon wrapper pattern (icon is pointer-events-none, outside input flow).
 * This prevents the icon-overlaps-text bug.
 */
export default function SearchForm({ initialValues = {}, size = 'lg' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickup: initialValues.pickup || '',
    drop:   initialValues.drop || '',
    date:   initialValues.date || '',
    seats:  initialValues.seats || 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = new URLSearchParams({ pickup: form.pickup, drop: form.drop, date: form.date, seats: form.seats });
    navigate(`/rides?${p}`);
  };

  const isLg = size === 'lg';

  if (isLg) {
    return (
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* FROM */}
          <div className="field-group md:col-span-1">
            <label className="field-label">From</label>
            <div className="field-with-icon">
              <MapPin size={15} className="field-icon" />
              <input type="text" placeholder="City or address" value={form.pickup}
                onChange={e => setForm({...form, pickup: e.target.value})}
                className="field" required />
            </div>
          </div>
          {/* TO */}
          <div className="field-group md:col-span-1">
            <label className="field-label">To</label>
            <div className="field-with-icon">
              <Navigation size={15} className="field-icon" />
              <input type="text" placeholder="City or address" value={form.drop}
                onChange={e => setForm({...form, drop: e.target.value})}
                className="field" />
            </div>
          </div>
          {/* DATE */}
          <div className="field-group">
            <label className="field-label">Date</label>
            <div className="field-with-icon">
              <Calendar size={15} className="field-icon" />
              <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({...form, date: e.target.value})}
                className="field" />
            </div>
          </div>
          {/* SEATS */}
          <div className="field-group">
            <label className="field-label">Seats</label>
            <div className="field-with-icon">
              <Users size={15} className="field-icon" />
              <select value={form.seats} onChange={e => setForm({...form, seats: e.target.value})}
                className="field">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} seat{n>1?'s':''}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button type="submit" className="btn-pill-dark gap-2" style={{ fontSize: '0.95rem' }}>
          <Search size={16} />
          Search rides
        </button>
      </form>
    );
  }

  // Small variant (sticky header on search results)
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="field-group flex-1 min-w-36">
          <label className="field-label">From</label>
          <div className="field-with-icon">
            <MapPin size={13} className="field-icon" />
            <input type="text" placeholder="From" value={form.pickup}
              onChange={e => setForm({...form, pickup: e.target.value})}
              className="field" style={{ fontSize: '0.875rem' }} required />
          </div>
        </div>
        <div className="field-group flex-1 min-w-36">
          <label className="field-label">To</label>
          <div className="field-with-icon">
            <Navigation size={13} className="field-icon" />
            <input type="text" placeholder="To" value={form.drop}
              onChange={e => setForm({...form, drop: e.target.value})}
              className="field" style={{ fontSize: '0.875rem' }} />
          </div>
        </div>
        <div className="field-group w-36">
          <label className="field-label">Date</label>
          <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
            onChange={e => setForm({...form, date: e.target.value})}
            className="field" style={{ fontSize: '0.875rem' }} />
        </div>
        <div className="field-group w-24">
          <label className="field-label">Seats</label>
          <select value={form.seats} onChange={e => setForm({...form, seats: e.target.value})}
            className="field" style={{ fontSize: '0.875rem' }}>
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex-shrink-0" style={{ paddingBottom: '0.1rem' }}>
          <button type="submit" className="btn-pill-dark gap-1.5" style={{ fontSize: '0.875rem', padding: '0.75rem 1.3rem' }}>
            <Search size={14} /> Search
          </button>
        </div>
      </div>
    </form>
  );
}
