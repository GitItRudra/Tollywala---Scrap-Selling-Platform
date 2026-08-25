import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = ['Paper & cardboard', 'Plastic', 'Metal', 'Glass', 'E-waste & appliances', 'Other'];

function Toast({ message, isError, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className={'toast' + (isError ? ' error' : '')}>{message}</div>;
}

export default function Materials() {
  const { token } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [edits, setEdits] = useState({}); // { [id]: { rate, unit, category } }
  const [newMaterial, setNewMaterial] = useState({ name: '', rate: '', unit: 'kg', category: CATEGORIES[0] });
  const [adding, setAdding] = useState(false);

  function load() {
    setLoading(true);
    api
      .materials(token)
      .then((data) => setMaterials(data.materials))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  function getField(m, field) {
    return edits[m.id]?.[field] ?? m[field];
  }

  function setField(id, field, value) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function saveMaterial(m) {
    const edit = edits[m.id];
    if (!edit) return;
    try {
      const data = await api.updateMaterial(m.id, edit, token);
      setMaterials((prev) => prev.map((x) => (x.id === m.id ? data.material : x)));
      setEdits((prev) => {
        const next = { ...prev };
        delete next[m.id];
        return next;
      });
      setToast({ message: `Updated ${data.material.name}`, isError: false });
    } catch (err) {
      setToast({ message: err.message, isError: true });
    }
  }

  async function removeMaterial(m) {
    if (!confirm(`Delete "${m.name}" from the rate board? This cannot be undone.`)) return;
    try {
      await api.deleteMaterial(m.id, token);
      setMaterials((prev) => prev.filter((x) => x.id !== m.id));
      setToast({ message: `Deleted ${m.name}`, isError: false });
    } catch (err) {
      setToast({ message: err.message, isError: true });
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newMaterial.name.trim() || newMaterial.rate === '') {
      setToast({ message: 'Name and rate are required.', isError: true });
      return;
    }
    setAdding(true);
    try {
      const data = await api.createMaterial(newMaterial, token);
      setMaterials((prev) => [...prev, data.material]);
      setNewMaterial({ name: '', rate: '', unit: 'kg', category: CATEGORIES[0] });
      setToast({ message: `Added ${data.material.name}`, isError: false });
    } catch (err) {
      setToast({ message: err.message, isError: true });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Materials & rates</h1>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="add-form" onSubmit={handleAdd}>
        <div className="field">
          <label>Name</label>
          <input
            value={newMaterial.name}
            onChange={(e) => setNewMaterial((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Wooden Pallets"
          />
        </div>
        <div className="field" style={{ minWidth: 100 }}>
          <label>Rate (₹)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={newMaterial.rate}
            onChange={(e) => setNewMaterial((f) => ({ ...f, rate: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div className="field" style={{ minWidth: 100 }}>
          <label>Unit</label>
          <select value={newMaterial.unit} onChange={(e) => setNewMaterial((f) => ({ ...f, unit: e.target.value }))}>
            <option value="kg">kg</option>
            <option value="pcs">pcs</option>
          </select>
        </div>
        <div className="field" style={{ minWidth: 180 }}>
          <label>Category</label>
          <select
            value={newMaterial.category}
            onChange={(e) => setNewMaterial((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn" disabled={adding}>
          {adding ? 'Adding…' : 'Add material'}
        </button>
      </form>

      {loading ? (
        <p className="mono" style={{ color: 'var(--paper-dim)' }}>
          Loading materials…
        </p>
      ) : materials.length === 0 ? (
        <div className="empty-state">No materials yet. Add one above.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Rate</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const dirty = Boolean(edits[m.id]);
                return (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>
                      <select
                        className="status-select"
                        value={getField(m, 'category')}
                        onChange={(e) => setField(m.id, 'category', e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="editable-input"
                        type="number"
                        min="0"
                        step="0.5"
                        value={getField(m, 'rate')}
                        onChange={(e) => setField(m.id, 'rate', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={getField(m, 'unit')}
                        onChange={(e) => setField(m.id, 'unit', e.target.value)}
                      >
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-ghost" disabled={!dirty} onClick={() => saveMaterial(m)}>
                          Save
                        </button>
                        <button className="btn-danger" onClick={() => removeMaterial(m)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast.message} isError={toast.isError} onDone={() => setToast(null)} />}
    </div>
  );
}
