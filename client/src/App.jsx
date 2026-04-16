import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SOSButton from './components/SOSButton';

import Landing from './pages/Landing';
import SearchResults from './pages/SearchResults';
import RideDetail from './pages/RideDetail';
import CreateRide from './pages/CreateRide';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';


/** Guard: redirect to /login if not authenticated */
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Guard: redirect to /dashboard if already authenticated */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/rides" element={<SearchResults />} />
          <Route path="/rides/:id" element={<RideDetail />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />

          {/* Auth pages (redirect if already logged in) */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

          {/* Protected pages */}
          <Route path="/create-ride" element={<PrivateRoute><CreateRide /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          {/* 404 fallback */}
          <Route path="*" element={
            <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
              <p style={{ fontSize: '5rem' }}>🛣️</p>
              <h2 className="font-black text-2xl" style={{ letterSpacing: '-0.02em' }}>Page not found</h2>
              <p style={{ color: 'var(--ink-60)' }}>The road you're looking for doesn't exist.</p>
              <a href="/" className="btn-pill-dark mt-2">Back to home</a>
            </div>
          } />
        </Routes>
      </main>

      <Footer />

      {/* Global floating SOS button */}
      <SOSButton />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1e293b',
            boxShadow: '0 8px 32px -8px rgba(0,0,0,0.12)',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppLayout />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
