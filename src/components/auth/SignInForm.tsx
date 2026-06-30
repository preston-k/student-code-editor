'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signInWithEmail } from '@/app/auth/sign-in/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';

export function SignInForm() {
  const [state, action, pending] = useActionState(signInWithEmail, null);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-accent">Spark</h1>
        <p className="mt-2 text-muted">Sign in</p>
      </div>

      <Card className="w-full max-w-sm">
        <form action={action} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoFocus
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          No account?{' '}
          <Link href="/auth/sign-up" className="cursor-pointer font-medium text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
