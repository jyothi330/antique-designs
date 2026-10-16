import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signIn, resetPassword, friendlyAuthError } from '../lib/auth';
import type { FirebaseError } from 'firebase/app';
import { BrandLogo } from '../components/BrandLogo';

type Mode = 'login' | 'reset';

export default function LoginPage() {
  const { firebaseUser, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as { from?: Location })?.from?.pathname ?? '/';

  const [mode,       setMode]       = useState<Mode>('login');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [resetSent,  setResetSent]  = useState(false);

  // Already signed in — redirect immediately
  if (!loading && firebaseUser) {
    return <Navigate to={from} replace />;
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim())    { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const code = (err as FirebaseError).code ?? '';
      setError(friendlyAuthError(code));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your email address.'); return; }

    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      const code = (err as FirebaseError).code ?? '';
      setError(friendlyAuthError(code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf8ee] to-[#ede5d4] px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-amber-400 bg-white shadow mb-4">
            <BrandLogo className="w-9 h-9" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-amber-800 tracking-wider">
            ANTIQUE DESIGNS
          </h1>
          <p className="text-xs text-gray-500 tracking-widest uppercase mt-1">
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#ede5d4] rounded-2xl p-8 shadow-xl">

          {mode === 'login' && (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500 mb-6">
                Sign in to manage quotations &amp; operations
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignIn} noValidate className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="antiquedesigns123@gmail.com"
                    autoComplete="email"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError(''); }}
                    className="text-xs text-amber-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg text-sm font-bold tracking-wide text-white
                    bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90
                    disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Authorised personnel only
              </p>
            </>
          )}

          {mode === 'reset' && !resetSent && (
            <>
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-700 mb-4"
              >
                ← Back to sign in
              </button>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Reset Password</h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email and we'll send a reset link.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} noValidate className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="antiquedesigns123@gmail.com"
                    autoComplete="email"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg text-sm font-bold text-white
                    bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90
                    disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {mode === 'reset' && resetSent && (
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6">
                A password reset link has been sent to <strong>{email}</strong>.
                Check your inbox (and spam folder).
              </p>
              <button
                onClick={() => { setMode('login'); setResetSent(false); setError(''); }}
                className="text-sm text-amber-700 font-semibold hover:underline"
              >
                ← Back to sign in
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Antique Designs, Bengaluru. All rights reserved.
        </p>
      </div>
    </div>
  );
}
