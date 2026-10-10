import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Alert } from '../components/m3/Alert';
import { Button } from '../components/m3/Button';
import { Card } from '../components/m3/Card';
import { Icon } from '../components/m3/Icon';
import { TextField } from '../components/m3/TextField';
import './Login.css';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('staff@venue.test');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      // Back to the page that required login, else the role's home: admins land on the dashboard.
      nav(from ?? (u.role === 'admin' ? '/admin' : '/staff'), { replace: true });
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="app-page login">
      <Card variant="outlined" className="login-card">
        <form onSubmit={submit} className="md-stack md-stack--lg">
          <div className="login-head">
            <span className="login-head__icon" aria-hidden="true"><Icon name="badge" size={28} /></span>
            <h1 className="login-head__title">Staff login</h1>
            <p className="login-head__sub">Sign in to log found items, review claims and release pickups.</p>
          </div>
          <div className="md-stack">
            <TextField label="Email" type="email" value={email} onChange={setEmail} required leadingIcon="mail" autoComplete="username" />
            <TextField label="Password" type="password" value={password} onChange={setPassword} required leadingIcon="lock" autoComplete="current-password" />
          </div>
          {error && <Alert kind="error">{error}</Alert>}
          <Button type="submit" size="large" full disabled={busy}>Log in</Button>
        </form>
      </Card>
    </div>
  );
}
