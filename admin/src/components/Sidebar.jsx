import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        TOLLY<span>WALA</span>
      </div>
      <span className="tag">Admin panel</span>

      <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
        Dashboard
      </NavLink>
      <NavLink to="/materials" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
        Materials & rates
      </NavLink>
      <NavLink to="/bookings" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
        Bookings
      </NavLink>
      <NavLink to="/users" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
        Users
      </NavLink>

      <div className="sidebar-footer">
        <div className="who">{user?.name} · {user?.email}</div>
        <button className="btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
