import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import SearchForm from '../components/SearchForm';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';
import HeroPhotoStrip from '../components/HeroPhotoStrip';
import ScrollRevealText from '../components/ScrollRevealText';

// Simple scroll reveal — attaches to a container and marks all .reveal children visible
function useRevealContainer() {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const targets = container.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
    }, { threshold: 0.1 });
    targets.forEach(t => obs.observe(t));
    // Also observe the container itself
    obs.observe(container);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const stats = [
  { value: '2M+',  label: 'Rides shared' },
  { value: '500K+', label: 'Happy riders' },
  { value: '150+', label: 'Cities' },
  { value: '4.8★', label: 'Avg rating' },
];

const steps = [
  { num: '01', label: 'Search', headline: 'Find drivers going your way', body: 'Enter your pickup and drop-off. Our algorithm ranks rides by route match — scored 0–100.' },
  { num: '02', label: 'Book', headline: 'Request a seat in one tap', body: 'Send a join request with a message. Drivers approve within minutes.' },
  { num: '03', label: 'Ride', headline: 'Share the journey, split the cost', body: 'Meet your driver, chat in-app, and track your ride live. Phone numbers? Never shared.' },
];

const trusts = [
  { icon: <Shield size={28} />, title: 'Privacy first', body: 'Phone numbers are masked. Profiles stay blurred until your booking is confirmed.' },
  { icon: <Zap size={28} />, title: 'Smart matching', body: 'Haversine-powered scoring ranks every ride 0–100 across proximity, route, and time.' },
  { icon: <Users size={28} />, title: 'Verified rides', body: 'Ratings, reviews, and vehicle checks keep the community high quality.' },
];

