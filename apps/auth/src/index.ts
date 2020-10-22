import 'dotenv/config';
import 'reflect-metadata';

import path from 'path';

import createError from 'http-errors';
import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { ConnectionOptions, createConnection } from 'typeorm';
import passport from 'passport';
import session from 'express-session';
import flash from 'connect-flash';
import hbs from 'hbs';
import redis from 'redis';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import Account from './entities/Account.entity';
import Connection from './entities/Connection.entity';
import { isDev } from './constants';
import routes from './routes';

// eslint-disable-next-line
const ormconfig = require('../ormconfig.json') as ConnectionOptions;

// main function
const bootstrap = async () => {
  // Connect to database
  await createConnection({
    ...ormconfig,
    entities: [Account, Connection],
  });

  // setup express server
  const app = express();

  /* Middleware: */

  // CORS
  app.use(cors());

  // logging
  app.use(morgan('dev'));

  // static public folder
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // body support
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // cookie parsing
  app.use(cookieParser(process.env.SESSION_SECRET));

  // initialize session
  let store;
  if (isDev) {
    store = new session.MemoryStore();
  } else {
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();
    store = new RedisStore({ client: redisClient });
  }

  app.use(
    session({
      cookie: {
        httpOnly: true,
        secure: !isDev,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
      store,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      unset: 'destroy',
    }),
  );

  // flash middleware
  app.use(flash());
  app.use((req, res, next) => {
    // Read any flashed errors and save
    // in the response locals
    res.locals.error = req.flash('error_msg');

    // Check for simple error string and
    // convert to layout's expected format
    const errs = req.flash('error');
    for (const key in errs) {
      res.locals.error.push({ message: 'An error occurred', debug: errs[key] });
    }

    next();
  });

  // initialize passport
  passport.serializeUser((user: Account, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: any, done) => {
    const account = await Account.findOne(id);
    done(null, account);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // initialize template engine
  hbs.registerPartials(path.join(__dirname, '..', 'views', 'partials'));
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'hbs');

  // apply routes
  app.use(routes);

  // page not found handler
  app.use((_req, _res, next) => {
    next(createError(404));
  });

  // error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = isDev ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  };

  app.use(errorHandler);

  // get port to listen on
  const port = parseInt(process.env.PORT || '4000', 10);

  // start listening
  app.listen(port, () => {
    // log start
    console.log(`Server started on port ${port}`);
  });
};

bootstrap();
