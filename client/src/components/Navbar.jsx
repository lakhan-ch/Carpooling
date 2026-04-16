import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Menu, X, ChevronDown, LogOut, User, Plus } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[var(--ink)] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 duration-300">
              <Car size={16} className="text-[var(--lime)]" />
            </div>
          <span className="font-black text-lg tracking-tight" style={{ color: 'var(--ink)' }}>Carma</span>
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/rides?mode=search', label: 'Find a ride' },
              { to: '/create-ride', label: 'Offer a ride' },
            ].map(link => (
              <Link key={link.to} to={link.to}
                className="px-4 py-2 rounded-full text-sm font-600 text-[var(--ink-60)] hover:text-[var(--ink)] hover:bg-black/5 transition-all duration-200">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/create-ride" className="btn-pill-lime text-sm py-2.5 px-5">
                  <Plus size={14} /> Offer ride
                </Link>
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border-2 border-black/10 hover:border-black/30 transition-all">
                    <div className="w-7 h-7 rounded-full bg-[var(--lime)] flex items-center justify-center">
                      <span className="text-xs font-black text-[var(--ink)]">{user?.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <ChevronDown size={12} className="text-[var(--ink-60)]" />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-2xl border border-black/8 overflow-hidden z-50"
                        onMouseLeave={() => setProfileOpen(false)}>
                        <div className="px-5 py-4 border-b border-black/6">
                          <p className="font-bold text-sm text-[var(--ink)]">{user?.name}</p>
                          <p className="text-xs text-[var(--ink-60)] mt-0.5">{user?.email}</p>
                        </div>
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-5 py-3.5 text-sm font-500 text-[var(--ink)] hover:bg-black/4 transition-colors">
                          <User size={14} /> Dashboard
                        </Link>
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-5 py-3.5 text-sm font-600 text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={14} /> Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-600 text-[var(--ink-60)] hover:text-[var(--ink)] px-3 py-2 transition-colors">Sign in</Link>
                <Link to="/signup" className="btn-pill-dark text-sm py-2.5 px-5">Get started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-xl text-[var(--ink)]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-black/8">
            <div className="px-6 py-5 space-y-2">
              <Link to="/rides?mode=search" onClick={() => setMobileOpen(false)} className="block py-3 font-600 text-[var(--ink)]">Find a ride</Link>
              <Link to="/create-ride" onClick={() => setMobileOpen(false)} className="block py-3 font-600 text-[var(--ink)]">Offer a ride</Link>
              <div className="pt-3 border-t border-black/8 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-3 font-600 text-[var(--ink)]">Dashboard</Link>
                    <button onClick={handleLogout} className="block py-3 font-600 text-red-500 w-full text-left">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-3 font-600 text-[var(--ink)]">Sign in</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-pill-dark block text-center py-3">Get started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
