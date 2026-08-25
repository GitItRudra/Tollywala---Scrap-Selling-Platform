import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Calculator from '../components/Calculator.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    api.materials().then((data) => setMaterials(data.materials)).catch(() => {});
  }, []);

  const groupedMaterials = useMemo(() => {
    const map = new Map();
    for (const m of materials) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category).push(m);
    }
    return [...map.entries()];
  }, [materials]);

  return (
    <>
      <section className="hero" style={{ paddingTop: '70px' }}>
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">Doorstep scrap pickup</div>
            <h1>
              Weigh it.
              <br />
              Sell it.
              <br />
              <span className="accent">Get paid</span> on the spot.
            </h1>
            <p className="lede">
              We send a verified collector with a certified digital scale to your door. No
              haggling, no middlemen — just today's rate, paid in cash or UPI before they leave.
            </p>
            <div className="hero-ctas">
              <a href="#calc" className="cta-btn">
                Estimate my scrap value
              </a>
              <a href="#how" className="ghost-btn">
                See how pickup works
              </a>
            </div>
            <div className="stat-row">
              <div className="stat">
                <b>41,200+</b>
                <span>Pickups completed</span>
              </div>
              <div className="stat">
                <b>&lt;24 hrs</b>
                <span>Average pickup time</span>
              </div>
              <div className="stat">
                <b>0%</b>
                <span>Commission taken</span>
              </div>
            </div>
          </div>

          <Calculator />
        </div>
      </section>

      <section id="how">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="tag">Three steps</div>
              <h2>How pickup works</h2>
            </div>
            <p>From your doorstep to a recycler's yard — the whole thing takes one visit.</p>
          </div>
        </div>
        <div className="process">
          <div className="p-step">
            <div className="num mono">01</div>
            <h3>Schedule a slot</h3>
            <p>Tell us your material, rough quantity, and a time that works. Most slots are filled within 24 hours.</p>
          </div>
          <div className="p-step">
            <div className="num mono">02</div>
            <h3>We weigh it live</h3>
            <p>A collector arrives with a certified digital scale. You watch the number, no estimates or guesswork.</p>
          </div>
          <div className="p-step">
            <div className="num mono">03</div>
            <h3>Get paid instantly</h3>
            <p>Cash or UPI, settled on your doorstep at the day's confirmed rate — before anything leaves your building.</p>
          </div>
        </div>
      </section>

      <section id="materials">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="tag">Today's board</div>
              <h2>What we take, and at what rate</h2>
            </div>
            <p>Rates shown per kg or per piece, updated daily. Don't see your item? We'll still quote it on pickup.</p>
          </div>
          {groupedMaterials.map(([category, items]) => (
            <div key={category} style={{ marginBottom: '40px' }}>
              <h3
                style={{
                  fontSize: '15px',
                  color: 'var(--recycle-green)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                {category}
              </h3>
              <div className="mat-grid">
                {items.map((m) => (
                  <div className="mat-card" key={m.id}>
                    <div className="m-name">{m.name}</div>
                    <div className="m-rate">
                      ₹{m.rate}
                      <span>/{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="trust">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="tag">From sellers</div>
              <h2>Why people switch from the local kabadiwala</h2>
            </div>
          </div>
          <div className="trust">
            <div className="t-card">
              <p>
                The collector's scale matched the number on my screen exactly. No arguing over
                kilos on the doorstep for once.
              </p>
              <div className="who">— Resident, Patliputra Colony</div>
            </div>
            <div className="t-card">
              <p>
                We cleared a workshop full of steel off-cuts in one visit and were paid by UPI
                before the truck pulled away.
              </p>
              <div className="who">— Small workshop owner, Gaya</div>
            </div>
            <div className="t-card">
              <p>
                Rates change daily and they actually show you the board. I check it before I
                decide when to sell.
              </p>
              <div className="who">— Housing society secretary</div>
            </div>
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <div className="tag">Ready when you are</div>
          <h2>Turn today's clutter into today's cash.</h2>
          <p>Pickups run seven days a week across the city. First slot is usually next-day.</p>
          <a href="#calc" className="cta-btn">
            Schedule your pickup
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
