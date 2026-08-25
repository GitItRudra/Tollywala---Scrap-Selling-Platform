import Footer from '../components/Footer.jsx';

export default function About() {
  return (
    <>
      <section className="hero" style={{ paddingTop: '70px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="eyebrow">About us</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)' }}>
            Built to make selling scrap <span className="accent">fair</span> and simple.
          </h1>
          <p className="lede" style={{ maxWidth: '60ch' }}>
            Tollywala started with a simple frustration: scrap rates change every day, but
            sellers rarely see them. We built a platform where the rate is on the screen before
            the collector ever knocks — and the number on their scale is the number you agreed to.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="tag">What we do</div>
              <h2>Doorstep pickup, transparent pricing</h2>
            </div>
            <p>We connect households, shops, and small workshops directly with verified scrap collectors.</p>
          </div>
        </div>
        <div className="process">
          <div className="p-step">
            <div className="num mono">01</div>
            <h3>Live rate board</h3>
            <p>Rates for every material are published daily, so you know what you're owed before you book.</p>
          </div>
          <div className="p-step">
            <div className="num mono">02</div>
            <h3>Verified collectors</h3>
            <p>Every collector on the platform carries a certified digital scale and is background checked.</p>
          </div>
          <div className="p-step">
            <div className="num mono">03</div>
            <h3>No commission</h3>
            <p>We don't take a cut of what you're paid — the rate on the board is the rate you get.</p>
          </div>
        </div>
      </section>

      <section id="trust" style={{ borderBottom: 'none' }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="tag">By the numbers</div>
              <h2>Where we stand today</h2>
            </div>
          </div>
          <div className="stat-row">
            <div className="stat">
              <b>41,200+</b>
              <span>Pickups completed</span>
            </div>
            <div className="stat">
              <b>7</b>
              <span>Material types accepted</span>
            </div>
            <div className="stat">
              <b>0%</b>
              <span>Commission taken</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}