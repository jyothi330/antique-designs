import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  /** If supplied, only users with this role are admitted; others see 403. */
  requiredRole?: UserRole;
}

/**
 * Wraps any route that requires an active, authenticated session.
 *
 * - While auth state is loading → shows a full-screen spinner.
 * - Unauthenticated → redirects to /login, preserving the intended URL.
 * - Authenticated but inactive (profile.active === false) → shows a locked notice.
 * - Authenticated but wrong role → shows a permission-denied notice.
 */
export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { firebaseUser, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  // Not signed in at all
  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in but profile doesn't exist in Firestore (unprovisioned account)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec] px-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-sm w-full text-center shadow">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="font-semibold text-gray-800 mb-2">Account Not Provisioned</h2>
          <p className="text-sm text-gray-500">
            Your Firebase account exists but has no staff profile.
            Ask the owner to create your user record in Firestore.
          </p>
        </div>
      </div>
    );
  }

  // Account has been deactivated
  if (!profile.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec] px-4">
        <div className="bg-white border border-amber-200 rounded-2xl p-8 max-w-sm w-full text-center shadow">
          <div className="text-4xl mb-3">⛔</div>
          <h2 className="font-semibold text-gray-800 mb-2">Account Deactivated</h2>
          <p className="text-sm text-gray-500">
            Your account has been deactivated. Please contact the owner.
          </p>
        </div>
      </div>
    );
  }

  // Role check (e.g. owner-only routes)
  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec] px-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-sm w-full text-center shadow">
          <div className="text-4xl mb-3">🚫</div>
          <h2 className="font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500">
            This section requires <strong>{requiredRole}</strong> access.
            Your role is <strong>{profile.role}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
