'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentName } from '@/lib/client-storage';
import { SignInForm } from '@/components/auth/SignInForm';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (getStudentName()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return <SignInForm />;
}
