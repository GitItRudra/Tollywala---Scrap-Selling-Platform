import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header>
      <nav>
        <Link to="/" className="logo">
          TOLLY<span>WALA</span>
        </Link>
        <div className="navlinks">
  <Link to="/#how">How it works</Link>
  <Link to="/#materials">Materials</Link>
  <Link to="/about">About us</Link>
  <Link to="/contact">Contact</Link>
  {user ? (
    <>
      <Link to="/dashboard">Dashboard</Link>
      <button className="linklike" onClick={handleLogout}>
        Log out
      </button>
    </>
  ) : (
    <Link to="/login">Log in</Link>
  )}
</div>
        <Link to={user ? '/dashboard' : '/register'} className="cta-btn">
          {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign up'}
        </Link>
      </nav>
      <div className="stripe-rule" />
    </header>
  );
}
