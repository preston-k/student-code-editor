'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';

export function SignInForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      setError('Please enter your name to continue');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Spark</h1>
        <p className="mt-2 text-muted">Sign in to continue</p>
      </div>

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your name"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
            <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
            {loading ? 'Signing in...' : 'Continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
