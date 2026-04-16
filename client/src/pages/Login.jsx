import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--paper-warm)' }}>
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-14" style={{ background: '#0a0a0a', color: '#fff' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: 'var(--lime)', color: '#0a0a0a' }}>C</div>
          <span className="font-black text-lg tracking-tight">Carma</span>
        </Link>
        <div>
          <h2 className="font-black mb-6" style={{ fontSize: '3.2rem', lineHeight: 0.95, letterSpacing: '-0.04em' }}>
            The smarter<br />way to travel.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Join 500,000+ people sharing rides, splitting costs, and reducing traffic across India.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['2M+','Rides shared'],['150+','Cities'],['4.8★','Rating'],['₹1,200','Avg monthly saved']].map(([val, lbl]) => (
            <div key={lbl} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="font-black text-2xl" style={{ color: 'var(--lime)', letterSpacing: '-0.03em' }}>{val}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22,1,0.36,1] }}
          className="w-full max-w-md">

          <Link to="/" className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: '#0a0a0a', color: 'var(--lime)' }}>C</div>
            <span className="font-black tracking-tight">Carma</span>
          </Link>

          <h1 className="font-black mb-2" style={{ fontSize: '2.1rem', letterSpacing: '-0.035em' }}>Welcome back</h1>
          <p className="mb-8" style={{ color: 'var(--ink-60)', fontSize: '0.95rem' }}>Sign in to continue your journey</p>

          {/* Google button */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 mb-6 font-semibold text-sm transition-all hover:bg-black/4"
            style={{ border: '2px solid rgba(10,10,10,0.14)', borderRadius: '14px', background: '#fff', color: '#0a0a0a' }}>
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(10,10,10,0.1)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-30)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(10,10,10,0.1)' }} />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-4 py-3 mb-5 text-sm font-medium"
              style={{ background: '#fff1f0', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px' }}>
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="field"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="field-group">
              <div className="flex items-center justify-between">
                <label className="field-label">Password</label>
                <button type="button" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-60)' }}
                  className="hover-underline">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="field"
                  style={{ paddingRight: '3rem' }}
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold"
                  style={{ color: 'var(--ink-60)', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-pill-dark w-full py-4 mt-2" style={{ borderRadius: '14px' }}>
              {loading
                ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Signing in…</span>
                : <><span>Sign in</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center mt-6" style={{ fontSize: '0.875rem', color: 'var(--ink-60)' }}>
            No account?{' '}
            <Link to="/signup" className="font-bold hover-underline" style={{ color: '#0a0a0a' }}>Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
