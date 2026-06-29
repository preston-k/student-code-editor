import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'spark_student';

export async function getStudentName(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function requireStudentName(): Promise<string> {
  const name = await getStudentName();
  if (!name) {
    throw new Error('Unauthorized');
  }
  return name;
}
