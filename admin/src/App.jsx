import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Materials from './pages/Materials.jsx';
import Bookings from './pages/Bookings.jsx';
import Users from './pages/Users.jsx';
import { useAuth } from './context/AuthContext.jsx';

function ProtectedShell({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Loading…</div>;
  }
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedShell>
            <Dashboard />
          </ProtectedShell>
        }
      />
      <Route
        path="/materials"
        element={
          <ProtectedShell>
            <Materials />
          </ProtectedShell>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedShell>
            <Bookings />
          </ProtectedShell>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedShell>
            <Users />
          </ProtectedShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
