'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  expired: 'That sign-in link has expired — please request a new one below.',
  used: 'That sign-in link has already been used — please request a new one below.',
  invalid: 'That sign-in link isn’t valid — please request a new one below.',
};

export default function LoginForm({
  role,
  title,
  subtitle,
  askName = false,
  initialError = '',
}: {
  role: 'admin' | 'champion';
  title: string;
  subtitle: string;
  askName?: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(initialError ? ERROR_MESSAGES[initialError] || '' : '');
  const [busy, setBusy] = useState(false);

  // Admin defaults to the magic-link flow; the shared password is a fallback.
  const [usePassword, setUsePassword] = useState(false);
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState('');
  const [devLink, setDevLink] = useState('');

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, password, name }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Login failed.');
      setBusy(false);
    }
  }

  async function submitMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setDevLink('');
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(body.error || 'Could not send the link — please try again.');
      return;
    }
    setLinkSent(body.message || 'Check your email for a sign-in link.');
    if (body.devLink) setDevLink(body.devLink);
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={role === 'admin' && !usePassword ? submitMagicLink : submitPassword}
        className="animate-pop-in w-full max-w-sm rounded-blob bg-white border border-ink/5 shadow-lift p-8"
      >
        <div className="text-center">
          <span className="text-5xl">🐿️</span>
          <h1 className="mt-3 text-2xl font-extrabold text-indigo">{title}</h1>
          <p className="mt-1 text-sm text-ink/55">{subtitle}</p>
        </div>
        {error && (
          <div className="mt-5 rounded-xl bg-plum/10 border border-plum/30 px-4 py-2.5 text-sm font-bold text-plum">
            {error}
          </div>
        )}

        {role === 'admin' && !usePassword ? (
          linkSent ? (
            <div className="mt-5 rounded-xl bg-teal/10 border border-teal/25 px-4 py-3 text-sm font-bold text-teal">
              {linkSent}
              {devLink && (
                <div className="mt-2 text-xs font-normal text-ink/60 break-all">
                  No SMTP configured yet, so here’s the link for testing:{' '}
                  <a className="text-pink underline" href={devLink}>
                    {devLink}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <label className="field-label" htmlFor="login-email">Your email</label>
              <input
                id="login-email"
                type="email"
                required
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@possabilities.org.uk"
                autoFocus
              />
              <p className="mt-2 text-xs text-ink/45">We’ll email you a one-tap sign-in link — no password needed.</p>
            </div>
          )
        ) : (
          <>
            {askName && (
              <div className="mt-5">
                <label className="field-label" htmlFor="login-name">Your name</label>
                <input
                  id="login-name"
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Shown next to check-ins"
                />
              </div>
            )}
            <div className="mt-5">
              <label className="field-label" htmlFor="login-password">
                {role === 'champion' ? 'Team PIN' : 'Password'}
              </label>
              <input
                id="login-password"
                type="password"
                inputMode={role === 'champion' ? 'numeric' : undefined}
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
          </>
        )}

        {!linkSent && (
          <button type="submit" disabled={busy} className="btn-primary w-full mt-6 disabled:opacity-60">
            {busy ? 'Please wait…' : role === 'admin' && !usePassword ? 'Email me a sign-in link' : 'Sign in'}
          </button>
        )}

        {role === 'admin' && (
          <button
            type="button"
            onClick={() => {
              setUsePassword((v) => !v);
              setError('');
              setLinkSent('');
              setDevLink('');
            }}
            className="mt-4 w-full text-center text-xs font-bold text-ink/40 hover:text-ink/60"
          >
            {usePassword ? '← Use a magic link instead' : 'Use the master password instead'}
          </button>
        )}
      </form>
    </main>
  );
}
