import { redirect } from 'next/navigation';
import { getStudentName } from '@/lib/session';
import { SignInForm } from '@/components/auth/SignInForm';

export default async function HomePage() {
  const studentName = await getStudentName();

  if (studentName) {
    redirect('/dashboard');
  }

  return <SignInForm />;
}
