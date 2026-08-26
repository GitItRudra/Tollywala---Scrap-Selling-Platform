import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  function handleLogout() {
    close();
    logout();
    navigate('/');
  }

  return (
    <header>
      <nav>
        <Link to="/" className="logo" onClick={close}>
          TOLLY<span>WALA</span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>

        <div className={'navlinks' + (open ? ' open' : '')}>
          <Link to="/#how" onClick={close}>
            How it works
          </Link>
          <Link to="/#materials" onClick={close}>
            Materials
          </Link>
          <Link to="/about" onClick={close}>
            About us
          </Link>
          <Link to="/contact" onClick={close}>
            Contact
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={close}>
                Dashboard
              </Link>
              <button className="linklike" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={close}>
              Log in
            </Link>
          )}
          <Link to={user ? '/dashboard' : '/register'} className="cta-btn mobile-cta" onClick={close}>
            {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign up'}
          </Link>
        </div>

        <Link to={user ? '/dashboard' : '/register'} className="cta-btn desktop-cta">
          {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign up'}
        </Link>
      </nav>
      <div className="stripe-rule" />
    </header>
  );
}
