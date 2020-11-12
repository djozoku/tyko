import { NextApiHandler } from 'next';

import { setLoginSession } from '../../lib/auth';

const handler: NextApiHandler = async (req, res) => {
  const { authorization } = req.headers;

  const errorFunc = () => {
    res.status(400).json({ error: 'Invalid authorization header' });
  };

  if (!authorization) {
    errorFunc();
    return;
  }

  const auth = authorization.split(' ');

  if (auth.length < 2 || auth.length > 2 || auth[0] !== 'Bearer') {
    errorFunc();
    return;
  }

  await setLoginSession(res, { token: auth[1] });

  res.status(200).json({ ok: true });
};

export default handler;
