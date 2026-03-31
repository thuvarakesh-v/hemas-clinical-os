import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth as authAPI, patient as patientAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  // loading=true until we've finished the initial session check
  const [loading, setLoading]   = useState(true);
  // sessionValid=false means token is expired/invalid → go to login, not setup-profile
  const [sessionValid, setSessionValid] = useState(false);

  // Track if we're mid-session-restore so we don't double-fetch
  const restoringRef = useRef(false);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    if (restoringRef.current) return;
    restoringRef.current = true;

    const token  = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('user');

    if (!token || !stored) {
      // No session at all → go to login
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      setSessionValid(true);

      // Fetch profile — if 401 (expired token), clearSession() is called inside
      await fetchProfile();
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }

  // Fetches profile from backend.
  // If 401 → token expired → clear session (sends user to /login, not /setup-profile)
  // If 404 → no profile yet → profile stays null (sends user to /setup-profile)
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await patientAPI.getProfile();
      if (data.success) {
        setProfile(data.data);
        setSessionValid(true);
        return data.data;
      }
      // Non-success but no exception — treat as no profile
      setProfile(null);
      return null;
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        // Token expired or invalid → clear everything → user goes to /login
        clearSession();
        return null;
      }

      // 404 = no profile yet (normal for new users)
      // Other errors = network issue etc, treat as no profile temporarily
      setProfile(null);
      return null;
    }
  }, []);

  function clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
    setSessionValid(false);
  }

  async function login(identifier, password, pin) {
    const { data } = await authAPI.login({ identifier, password, pin });

    if (data.success) {
      localStorage.setItem('accessToken',  data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      setSessionValid(true);

      // Fetch profile before returning — ProfileRoute needs it immediately
      if (data.data.hasProfile) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
    }

    return data;
  }

  async function logout() {
    try { await authAPI.logout(); } catch { /* ignore */ }
    clearSession();
  }

  const loadProfile = fetchProfile;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      sessionValid,
      login,
      logout,
      loadProfile,
      setProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
