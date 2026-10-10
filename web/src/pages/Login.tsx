import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/staff';
  const [email, setEmail] = useState('staff@venue.test');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    try { await login(email, password); nav(from, { replace: true }); } catch (err) { setError((err as Error).message); }
  }

  return (
    <form onSubmit={submit} className="card narrow">
      <h1>Staff login</h1>
      <label className="field"><span>Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></label>
      <label className="field"><span>Password</span><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></label>
      {error && <p className="error">{error}</p>}
      <button className="primary">Log in</button>
    </form>
  );
}
