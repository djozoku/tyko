import { Authorized, Ctx, FieldResolver, Query, Resolver } from 'type-graphql';

import { Context } from '../../utils/GraphQLContext';
import Student from '../student/Student.entity';
import Teacher from '../teacher/Teacher.entity';

import User from './User.type';

@Resolver(User)
export default class MeResolver {
  @Authorized()
  @Query(() => User, { nullable: true })
  async me(@Ctx() { user }: Context): Promise<User | undefined> {
    return user;
  }

  @FieldResolver(() => Student, { nullable: true })
  async student(@Ctx() { student }: Context): Promise<Student | undefined> {
    return student;
  }

  @FieldResolver(() => Teacher, { nullable: true })
  async teacher(@Ctx() { teacher }: Context): Promise<Teacher | undefined> {
    return teacher;
  }
}
