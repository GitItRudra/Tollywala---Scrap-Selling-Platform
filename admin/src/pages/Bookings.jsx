import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function Bookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .bookings(token)
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleStatusChange(booking, status) {
    try {
      const data = await api.updateBookingStatus(booking.id, status, token);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: data.booking.status } : b)));
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Bookings</h1>
          <p>Every pickup booked across all users. Update status as pickups are actioned.</p>
        </div>
        <select className="status-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="mono" style={{ color: 'var(--paper-dim)' }}>
          Loading bookings…
        </p>
      ) : visible.length === 0 ? (
        <div className="empty-state">No bookings match this filter.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Material</th>
                <th>Qty</th>
                <th>Value</th>
                <th>Pickup date</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.user_name}
                    <br />
                    <span style={{ color: 'var(--paper-dim)', fontSize: 12 }}>{b.user_email}</span>
                  </td>
                  <td>{b.material_name}</td>
                  <td>
                    {b.quantity} {b.unit_at_booking}
                  </td>
                  <td className="mono">₹{b.estimated_value.toLocaleString('en-IN')}</td>
                  <td>{b.scheduled_date}</td>
                  <td className="wrap-cell">{b.address}</td>
                  <td>
                    <select
                      className="status-select"
                      value={b.status}
                      onChange={(e) => handleStatusChange(b, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
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
