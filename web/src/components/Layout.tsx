import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">Lost &amp; Found</Link>
        <nav>
          <Link to="/search">Search</Link>
          <Link to="/report">Lost something?</Link>
          {user && <Link to="/staff">Staff</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          <Link to="/outbox">Outbox</Link>
          {user ? <button className="link" onClick={logout}>Log out</button> : <Link to="/login">Staff login</Link>}
        </nav>
      </header>
      <main className="page"><Outlet /></main>
    </>
  );
}
