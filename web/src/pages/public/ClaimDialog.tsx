import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Alert } from '../../components/m3/Alert';
import { Dialog } from '../../components/m3/Dialog';
import { TextField } from '../../components/m3/TextField';
import type { PublicItem } from './FoundItemCard';

/**
 * "This is mine": asks for an email, starts a claim on the item and opens its verification questions.
 * The server also emails the claim link (Outbox), so the visitor can come back to it.
 */
export function ClaimDialog({ item, onClose }: { item: PublicItem | null; onClose: () => void }) {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { setError(''); }, [item]);

  async function start() {
    if (!item || busy) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    setBusy(true);
    setError('');
    try {
      const { token } = await api.post<{ token: string }>(`/public/items/${item.id}/claims`, { contactEmail: email.trim() });
      nav(`/claim/${token}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={item !== null}
      title="Is this yours?"
      icon="verified"
      confirmLabel={busy ? 'Starting…' : 'Show questions'}
      onConfirm={start}
      onClose={onClose}
    >
      <p>
        To prove this {item?.categoryLabel.toLowerCase()} is yours, you will answer a few questions about details only the owner
        would know. Staff then check your answers.
      </p>
      <TextField label="Your email" type="email" value={email} onChange={(v) => { setEmail(v); setError(''); }} required leadingIcon="mail"
        autoComplete="email" supportingText="We email you the claim link and the result." />
      {error && <Alert kind="error">{error}</Alert>}
    </Dialog>
  );
}
