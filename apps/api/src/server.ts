import 'dotenv/config';
import 'reflect-metadata';

import path from 'path';

import createError from 'http-errors';
import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { ConnectionOptions, createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import morgan from 'morgan';

import { context, authChecker } from './utils/GraphQLContext';
import Group from './modules/group/Group.entity';
import Period from './modules/period/Period.entity';
import Student from './modules/student/Student.entity';
import Supervisor from './modules/supervisor/Supervisor.entity';
import Teacher from './modules/teacher/Teacher.entity';
import Workplace from './modules/workplace/Workplace.entity';
import { isDev } from './constants';
import Address from './modules/address/Address.entity';

// eslint-disable-next-line
const ormconfig = require('../ormconfig.json') as ConnectionOptions;

// main function
export const bootstrap = async (): Promise<void> => {
  // Connect to database
  await createConnection({
    ...ormconfig,
    entities: [Group, Period, Student, Supervisor, Teacher, Workplace, Address],
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

  // json body support
  app.use(express.json());

  // graphql schema
  const schema = await buildSchema({
    resolvers: [path.join(__dirname, 'modules', '*', '*.resolver.*')],
    validate: false,
    authChecker,
  });

  // setup apollo server
  const server = new ApolloServer({
    schema,
    context,
    playground: true,
    introspection: true,
  });

  // apply apollo server to express
  server.applyMiddleware({ app, cors: false, path: '/api/graphql' });

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
    res.json({
      error: {
        message: err.message,
        full: isDev ? err : {},
      },
    });
  };

  app.use(errorHandler);

  // get port to listen on
  const port = parseInt(process.env.PORT || '5000', 10);

  // start listening
  app.listen(port, () => {
    // log start
    console.log(`Server started on port ${port}`);
  });
};
