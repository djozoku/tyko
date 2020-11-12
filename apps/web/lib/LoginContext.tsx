import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

import { MeQuery, useMeLazyQuery } from '../gql/me.graphql';

import { setToken } from './token';

export type User = MeQuery['me'];

export interface LoginStatus {
  loggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
  register: () => void;
  setComplete: () => void;
  loggedInPromise: () => Promise<void>;
  completed: boolean;
}

const url = `${process.env.NEXT_PUBLIC_AUTH_SERVER}/auth`;
if (typeof window !== 'undefined') {
  (window as any).getToken = () => {
    fetch(`${url}/token`, {
      credentials: 'include',
    })
      .then((data) => data.json())
      .then((json) => {
        const { token } = json;
        console.log(token);
      });
  };
}

export const LoginContext = (React.createContext({}) as unknown) as React.Context<LoginStatus>;

export let opened: Window | null = null;

type LoginHandler = () => void;

class LoginObserver {
  handlers: LoginHandler[] = [];
  notified = false;

  onLogin(handler: LoginHandler) {
    if (this.notified) {
      handler();
    } else {
      this.handlers.push(handler);
    }
  }

  notify() {
    this.handlers.forEach((handler) => handler());
    this.handlers = [];
    this.notified = true;
  }
}

const loginObserver = new LoginObserver();

export const LoginProvider: React.FC = ({ children }) => {
  const router = useRouter();
  const apollo = useApolloClient();
  const [fetchUser, { data, loading, error }] = useMeLazyQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [completed, setCompleted] = useState(true);

  const loggedInPromise = () =>
    new Promise<void>((resolve) => {
      loginObserver.onLogin(resolve);
    });

  useEffect(() => {
    const loggedIn = (token: string) => {
      fetch('/api/login', { headers: { authorization: `Bearer ${token}` } }).then(() => {
        setLoggedIn(true);
        loginObserver.notify();
        setToken(token);
        fetchUser();
      });
    };
    const listener = (e: MessageEvent) => {
      if (e.origin === process.env.NEXT_PUBLIC_AUTH_SERVER) {
        const [info, token] = e.data.split(',');
        if (info === 'loggedin') {
          loggedIn(token);
          opened?.close();
        } else {
          setLoggedIn(false);
          setToken('');
          opened?.close();
        }
      }
    };
    fetch(`${url}/token`, {
      credentials: 'include',
    })
      .then((data) => data.json())
      .then((json) => {
        const { error, token } = json;
        if (error) {
          return;
        }
        loggedIn(token);
      });
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  useEffect(() => {
    if (error) {
      setUser(null);
      setLoggedIn(false);
      setToken('');
    }
    if (data?.me) {
      const { teacher, student } = data.me;
      if (!teacher && !student) {
        setCompleted(false);
      }
      setUser(data.me);
    }
  }, [data, loading, error]);

  const open = (path: string) => {
    const width = 500;
    const height = 700;
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;
    opened = window.open(
      `${url}/${path}`,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  const login = () => {
    open('login');
  };

  const logout = async () => {
    router.push('/');
    await fetch('/api/logout');
    const data = await fetch(`${url}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    const json = await data.json();
    console.log(json);
    setLoggedIn(false);
    setUser(null);
    setToken('');
    await apollo.resetStore();
  };

  const register = () => {
    open('register');
  };

  const setComplete = () => {
    setCompleted(true);
  };

  return (
    <LoginContext.Provider
      value={{ loggedIn, login, logout, register, user, completed, setComplete, loggedInPromise }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  return useContext(LoginContext);
};
