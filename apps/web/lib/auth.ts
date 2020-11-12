import { IncomingMessage } from 'http';

import Iron from '@hapi/iron';
import { NextApiResponse } from 'next';

import { MAX_AGE, setTokenCookie, getTokenCookie } from './cookie';

const TOKEN_SECRET = process.env.TOKEN_SECRET;

interface Session {
  token: string;
}

interface ResponseSession extends Session {
  createdAt: number;
  maxAge: number;
}

export async function setLoginSession(res: NextApiResponse, session: Session) {
  const createdAt = Date.now();
  // Create a session object with a max age that we can validate later
  const obj = { ...session, createdAt, maxAge: MAX_AGE };
  const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);

  setTokenCookie(res, token);
}

export async function getLoginSession(req: IncomingMessage): Promise<ResponseSession | null> {
  const token = getTokenCookie(req);

  if (!token) return null;

  const session: ResponseSession = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  const expiresAt = session.createdAt + session.maxAge * 1000;

  // Validate the expiration date of the session
  if (Date.now() < expiresAt) {
    return session;
  }

  return null;
}
