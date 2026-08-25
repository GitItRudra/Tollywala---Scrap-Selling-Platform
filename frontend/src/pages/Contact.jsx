import { useState } from 'react';
import Footer from '../components/Footer.jsx';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // No backend endpoint wired up yet -- this just confirms locally.
    setSent(true);
  }

  return (
    <>
      <section className="hero" style={{ paddingTop: '70px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="eyebrow">Contact</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)' }}>Get in touch</h1>
          <p className="lede">
            Questions about a pickup, a rate, or partnering with us as a collector — reach out and
            we'll get back to you.
          </p>
        </div>
      </section>

      <section style={{ borderBottom: 'none' }}>
        <div className="wrap hero-grid">
          <div>
            <div className="tag">Reach us directly</div>
            <h2 style={{ fontSize: '28px', marginTop: '14px' }}>Talk to the team</h2>
            <div style={{ marginTop: '28px' }}>
              <p className="rate-note" style={{ fontSize: '14px', marginBottom: '6px' }}>EMAIL</p>
              <p style={{ fontSize: '16px' }}>hello@tollywala.example</p>
            </div>
            <div style={{ marginTop: '20px' }}>
              <p className="rate-note" style={{ fontSize: '14px', marginBottom: '6px' }}>PHONE</p>
              <p style={{ fontSize: '16px' }}>+91 98765 43210</p>
            </div>
            <div style={{ marginTop: '20px' }}>
              <p className="rate-note" style={{ fontSize: '14px', marginBottom: '6px' }}>HOURS</p>
              <p style={{ fontSize: '16px' }}>7 days a week, 8am – 8pm</p>
            </div>
          </div>

          <div className="scale-unit">
            <div className="scale-head">
              <span>
                <span className="led" />
                Send a message
              </span>
            </div>
            <div className="scale-body">
              {sent ? (
                <div>
                  <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Message received</h3>
                  <p className="rate-note">
                    Thanks, {form.name || 'there'} — we'll reply to {form.email || 'your email'} soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="auth-field">
                    <label htmlFor="c-name">Name</label>
                    <input id="c-name" type="text" required value={form.name} onChange={update('name')} placeholder="Your name" />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="c-email">Email</label>
                    <input
                      id="c-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={update('email')}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="c-message">Message</label>
                    <textarea
                      id="c-message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={update('message')}
                      placeholder="How can we help?"
                    />
                  </div>
                  <button type="submit" className="book-btn">
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}