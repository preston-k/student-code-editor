'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUpWithEmail } from '@/app/auth/sign-up/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpWithEmail, null);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-2 text-muted">Join Spark and start building</p>
      </div>

      <Card className="w-full max-w-sm">
        <form action={action} className="space-y-4">
          <Input
            label="Your name"
            name="name"
            placeholder="Alex"
            autoFocus
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
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
            <i className="bi bi-person-plus" aria-hidden="true" />
            {pending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
