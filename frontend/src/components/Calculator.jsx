import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import BookingModal from './BookingModal.jsx';

function formatClock() {
  const d = new Date();
  return `Updated ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
}

const UNIT_LABEL = { kg: 'Weight (kg)', pcs: 'Quantity (pcs)' };

export default function Calculator() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [materialId, setMaterialId] = useState(null);
  const [quantity, setQuantity] = useState(10);
  const [loadError, setLoadError] = useState('');
  const [clock, setClock] = useState(formatClock());
  const [showModal, setShowModal] = useState(false);
  const [bookedConfirmation, setBookedConfirmation] = useState(null);

  useEffect(() => {
    api
      .materials()
      .then((data) => {
        setMaterials(data.materials);
        if (data.materials.length) setMaterialId(data.materials[0].id);
      })
      .catch(() => setLoadError('Could not load live rates. Is the API server running?'));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setClock(formatClock()), 30000);
    return () => clearInterval(t);
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const m of materials) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category).push(m);
    }
    return [...map.entries()];
  }, [materials]);

  const selected = materials.find((m) => m.id === materialId);
  const total = selected ? Math.round(selected.rate * (Number(quantity) || 0) * 100) / 100 : 0;

  function handleBookClick() {
    if (!selected || !quantity || Number(quantity) <= 0) return;
    if (!user) {
      navigate('/login', { state: { from: '/#calc' } });
      return;
    }
    setShowModal(true);
  }

  function handleBooked(booking) {
    setShowModal(false);
    setBookedConfirmation(booking);
  }

  return (
    <div className="scale-unit" id="calc">
      <div className="scale-head">
        <span>
          <span className="led" />
          Live rate board
        </span>
        <span>{loadError ? '—' : clock}</span>
      </div>
      <div className="scale-body">
        {loadError ? (
          <p className="rate-note" style={{ color: 'var(--danger)' }}>
            {loadError}
          </p>
        ) : (
          <>
            <div className="field-row">
              <div className="field">
                <label htmlFor="material">Material</label>
                <select
                  id="material"
                  value={materialId ?? ''}
                  onChange={(e) => setMaterialId(Number(e.target.value))}
                >
                  {groups.map(([category, items]) => (
                    <optgroup key={category} label={category}>
                      {items.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="quantity">{selected ? UNIT_LABEL[selected.unit] : 'Amount'}</label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  step={selected?.unit === 'pcs' ? '1' : '0.5'}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="readout">
              <div>
                <div className="label">Estimated payout</div>
                <div className="value mono">₹{total.toLocaleString('en-IN')}</div>
              </div>
              {selected && (
                <div className="rate-note mono">
                  ₹{selected.rate} / {selected.unit} — {selected.name}
                </div>
              )}
            </div>
            <p className="rate-note">
              Rates update daily and are confirmed on the collector's scale before you're paid.
            </p>
            <button className="book-btn" onClick={handleBookClick} disabled={!selected}>
              {user ? 'Book a pickup for this estimate' : 'Log in to book a pickup'}
            </button>
          </>
        )}
      </div>

      {showModal && selected && (
        <BookingModal
          material={selected}
          quantity={Number(quantity)}
          estimatedValue={total}
          onClose={() => setShowModal(false)}
          onBooked={handleBooked}
        />
      )}

      {bookedConfirmation && (
        <div className="modal-backdrop" onClick={() => setBookedConfirmation(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Pickup requested</h3>
            <p className="sub">
              We've logged your pickup for {bookedConfirmation.material_name} on{' '}
              {bookedConfirmation.scheduled_date}. Track it anytime from your dashboard.
            </p>
            <div className="modal-actions">
              <button
                className="ghost-btn"
                style={{ flex: 1 }}
                onClick={() => setBookedConfirmation(null)}
              >
                Close
              </button>
              <button
                className="book-btn"
                style={{ flex: 2, marginTop: 0 }}
                onClick={() => navigate('/dashboard')}
              >
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
