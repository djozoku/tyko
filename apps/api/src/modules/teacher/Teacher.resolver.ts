import {
  Resolver,
  Mutation,
  Arg,
  ID,
  Query,
  FieldResolver,
  Root,
  Authorized,
  Args,
  Ctx,
  ObjectType,
} from 'type-graphql';
import { createQueryBuilder } from 'typeorm';
import { UserInputError } from 'apollo-server-express';

import Period from '../period/Period.entity';
import PaginationArgs from '../../utils/PaginationArgs';
import { Context } from '../../utils/GraphQLContext';
import PaginatedResponse from '../../utils/PaginatedResponse';

import Teacher from './Teacher.entity';
import EditTeacher from './EditTeacher.input';
import AddTeacher from './AddTeacher.input';

@ObjectType()
class PaginatedTeacherResponse extends PaginatedResponse(Teacher) {}

@Resolver(Teacher)
export default class TeacherResolver {
  @Authorized()
  @Query(() => Teacher, { description: 'Gets a teacher by an ID', nullable: true })
  async teacher(
    @Arg('id', () => ID, { description: 'ID of the teacher to get' }) id: string,
  ): Promise<Teacher | undefined> {
    return Teacher.findOne(id);
  }

  @Authorized()
  @Query(() => PaginatedTeacherResponse, { description: 'Gets all teachers' })
  async teachers(
    @Args() { skip, take }: PaginationArgs,
    @Arg('search', () => String, { nullable: true }) search: string,
  ): Promise<PaginatedTeacherResponse> {
    if (search) {
      const [items, count] = await createQueryBuilder(Teacher)
        .select()
        .where('name_search_doc @@ to_tsquery(:query)', { query: `${search}:*` })
        .orderBy('ts_rank(name_search_doc, to_tsquery(:query))', 'DESC')
        .skip(skip)
        .take(take)
        .getManyAndCount();
      return {
        items,
        total: count,
        hasMore: count - skip - take > 0,
      };
    }
    const [items, count] = await Teacher.findAndCount({ skip, take });
    return {
      items,
      total: count,
      hasMore: count - skip - take > 0,
    };
  }

  @Authorized()
  @Mutation(() => Teacher, { description: "Adds a new teacher's data" })
  async addTeacher(
    @Arg('teacher') teacher: AddTeacher,
    @Ctx() { user }: Context,
  ): Promise<Teacher> {
    if (user?.type !== 'teacher') throw new Error('Students cannot add teachers');
    const existing = await Teacher.findOne({ where: { user_id: user?.uid } });
    if (existing) throw new Error(`A teacher with user ID "${user?.uid}" already exists`);

    const errors: Partial<AddTeacher> = {};

    if (teacher.name.trim() === '') errors.name = "Name can't be empty";
    if (teacher.phone.trim() === '') errors.phone = "Phone number can't be empty";
    if (teacher.email.trim() === '') errors.email = "Email can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

    return Teacher.create({
      ...teacher,
      user_id: parseInt(user?.uid as string, 10),
    }).save();
  }

  @Authorized('teacher')
  @Mutation(() => Teacher, { description: "Edit current teacher's data" })
  async editTeacher(
    @Arg('edit', { description: 'Edited data' }) edit: EditTeacher,
    @Ctx() { teacher }: Context,
  ): Promise<Teacher> {
    const errors: Partial<EditTeacher> = {};

    if (!teacher) throw new Error(`Teacher was not be found`);

    if (edit.name?.trim() === '') errors.name = "Name can't be empty";
    if (edit.phone?.trim() === '') errors.phone = "Phone number can't be empty";
    if (edit.email?.trim() === '') errors.email = "Email can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

    if (edit.name) teacher.name = edit.name;
    if (edit.phone) teacher.phone = edit.phone;
    if (edit.email) teacher.email = edit.email;

    return teacher.save();
  }

  // TODO: don't delete if has relations
  // TODO: delete multiple
  @Authorized('teacher')
  @Mutation(() => Boolean, { description: 'Delete an existing teacher' })
  async deleteTeacher(
    @Arg('id', () => ID, { description: 'ID of the teacher to delete' }) id: string,
  ): Promise<true> {
    const teacher = await Teacher.findOne(id);
    if (!teacher) throw new Error(`A teacher could not be found with ID: "${id}"`);

    await teacher.remove();
    return true;
  }

  @Authorized('teacher')
  @FieldResolver(() => [Period])
  async periods(@Root() parent: Teacher): Promise<Period[]> {
    return Period.find({ where: { teacher_id: parent.id } });
  }
}
