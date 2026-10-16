import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, fetchUserProfile } from '../lib/auth';
import type { UserProfile } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Firebase Auth user — null when signed out */
  firebaseUser: User | null;
  /** Firestore profile (name, role, active) — null until loaded */
  profile: UserProfile | null;
  /** True while the initial auth state is being determined */
  loading: boolean;
  /** True if signed in, profile loaded, and account is active */
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser:    null,
  profile:         null,
  loading:         true,
  isAuthenticated: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const p = await fetchUserProfile(user);
          setProfile(p);
        } catch {
          // Firestore read failed (no rules yet, offline, etc.)
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAuthenticated =
    !!firebaseUser && !!profile && profile.active === true;

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
