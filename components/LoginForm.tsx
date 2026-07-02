'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({
  role,
  title,
  subtitle,
  askName = false,
}: {
  role: 'admin' | 'champion';
  title: string;
  subtitle: string;
  askName?: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
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

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="animate-pop-in w-full max-w-sm rounded-blob bg-white border border-ink/5 shadow-lift p-8"
      >
        <div className="text-center">
          <span className="text-5xl">🐿️</span>
          <h1 className="mt-3 text-2xl font-extrabold text-brand-deep">{title}</h1>
          <p className="mt-1 text-sm text-ink/55">{subtitle}</p>
        </div>
        {error && (
          <div className="mt-5 rounded-xl bg-acorn/10 border border-acorn/30 px-4 py-2.5 text-sm font-bold text-acorn">
            {error}
          </div>
        )}
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
        <button type="submit" disabled={busy} className="btn-primary w-full mt-6 disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
