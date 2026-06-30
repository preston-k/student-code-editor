'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await authClient.signIn.email({ email, password });

    if (authError) {
      setError(authError.message ?? 'Sign in failed. Check your credentials.');
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
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          No account?{' '}
          <Link href="/auth/sign-up" className="font-medium text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
