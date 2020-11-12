import { NextApiHandler } from 'next';

import { removeTokenCookie } from '../../lib/cookie';

const handler: NextApiHandler = (_req, res) => {
  removeTokenCookie(res);

  res.status(200).json({ ok: true });
};

export default handler;
