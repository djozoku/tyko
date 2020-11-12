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
  InputType,
  Field,
} from 'type-graphql';
import { createQueryBuilder } from 'typeorm';
import { UserInputError } from 'apollo-server-express';

import Group from '../group/Group.entity';
import Period from '../period/Period.entity';
import PaginationArgs from '../../utils/PaginationArgs';
import { Context } from '../../utils/GraphQLContext';
import PaginatedResponse from '../../utils/PaginatedResponse';

import Student from './Student.entity';
import EditStudent from './EditStudent.input';
import AddStudent from './AddStudent.input';

@InputType()
class StudentWhereArgs {
  @Field({ nullable: true })
  workplace_id?: string;

  @Field({ nullable: true })
  group_id?: string;

  @Field({ nullable: true })
  teacher_id?: string;
}

@ObjectType()
class PaginatedStudentResponse extends PaginatedResponse(Student) {}

@Resolver(Student)
export default class StudentResolver {
  @Authorized()
  @Query(() => Student, { description: 'Get a student with an ID', nullable: true })
  async student(
    @Arg('id', () => ID, { description: 'ID of the student to get' }) id: string,
  ): Promise<Student | undefined> {
    return Student.findOne(id);
  }

  @Authorized()
  @Query(() => PaginatedStudentResponse, { description: 'Gets all students' })
  async students(
    @Args() { skip, take }: PaginationArgs,
    @Arg('search', () => String, { nullable: true }) search: string,
    @Arg('where', () => StudentWhereArgs, { nullable: true }) where: StudentWhereArgs,
  ): Promise<PaginatedStudentResponse> {
    const queryBuilder = createQueryBuilder(Student).select().where('1 = 1');
    if (where.workplace_id || where.teacher_id) {
      let periods: Period[] = [];
      if (where.workplace_id) {
        periods = await Period.find({ where: { workplace_id: where.workplace_id } });
      } else if (where.teacher_id) {
        periods = await Period.find({ where: { teacher_id: where.teacher_id } });
      }
      const now = Date.now();
      const filtered = periods.filter((period) => period.end_date.getTime() > now);
      if (filtered.length === 0) {
        return {
          items: [],
          total: 0,
          hasMore: false,
        };
      }
      queryBuilder.andWhere('id IN (:...ids)', { ids: filtered.map((p) => p.student_id) });
    }
    if (where.group_id) {
      queryBuilder.andWhere('group_id = :id', { id: parseInt(where.group_id, 10) });
    }
    if (search) {
      queryBuilder
        .andWhere('name_search_doc @@ to_tsquery(:query)', { query: `${search}:*` })
        .orderBy('ts_rank(name_search_doc, to_tsquery(:query))', 'DESC');
    }
    const [items, count] = await queryBuilder.skip(skip).take(take).getManyAndCount();
    return {
      items,
      total: count,
      hasMore: count - skip - take > 0,
    };
  }

  @Authorized()
  @Mutation(() => Student, { description: "Add a new student's data" })
  async addStudent(
    @Arg('student') student: AddStudent,
    @Ctx() { user }: Context,
  ): Promise<Student> {
    if (user?.type !== 'student') throw new Error('Teachers cannot add students');
    const existing = await Student.findOne({ where: { user_id: user?.uid } });
    if (existing) throw new Error(`A student with user ID "${user?.uid}" already exists`);

    const errors: Partial<AddStudent> = {};

    if (student.name.trim() === '') errors.name = "Name can't be empty";
    if (student.group_id.trim() === '') errors.group_id = "Description can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

    return Student.create({
      ...student,
      user_id: parseInt(user?.uid as string, 10),
      group_id: parseInt(student.group_id, 10),
    }).save();
  }

  @Authorized('teacher', 'student')
  @Mutation(() => Student, { description: "Edit an existing student's data" })
  async editStudent(
    @Arg('id', () => ID, { description: 'ID of the student to edit' }) id: string,
    @Arg('edit', { description: 'Edited data' }) edit: EditStudent,
    @Ctx() { user, student: cStudent }: Context,
  ): Promise<Student> {
    const student = await Student.findOne(id);
    if (!student) throw new Error('Student was not be found');
    if (user?.type === 'student' && student.id !== cStudent?.id)
      throw new Error("A student cannot edit other student's data");

    const errors: Partial<EditStudent> = {};

    if (edit.name?.trim() === '') errors.name = "Name can't be empty";
    if (edit.group_id?.trim() === '') errors.name = "Group can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

    if (edit.name) student.name = edit.name;
    if (edit.group_id) student.group_id = parseInt(edit.group_id, 10);

    return student.save();
  }

  // TODO: don't delete if has relations
  // TODO: delete multiple
  @Authorized('teacher')
  @Mutation(() => Boolean, { description: 'Delete an existing student' })
  async deleteStudent(
    @Arg('id', () => ID, { description: 'ID of the student to delete' }) id: string,
  ): Promise<true> {
    const student = await Student.findOne(id);
    if (!student) throw new Error(`A student could not be found with ID: "${id}"`);

    await student.remove();
    return true;
  }

  @FieldResolver(() => Group)
  async group(@Root() parent: Student): Promise<Group> {
    return Group.findOneOrFail(parent.group_id);
  }

  @FieldResolver(() => [Period])
  async periods(@Root() parent: Student): Promise<Period[]> {
    return Period.find({ where: { student_id: parent.id } });
  }
}
