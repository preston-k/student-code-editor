import { redirect } from 'next/navigation';
import { getStudentName } from '@/lib/session';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const studentName = await getStudentName();

  if (!studentName) {
    redirect('/');
  }

  return <DashboardClient studentName={studentName} />;
}
