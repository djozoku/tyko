import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { AuthChecker } from 'type-graphql';
import jwt from 'jsonwebtoken';

import Student from '../modules/student/Student.entity';
import Teacher from '../modules/teacher/Teacher.entity';
import User from '../modules/me/User.type';

export interface Context extends ExpressContext {
  user?: User;
  student?: Student;
  teacher?: Teacher;
}

interface TokenUser extends User {
  iss: string;
  exp: number;
}

export type ContextFunction = (context: ExpressContext) => Promise<Context>;

export const context: ContextFunction = async (ctx) => {
  const { req } = ctx;

  try {
    const authHeader = req.headers.authorization ?? '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') return ctx;

    const user = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.AUTH_SERVER,
    }) as TokenUser;

    if (user.type === 'student') {
      const student = await Student.findOne({ where: { user_id: user.uid } });
      if (student) return { ...ctx, user, student };
    } else if (user.type === 'teacher') {
      const teacher = await Teacher.findOne({ where: { user_id: user.uid } });
      if (teacher) return { ...ctx, user, teacher };
    }

    return { ...ctx, user };
  } catch (err) {
    return ctx;
  }
};

export type Roles = 'teacher' | 'student';

export const authChecker: AuthChecker<Context, Roles> = ({ context: { user } }, roles) => {
  if (!user) return false;
  return roles.length > 0 ? roles.some((role) => role === user.type) : true;
};
