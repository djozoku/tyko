import { Router } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import { providers } from '../auth/providers';
import Account from '../entities/Account.entity';

const router = Router();

for (const provider of providers) {
  router.use(`/${provider.name.toLowerCase()}`, provider.router);
}

router.get('/login', (_req, res) => {
  res.render('login');
});

router.get('/register', (_req, res) => {
  res.redirect('/auth/microsoft/login');
});

router.get(
  '/token',
  cors({ credentials: true, origin: [process.env.HOST_ADDRESS, process.env.FRONTEND_URL] }),
  async (req, res) => {
    const uid = req.session?.userId;
    if (!uid) {
      res.json({ error: 'Not Logged In' });
      return;
    }
    const account = await Account.findOneOrFail(uid);
    const token = jwt.sign(
      {
        uid,
        type: account.type,
        name: account.name,
        email: account.email,
        avatar: account.avatar,
      },
      process.env.JWT_SECRET,
      {
        issuer: process.env.HOST_ADDRESS,
        expiresIn: '1d',
      },
    );
    res.json({ token });
  },
);

router.get('/loggedin', (_req, res) => {
  res.locals.origin = process.env.FRONTEND_URL;
  res.render('logged_in');
});

router.get('/cancel', (_req, res) => {
  res.locals.origin = process.env.FRONTEND_URL;
  res.render('cancel');
});

router.get('/logout', (req, res) => {
  req.session?.destroy(() => {
    req.logout();
    res.redirect('/auth/cancel');
  });
});

router.post(
  '/logout',
  cors({ credentials: true, origin: [process.env.HOST_ADDRESS, process.env.FRONTEND_URL] }),
  (req, res) => {
    req.session?.destroy(() => {
      req.logout();
      res.json({ loggedout: true });
    });
  },
);

export default router;
