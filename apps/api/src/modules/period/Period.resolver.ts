import { Resolver, Mutation, Arg, ID, FieldResolver, Root, Authorized, Ctx } from 'type-graphql';
import { UserInputError } from 'apollo-server-express';

import Student from '../student/Student.entity';
import Workplace from '../workplace/Workplace.entity';
import Teacher from '../teacher/Teacher.entity';
import Supervisor from '../supervisor/Supervisor.entity';
import { Context } from '../../utils/GraphQLContext';

import EditPeriod from './EditPeriod.input';
import AddPeriod from './AddPeriod.input';
import Period from './Period.entity';

@Resolver(Period)
export default class PeriodResolver {
  @Authorized('teacher', 'student')
  @Mutation(() => Period, { description: 'Adds a new period to the database' })
  async addPeriod(
    @Arg('period', { description: "New period's data" })
    period: AddPeriod,
    @Arg('id', () => ID, { description: 'ID of student to add period to' }) id: string,
    @Ctx()
    { student }: Context,
  ): Promise<Period> {
    if (student && student.id !== parseInt(id, 10))
      throw new Error('A Student cannot add a period to another student');
    const existing = await Period.findOne({
      where: { student_id: id, start_date: period.start_date },
    });
    if (existing) throw new Error(`Period is already in the database`);

    const errors: Partial<{ [key in keyof AddPeriod]: string }> = {};

    if (period.workplace_id === '') errors.workplace_id = "Workplace can't be empty";
    if (period.teacher_id === '') errors.teacher_id = "Teacher can't be empty";
    if (period.supervisor_id === '') errors.supervisor_id = "Supervisor can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

    return Period.create({
      ...period,
      student_id: parseInt(id, 10),
      workplace_id: parseInt(period.workplace_id, 10),
      teacher_id: parseInt(period.teacher_id, 10),
      supervisor_id: parseInt(period.supervisor_id, 10),
    }).save();
  }

  @Authorized('teacher', 'student')
  @Mutation(() => Period, { description: "Edit an existing period's data" })
  async editPeriod(
    @Arg('id', () => ID, { description: 'ID of the period to edit' }) id: string,
    @Arg('edit', { description: 'Edited data' }) edit: EditPeriod,
    @Ctx() { user, student }: Context,
  ): Promise<Period> {
    const period = await Period.findOne(id);
    if (!period) throw new Error(`A period could not be found with ID: "${id}"`);
    if (user?.type === 'student' && period.student_id !== student?.id)
      throw new Error("A student cannot edit other student's data");

    const errors: Partial<{ [key in keyof EditPeriod]: string }> = {};

    if (edit.workplace_id === '') errors.workplace_id = "Workplace can't be empty";
    if (edit.teacher_id === '') errors.teacher_id = "Teacher can't be empty";
    if (edit.supervisor_id === '') errors.supervisor_id = "Supervisor can't be empty";

    if (Object.keys(errors).length > 0) {
      throw new UserInputError('Invalid arguments', errors);
    }

    if (edit.start_date) period.start_date = edit.start_date;
    if (edit.end_date) period.end_date = edit.end_date;
    if (edit.workplace_id) period.workplace_id = parseInt(edit.workplace_id, 10);
    if (edit.teacher_id) period.teacher_id = parseInt(edit.teacher_id, 10);
    if (edit.supervisor_id) period.supervisor_id = parseInt(edit.supervisor_id, 10);

    return period.save();
  }

  @Authorized('teacher')
  @Mutation(() => Boolean, { description: 'Delete an existing period' })
  async deletePeriod(
    @Arg('id', () => ID, { description: 'ID of the period to delete' }) id: string,
  ): Promise<true> {
    const period = await Period.findOne(id);
    if (!period) throw new Error(`A period could not be found with ID: "${id}"`);

    await period.remove();
    return true;
  }

  @FieldResolver(() => Student)
  async student(@Root() parent: Period): Promise<Student> {
    return Student.findOneOrFail(parent.student_id);
  }

  @FieldResolver(() => Workplace)
  async workplace(@Root() parent: Period): Promise<Workplace> {
    return Workplace.findOneOrFail(parent.workplace_id);
  }

  @FieldResolver(() => Teacher)
  async teacher(@Root() parent: Period): Promise<Teacher> {
    return Teacher.findOneOrFail(parent.teacher_id);
  }

  @FieldResolver(() => Supervisor)
  async supervisor(@Root() parent: Period): Promise<Supervisor> {
    return Supervisor.findOneOrFail(parent.supervisor_id);
  }
}
