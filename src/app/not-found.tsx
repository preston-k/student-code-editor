import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-accent">Spark</h1>
      </div>

      <Card className="w-full max-w-sm text-center">
        <p className="text-5xl font-semibold tracking-tight text-accent">404</p>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link href="/dashboard" className="mt-6 block cursor-pointer">
          <Button variant="primary" className="w-full">
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Back to dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}
