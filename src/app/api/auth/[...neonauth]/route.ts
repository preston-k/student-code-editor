import { auth } from '@/lib/auth/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { GET, POST } = auth.handler() as any;
