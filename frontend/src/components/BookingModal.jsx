import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function BookingModal({ material, quantity, estimatedValue, onClose, onBooked }) {
  const { token } = useAuth();
  const [address, setAddress] = useState('');
  const [scheduledDate, setScheduledDate] = useState(todayPlus(1));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!address.trim()) {
      setError('Please add a pickup address.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.createBooking(
        {
          materialId: material.id,
          quantity,
          address: address.trim(),
          scheduledDate,
        },
        token
      );
      onBooked(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Confirm your pickup</h3>
        <p className="sub">
          {material.name} · {quantity} {material.unit} · Estimated ₹{estimatedValue.toLocaleString('en-IN')}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="address">Pickup address</label>
            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House / street, locality, city"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="date">Preferred date</label>
            <input
              id="date"
              type="date"
              min={todayPlus(0)}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="book-btn" disabled={submitting} style={{ flex: 2, marginTop: 0 }}>
              {submitting ? 'Booking…' : 'Confirm pickup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
