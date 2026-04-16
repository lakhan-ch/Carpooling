import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * OAuthCallback — handles the Google OAuth redirect.
 * Reads ?token= from the URL, stores it, then redirects to dashboard.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { handleOAuthToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/login?error=oauth_failed');
      return;
    }

    handleOAuthToken(token);
    navigate('/dashboard');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
