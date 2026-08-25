import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.stats(token).then((data) => setStats(data.stats)).catch((err) => setError(err.message));
  }, [token]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>A quick overview of the platform right now.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Total users</div>
            <div className="value mono">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <div className="label">Materials listed</div>
            <div className="value mono">{stats.totalMaterials}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total bookings</div>
            <div className="value mono">{stats.totalBookings}</div>
          </div>
          <div className="stat-card">
            <div className="label">Pending pickups</div>
            <div className="value mono">{stats.pendingBookings}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total estimated value</div>
            <div className="value mono">₹{stats.totalEstimatedValue.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
