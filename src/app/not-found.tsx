import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
      <Logo size="lg" />
      <h1 className="mt-6 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted">This page doesn&apos;t exist.</p>
      <Link href="/dashboard" className="mt-6 cursor-pointer">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
