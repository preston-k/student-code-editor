import { auth } from '@/lib/auth/server';

export async function requireUserId(): Promise<string> {
  const { data, error } = await auth.getSession();
  if (error || !data?.session?.userId) throw new Error('Unauthorized');
  return data.session.userId;
}
