import { auth } from '@/lib/auth/server';

export default auth.middleware({ loginUrl: '/auth/sign-in' });

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|auth|p|api/auth|api/serve).*)',
  ],
};
