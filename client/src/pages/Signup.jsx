import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PW_RULES = [
  { label: '6+ characters', test: p => p.length >= 6 },
  { label: 'Contains a number', test: p => /\d/.test(p) },
  { label: 'Contains a letter', test: p => /[a-zA-Z]/.test(p) },
];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RIDER' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passed = PW_RULES.filter(r => r.test(form.password)).length;
  const strengthColor = passed === 3 ? '#16a34a' : passed === 2 ? '#ca8a04' : '#dc2626';
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][passed] || '';

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Welcome to Carma! 🎉');
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`;
  };

  const roles = [
    { value: 'RIDER',  emoji: '🚌', label: 'Rider',  desc: 'Find & join rides' },
    { value: 'DRIVER', emoji: '🚗', label: 'Driver', desc: 'Offer rides' },
    { value: 'BOTH',   emoji: '⚡', label: 'Both',   desc: 'Do everything' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--paper-warm)' }}>
      {/* ── Left lime panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-14" style={{ background: 'var(--lime)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: '#0a0a0a', color: 'var(--lime)' }}>C</div>
          <span className="font-black text-lg tracking-tight">Carma</span>
        </Link>
        <div>
          <h2 className="font-black mb-8" style={{ fontSize: '3rem', lineHeight: 0.95, letterSpacing: '-0.04em' }}>
            Join 500K+<br />people traveling<br />smarter.
          </h2>
          {['Smart route matching scored 0–100', 'Privacy-first: phone numbers never shared', 'Real-time in-app chat with drivers', 'SOS emergency button on every ride'].map(f => (
            <div key={f} className="flex items-center gap-3 mt-4">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#0a0a0a' }}>
                <Check size={10} style={{ color: 'var(--lime)' }} />
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(10,10,10,0.75)' }}>{f}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(10,10,10,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Free · No credit card required
        </p>
      </div>

      {/* ── Right form ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22,1,0.36,1] }}
          className="w-full max-w-md">

          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: '#0a0a0a', color: 'var(--lime)' }}>C</div>
            <span className="font-black tracking-tight">Carma</span>
          </Link>

          <h1 className="font-black mb-2" style={{ fontSize: '2.1rem', letterSpacing: '-0.035em' }}>Create your account</h1>
          <p className="mb-7" style={{ color: 'var(--ink-60)', fontSize: '0.95rem' }}>It's free. Always will be.</p>

          {/* Google */}
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

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(10,10,10,0.1)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-30)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(10,10,10,0.1)' }} />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-4 py-3 mb-4 text-sm font-medium"
              style={{ background: '#fff1f0', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px' }}>
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="field-group">
              <label className="field-label">Full name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Your full name" className="field" required />
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="you@example.com" className="field" required />
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Min. 6 characters" className="field" style={{ paddingRight: '3rem' }} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold"
                  style={{ color: 'var(--ink-60)', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {form.password && (
                <div className="space-y-1.5 mt-1">
                  <div className="flex gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i < passed ? strengthColor : 'rgba(10,10,10,0.1)' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Role */}
            <div className="field-group">
              <label className="field-label">I want to</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <label key={r.value} className="cursor-pointer">
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                      onChange={() => setForm({...form, role: r.value})} className="sr-only" />
                    <div className="p-3 text-center transition-all duration-200"
                      style={{
                        borderRadius: '12px',
                        border: `2px solid ${form.role === r.value ? '#0a0a0a' : 'rgba(10,10,10,0.12)'}`,
                        background: form.role === r.value ? '#0a0a0a' : 'transparent',
                        color: form.role === r.value ? '#fff' : '#0a0a0a',
                      }}>
                      <div style={{ fontSize: '1.3rem', marginBottom: '2px' }}>{r.emoji}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{r.label}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '1px' }}>{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-pill-dark w-full py-4 mt-2" style={{ borderRadius: '14px' }}>
              {loading ? 'Creating account…' : <><span>Create account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center mt-5" style={{ fontSize: '0.875rem', color: 'var(--ink-60)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold hover-underline" style={{ color: '#0a0a0a' }}>Sign in</Link>
          </p>
          <p className="text-center mt-2" style={{ fontSize: '0.72rem', color: 'var(--ink-30)' }}>
            By signing up you agree to our Terms and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
