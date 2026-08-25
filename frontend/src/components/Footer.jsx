import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot-row">
        <Link to="/" className="logo">
          TOLLY<span style={{ color: 'var(--scale-yellow)' }}>WALA</span>
        </Link>
        <div className="foot-links">
          <Link to="/#materials">Rate board</Link>
          <Link to="/#how">How it works</Link>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}