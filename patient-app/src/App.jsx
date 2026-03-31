import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupProfile from './pages/SetupProfile';
import Home from './pages/Home';
import Vault from './pages/Vault';
import AIEngine from './pages/AIEngine';
import Booking from './pages/Booking';
import DoctorDetail from './pages/DoctorDetail';
import Profile from './pages/Profile';
import EmergencyPage from './pages/EmergencyPage';
import BottomNav from './components/BottomNav';
import AppointmentHistory from './pages/AppointmentHistory';

const Spinner = () => (
  <div className="page-center">
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 12 }}>Loading…</p>
    </div>
  </div>
);

// Simple auth guard — just needs a valid session
function AuthRoute({ children }) {
  const { user, loading, sessionValid } = useAuth();
  if (loading) return <Spinner />;
  if (!user || !sessionValid) return <Navigate to="/login" replace />;
  return children;
}

// Profile guard — needs auth + completed profile
// If token expired → /login (via sessionValid check)
// If no profile yet → /setup-profile
// If loading → spinner (never redirects prematurely)
function ProfileRoute({ children }) {
  const { user, profile, loading, sessionValid } = useAuth();
  if (loading) return <Spinner />;
  if (!user || !sessionValid) return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/setup-profile" replace />;
  return children;
}

// Setup profile guard — if profile exists already, go home
function SetupProfileGuard() {
  const { user, profile, loading, sessionValid } = useAuth();
  if (loading) return <Spinner />;
  if (!user || !sessionValid) return <Navigate to="/login" replace />;
  if (profile?.profile) return <Navigate to="/" replace />;
  return <SetupProfile />;
}

function WithNav({ children }) {
  return (
    <div>
      {children}
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const { user, sessionValid } = useAuth();
  const loggedIn = user && sessionValid;

  return (
    <Routes>
      {/* Public */}
      <Route path="/emergency/:token" element={<EmergencyPage />} />
      <Route path="/login"    element={!loggedIn ? <Login />    : <Navigate to="/" replace />} />
      <Route path="/register" element={!loggedIn ? <Register /> : <Navigate to="/" replace />} />

      {/* Auth but no profile needed */}
      <Route path="/setup-profile" element={<SetupProfileGuard />} />

      {/* Auth + profile required */}
      <Route path="/"             element={<ProfileRoute><WithNav><Home /></WithNav></ProfileRoute>} />
      <Route path="/vault"        element={<ProfileRoute><WithNav><Vault /></WithNav></ProfileRoute>} />
      <Route path="/ai"           element={<ProfileRoute><WithNav><AIEngine /></WithNav></ProfileRoute>} />
      <Route path="/booking"      element={<ProfileRoute><WithNav><Booking /></WithNav></ProfileRoute>} />
      <Route path="/profile"      element={<ProfileRoute><WithNav><Profile /></WithNav></ProfileRoute>} />
      <Route path="/appointments" element={<ProfileRoute><WithNav><AppointmentHistory /></WithNav></ProfileRoute>} />

      {/* Auth only */}
      <Route path="/doctors/:id" element={<AuthRoute><DoctorDetail /></AuthRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