export default function Landing() {
  const pageRef = useRevealContainer();

  return (
    <div ref={pageRef} style={{ background: '#ffffff', color: '#0a0a0a' }}>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20" style={{ background: '#ffffff' }}>
        {/* Floating lime orb */}
        <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'var(--lime)', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'var(--lime)', animation: 'float 10s ease-in-out infinite reverse' }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-16">
          {/* Eyebrow */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-eyebrow mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--lime)] opacity-100" style={{ boxShadow: '0 0 8px var(--lime)' }} />
            Now live in 150+ cities
          </motion.p>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="display-xl mb-4 max-w-5xl">
            Share rides,
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-baseline gap-4 mb-4">
            <span className="display-serif">save money,</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="display-xl mb-12">
            travel smarter.
          </motion.h1>

          {/* Search card */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <div className="card-rounded border border-black/8 p-6 md:p-8 max-w-5xl" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <SearchForm size="lg" />
            </div>
          </motion.div>

          {/* CTA row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center gap-4 mt-8 mb-20">
            <Link to="/signup" className="btn-pill-dark">
              Get started free <ArrowRight size={16} />
            </Link>
            <Link to="/create-ride" className="btn-pill-ghost">
              Offer a ride
            </Link>
            <p className="text-sm ml-2" style={{ color: 'var(--ink-60)' }}>No credit card required</p>
          </motion.div>
        </div>

        {/* Hero auto-scrolling photo strip */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
          className="w-full pb-10">
          <HeroPhotoStrip />
        </motion.div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────── */}
      <section style={{ background: '#0a0a0a', color: '#fff' }} className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((s, i) => (
              <div key={s.label} className={`text-center reveal-delay-${i + 1}`}>
                <div className="font-black text-[var(--lime)]" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {s.value}
                </div>
                <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-32" style={{ background: 'var(--paper-warm)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="reveal mb-20">
            <p className="text-eyebrow mb-4">How it works</p>
            <h2 className="display-md max-w-lg">Three steps to your next shared journey</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.num}
                className={`reveal reveal-delay-${i + 1} card-grey p-8 flex flex-col gap-6`}>
                <div className="flex items-center justify-between">
                  <span className="font-black" style={{ fontSize: '4rem', lineHeight: 1, color: 'rgba(10,10,10,0.08)', letterSpacing: '-0.04em' }}>
                    {s.num}
                  </span>
                  <span className="tag tag-dark">{s.label}</span>
                </div>
                <div>
                  <h3 className="font-black text-xl mb-3" style={{ letterSpacing: '-0.02em' }}>{s.headline}</h3>
                  <p className="text-body">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LARGE CALLOUT ─────────────────────────────────── */}
      <section className="py-28" style={{ background: 'var(--lime)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="reveal flex flex-col md:flex-row items-end justify-between gap-10">
            <div>
              <p className="text-eyebrow mb-5" style={{ color: 'rgba(10,10,10,0.5)' }}>Route matching</p>
              <ScrollRevealText 
                text="Every ride gets a match score. You always see the best options first." 
                className="display-lg max-w-2xl" 
              />
            </div>
            <div className="flex-shrink-0">
              <Link to="/rides?mode=search" className="btn-pill-dark text-lg px-8 py-4">
                Search rides <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Visual match score demo */}
          <div className="reveal reveal-delay-2 mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { driver: 'Rajan S.', from: 'Koramangala', to: 'Whitefield', score: 94, price: 180, time: '08:30 AM' },
              { driver: 'Priya M.', from: 'Indiranagar', to: 'Electronic City', score: 76, price: 140, time: '09:00 AM' },
              { driver: 'Arjun K.', from: 'HSR Layout', to: 'Marathahalli', score: 61, price: 100, time: '09:15 AM' },
            ].map((ride, i) => (
              <div key={ride.driver} className={`card-rounded p-6 reveal-delay-${i + 1}`}
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm" style={{ background: 'var(--ink)', color: 'var(--lime)' }}>
                      {ride.driver[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{ride.driver}</p>
                      <p className="text-xs" style={{ color: 'var(--ink-60)' }}>{ride.time}</p>
                    </div>
                  </div>
                  <span className="font-black text-lg">₹{ride.price}</span>
                </div>
                <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--ink-60)' }}>
                  <span>{ride.from}</span>
                  <span>→</span>
                  <span>{ride.to}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span style={{ color: 'var(--ink-60)' }}>Route match</span>
                    <span style={{ color: ride.score >= 80 ? '#16a34a' : ride.score >= 60 ? '#2563eb' : '#d97706' }}>
                      {ride.score}%
                    </span>
                  </div>
                  <div className="match-track">
                    <div className="match-fill" style={{
                      width: `${ride.score}%`,
                      background: ride.score >= 80 ? '#16a34a' : ride.score >= 60 ? '#2563eb' : '#d97706'
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST ─────────────────────────────────────────── */}
      <section className="py-32" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="reveal mb-16">
            <p className="text-eyebrow mb-4">Why Carma</p>
            <h2 className="display-md max-w-xl">Built for trust, safety, and privacy.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {trusts.map((t, i) => (
              <div key={t.title} className={`reveal reveal-delay-${i + 1} border border-black/8 rounded-4xl p-8 hover:border-black/20 hover:-translate-y-1 transition-all duration-300`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'var(--lime)' }}>
                  {t.icon}
                </div>
                <h3 className="font-black text-xl mb-3" style={{ letterSpacing: '-0.02em' }}>{t.title}</h3>
                <p className="text-body">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-28" style={{ background: '#0a0a0a', color: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-16">
            <p className="text-eyebrow mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Community</p>
            <h2 className="display-md" style={{ color: '#fff' }}>Loved across India.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya K.', city: 'Bangalore', text: 'Carma saved me ₹4,000 last month. The match score feature is genius — I always find a ride that\'s actually on my route.', rating: 5 },
              { name: 'Rahul M.', city: 'Mumbai', text: 'As a driver I cover my fuel costs every week. And the in-app chat means I never share my number with strangers.', rating: 5 },
              { name: 'Ananya S.', city: 'Hyderabad', text: 'The SOS button and blurred profiles make me feel completely safe. This is how ride-sharing should always have worked.', rating: 5 },
            ].map((t) => (
              <div key={t.name} className="rounded-4xl p-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-[var(--lime)] text-lg">★</span>
                  ))}
                </div>
                <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm" style={{ background: 'var(--lime)', color: 'var(--ink)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#fff' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────── */}
      <section className="py-32" style={{ background: 'var(--lime)' }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="display-lg mb-6">Your next ride is waiting.</h2>
          <p className="text-body-lg mb-10 max-w-xl mx-auto" style={{ color: 'rgba(10,10,10,0.6)' }}>
            Join 500K+ people already carpooling smarter across India.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup" className="btn-pill-dark text-base py-4 px-10">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link to="/rides?mode=search" className="btn-pill-ghost text-base py-4 px-8">
              Browse rides
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
