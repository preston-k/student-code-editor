'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await authClient.signUp.email({
      email,
      password,
      name: name.trim(),
    });

    if (authError) {
      setError(authError.message ?? 'Sign up failed. Try again.');
      setLoading(false);
      return;
    }

    if (data?.user && !data.user.emailVerified) {
      setStep('verify');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await authClient.emailOtp.verifyEmail({ email, otp });

    if (authError) {
      setError(authError.message ?? 'Verification failed. Check your code.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  if (step === 'verify') {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="mt-2 text-muted">Enter the code sent to {email}</p>
        </div>
        <Card className="w-full max-w-sm">
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="Verification code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoFocus
              required
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify email'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-2 text-muted">Join Spark and start building</p>
      </div>

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            label="Your name"
            placeholder="Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            <i className="bi bi-person-plus" aria-hidden="true" />
            {loading ? 'Creating account…' : 'Create account'}
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
