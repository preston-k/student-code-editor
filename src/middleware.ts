import { auth } from '@/lib/auth/server';

export default auth.middleware({ loginUrl: '/auth/sign-in' });

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|auth|serve|api/auth|api/serve).*)',
  ],
};
