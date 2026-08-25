import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .myBookings(token)
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const totalValue = bookings.reduce((sum, b) => sum + b.estimated_value, 0);

  return (
    <div className="wrap" style={{ paddingTop: '56px', paddingBottom: '90px' }}>
      <div className="dash-head">
        <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p>
          {bookings.length} pickup{bookings.length === 1 ? '' : 's'} booked · ₹
          {totalValue.toLocaleString('en-IN')} in estimated value
        </p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <p className="rate-note">Loading your bookings…</p>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p>You haven't booked a pickup yet.</p>
          <p style={{ marginTop: '10px' }}>
            <Link to="/#calc">Estimate your scrap value and schedule one →</Link>
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="booking-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Quantity</th>
                <th>Est. value</th>
                <th>Pickup date</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.material_name}</td>
                  <td>{b.quantity} {b.unit_at_booking}</td>
                  <td className="mono">₹{b.estimated_value.toLocaleString('en-IN')}</td>
                  <td>{b.scheduled_date}</td>
                  <td>{b.address}</td>
                  <td>
                    <span className="status-pill">{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
