import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="stack">
      <h1>Lost something?</h1>
      <p>Search items our staff have found, or tell us what you lost and we will notify you if it turns up.</p>
      <Link className="primary btn" to="/search">Search found items</Link>
      <Link className="btn" to="/report">Report a lost item</Link>
    </div>
  );
}
