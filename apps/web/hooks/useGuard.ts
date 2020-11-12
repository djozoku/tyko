import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useLogin } from '../lib/LoginContext';

export const useGuard = () => {
  const router = useRouter();
  const { loggedIn, completed } = useLogin();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timeout = setTimeout(() => {
        if (!loggedIn && router.pathname !== '/') {
          router.push('/');
        }
        if (loggedIn && !completed && router.pathname !== '/account/complete') {
          router.push('/account/complete');
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [loggedIn, completed, router]);
};
